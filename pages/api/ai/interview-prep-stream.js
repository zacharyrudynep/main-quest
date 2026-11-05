// POST /api/ai/interview-prep-stream — like /api/ai/interview-prep, but streams the
// generation back token-by-token over Server-Sent Events so the user watches it write
// instead of staring at a spinner. All the gatekeeping (auth, Premium access, email
// verification, monthly limit, cached result) happens BEFORE we switch to SSE, so those
// still return normal JSON errors; only once we're committed to generating do we stream.
// On a persistent Node server this holds the connection open for the generation, so no
// background job / polling is needed. The finished text is still saved to interview_preps
// (so re-opening is instant) and a credit is consumed, exactly like the non-streaming route.
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { aiAccess, consumeFreeCredit } from "../../../lib/entitlements";
import { streamText, aiErrText } from "../../../lib/gemini";
import { logAiTxn } from "../../../lib/aiTxn";

const LIMIT = 40;

async function fetchSiteText(url) {
  if (!url) return "";
  try {
    const ctl = new AbortController();
    const tmo = setTimeout(() => ctl.abort(), 8000);
    let r;
    try { r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; MainQuestBot/1.0)" }, signal: ctl.signal }); }
    finally { clearTimeout(tmo); }
    if (!r || !r.ok) return "";
    const html = await r.text();
    return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/gi, " ").replace(/\s+/g, " ").trim().slice(0, 6000);
  } catch (e) { return ""; }
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed" }); }
    const authz = req.headers.authorization || "";
    const tok = authz.startsWith("Bearer ") ? authz.slice(7) : "";
    if (!tok) return res.status(401).json({ error: "Please sign in." });
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(tok);
    if (ue || !u || !u.user) return res.status(401).json({ error: "Please sign in." });
    const uid = u.user.id;

    const access = await aiAccess(supabaseAdmin, uid);
    const unlimited = access.unlimited;
    if (!access.ok) return res.status(403).json({ error: "Interview prep is a Premium feature." });
    const emailVerified = !!(u.user.app_metadata && u.user.app_metadata.email_verified);
    if (!emailVerified && !access.isStudent) return res.status(403).json({ error: "Please verify your email from the Account tab to use this feature.", needVerify: true });
    const usingFree = !unlimited && !access.isPremium && access.freeCredits > 0;

    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const jobKey = String(b.jobKey || "").slice(0, 400);
    const company = String(b.company || "").slice(0, 200);
    const title = String(b.title || "").slice(0, 300);
    const location = String(b.location || "").slice(0, 200);
    const url = String(b.url || "").slice(0, 800);
    const requirements = (Array.isArray(b.requirements) ? b.requirements.join(" ") : String(b.requirements || "")).slice(0, 2500);
    if (!jobKey || !company || !title) return res.status(400).json({ error: "Missing job info." });

    // Already generated → return instantly as JSON (no stream, no usage).
    const { data: existing } = await supabaseAdmin.from("interview_preps").select("prep_text").eq("user_id", uid).eq("job_key", jobKey).maybeSingle();
    if (existing && existing.prep_text) return res.status(200).json({ prep: existing.prep_text, already: true });

    const month = new Date().toISOString().slice(0, 7);
    const { data: usageRow } = await supabaseAdmin.from("ai_usage").select("count").eq("user_id", uid).eq("month", month).single();
    const used = (usageRow && usageRow.count) || 0;
    if (!unlimited && !usingFree && used >= LIMIT) return res.status(429).json({ error: `You've used all ${LIMIT} interview preps this month.`, remaining: 0 });

    // ── All checks passed → switch to SSE and stream. ──
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",   // no-transform tells proxies not to buffer/compress
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",                   // nginx/traefik: don't buffer
    });
    const send = (event, data) => { try { res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`); if (res.flush) res.flush(); } catch (e) {} };
    send("open", { ok: true });                    // flush headers immediately so the client knows the stream is live

    const siteText = await fetchSiteText(url);
    const sys = "You are an expert game-industry career coach preparing a candidate for a specific interview. Produce a focused, practical interview prep guide in clean markdown with clear section headers. Include: (1) a short profile of the company and what they are known for; (2) 6-10 likely interview questions for THIS role, each with a concise suggested angle/approach tailored to a game-industry candidate; (3) role-specific technical or portfolio topics to review; (4) smart questions the candidate should ask the interviewer; (5) general game-industry interview tips. If the provided company website text mentions their hiring or interview process, incorporate it explicitly and call it out. Be specific and useful, but never invent facts about the company you cannot support.";
    const prompt = `Role: ${title}\nCompany: ${company}\nLocation: ${location || "n/a"}\nKey requirements: ${requirements || "n/a"}\n\nCompany website text (may be empty or irrelevant):\n"""${siteText || "(none available)"}"""\n\nWrite the interview prep guide now.`;

    const g = await streamText({ system: sys, user: prompt, temperature: 0.6, maxOutputTokens: 2600, timeoutMs: 55000, onChunk: (d) => send("delta", { t: d }) });
    try { await logAiTxn(supabaseAdmin, { userId: uid, kind: "interview", g }); } catch (e) {}
    if (!g.ok) { send("error", { error: aiErrText(g) }); return res.end(); }

    const prep = g.text.trim();
    try { await supabaseAdmin.from("interview_preps").upsert({ user_id: uid, job_key: jobKey, company, title, location, url, prep_text: prep }, { onConflict: "user_id,job_key" }); } catch (e) {}
    try { if (usingFree) await consumeFreeCredit(supabaseAdmin, uid); else if (!unlimited) await supabaseAdmin.from("ai_usage").upsert({ user_id: uid, month, count: used + 1 }, { onConflict: "user_id,month" }); } catch (e) {}
    send("done", { ok: true });
    return res.end();
  } catch (e) {
    // If headers were already sent (streaming), end with an SSE error; otherwise JSON.
    try {
      if (res.headersSent) { res.write(`event: error\ndata: ${JSON.stringify({ error: "Something went wrong." })}\n\n`); return res.end(); }
      return res.status(500).json({ error: "Something went wrong." });
    } catch (e2) {}
  }
}

// Node runtime, no body-parser surprises; allow a long-held connection for streaming.
export const config = { maxDuration: 120 };