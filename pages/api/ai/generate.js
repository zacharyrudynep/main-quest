import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { checkBanned, logUserIp } from "../../../lib/bans";
import { containsCrisisSignal, CRISIS_MESSAGE } from "../../../lib/crisisCheck";

// ── Server-side Gemini proxy for AI Apply / AI Email ──────────────────────────
// Keeps the Gemini key server-only. Requires a signed-in user (blocks anonymous
// quota abuse), rejects banned users/IPs, and refuses to draft over content that
// signals a personal crisis. Mirrors the multi-model fallback used by tailor-resume.
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const CANDIDATES = ["gemini-flash-latest", "gemini-2.5-flash-lite", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-2.5-flash"];
let cachedModel = null;

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function callModel(model, payload) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(GEMINI_KEY)}`;
  for (let attempt = 0; attempt < 2; attempt++) {
    let r;
    try { r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); }
    catch (e) { if (attempt === 1) return { kind: "busy" }; await sleep(600 * (attempt + 1)); continue; }
    const data = await r.json().catch(() => ({}));
    if (r.status === 429 || r.status === 503) { if (attempt === 1) return { kind: "busy" }; await sleep(600 * (attempt + 1)); continue; }
    if (r.status === 404) return { kind: "notfound", detail: `404 ${model}` };
    if (!r.ok) return { kind: "error", detail: `${r.status} ${(data.error && data.error.message) || "error"}`.slice(0, 200) };
    const cand = (data.candidates || [])[0];
    const text = cand && cand.content && cand.content.parts ? cand.content.parts.map((p) => p.text || "").join("") : "";
    if (text) return { kind: "ok", text, model };
    return { kind: "empty", detail: `empty (finish: ${(cand && cand.finishReason) || "?"})` };
  }
  return { kind: "busy" };
}

async function generate(prompt, maxTokens) {
  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: maxTokens },
  };
  const order = process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL]
    : cachedModel ? [cachedModel, ...CANDIDATES.filter((m) => m !== cachedModel)] : CANDIDATES;
  let lastDetail = "", anyBusy = false;
  for (const model of order) {
    const g = await callModel(model, payload);
    if (g.kind === "ok") { cachedModel = g.model; return { ok: true, text: g.text }; }
    if (g.kind === "busy") { anyBusy = true; continue; }
    lastDetail = g.detail || g.kind;
    if (g.kind === "notfound") continue;
    break;
  }
  if (anyBusy) return { busy: true };
  return { error: lastDetail || "no available model" };
}

export default async function handler(req, res) {
  try {
    if (!GEMINI_KEY) return res.status(500).json({ error: "AI is not configured on the server." });
    if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

    const authz = req.headers.authorization || "";
    const token = authz.startsWith("Bearer ") ? authz.slice(7) : "";
    if (!token) return res.status(401).json({ error: "Please sign in to use AI features." });
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(token);
    if (ue || !u || !u.user) return res.status(401).json({ error: "Please sign in to use AI features." });
    if (!(u.user.app_metadata && u.user.app_metadata.email_verified)) return res.status(403).json({ error: "Please verify your email from the Account tab to use AI features.", needVerify: true });

    // ── Ban check (IP or account) ──
    const { banned, ip } = await checkBanned(req, u.user.id);
    if (banned) return res.status(403).json({ error: "Your access to this feature has been suspended." });

    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const prompt = String(b.prompt || "").slice(0, 24000);
    let maxTokens = parseInt(b.maxTokens, 10);
    if (!Number.isFinite(maxTokens) || maxTokens <= 0) maxTokens = 2000;
    maxTokens = Math.min(maxTokens, 4000);
    if (!prompt.trim()) return res.status(400).json({ error: "No prompt provided." });

    // ── Crisis tripwire: don't draft over self-harm content; point to help ──
    if (containsCrisisSignal(prompt)) {
      return res.status(422).json({ error: CRISIS_MESSAGE });
    }

    // Best-effort IP log (so abusive accounts' IPs can be identified for banning)
    logUserIp(u.user.id, ip);

    const g = await generate(prompt, maxTokens);
    if (g.busy) return res.status(503).json({ error: "The AI is busy right now. Please try again in a moment." });
    if (!g.ok) return res.status(502).json({ error: "Could not generate a response. Please try again." });
    return res.status(200).json({ text: g.text });
  } catch (e) {
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}