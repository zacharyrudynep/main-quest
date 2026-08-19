import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { tailorDocx } from "../../../lib/docxTailor";

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const CANDIDATES = ["gemini-flash-latest", "gemini-2.5-flash-lite", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-2.5-flash"];
let cachedModel = null;

const SYSTEM = `You are a professional resume editor helping a candidate tailor their existing resume to a specific job posting.

STRICT RULES — follow exactly:
- Only rephrase, reorganize, and emphasize experience the candidate ALREADY demonstrates. NEVER invent skills, tools, titles, employers, dates, certifications, metrics, or accomplishments not supported by the original resume.
- For each requested keyword: incorporate it ONLY where the resume shows genuine related experience. If there's no honest basis, silently omit it.
- Preserve all real facts exactly (companies, dates, titles, education).
OUTPUT: Return ONLY the tailored resume as clean Markdown (# name, ## sections, **bold** roles, - bullets). No preamble or commentary.`;

const DOCX_SYSTEM = `You are a professional resume editor. You receive a resume's paragraphs, each numbered like [1], [2]. Reword ONLY the descriptive content — the professional summary sentence and the accomplishment bullet points — to better target the job, weaving in requested keywords ONLY where the candidate's real experience honestly supports them.

STRICT RULES:
- Return EXACTLY the same numbered lines, same order, same count. Every input [N] must appear once as output [N].
- Return these UNCHANGED, verbatim: the person's name, contact line, section headers (SUMMARY, EXPERIENCE, SKILLS, EDUCATION, PROJECT EXPERIENCE, INDUSTRY CREDITS, etc.), company names, job titles, dates, education, and the technical-skills lists.
- NEVER invent skills, tools, employers, dates, or accomplishments. Omit any keyword the resume can't honestly support.
- Preserve the ** bold markers exactly where they are (keep bold lead-ins bold). Keep each line's length similar.
- Output ONLY the numbered lines — no preamble, no commentary.`;

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

async function generate(systemText, userText) {
  const payload = {
    systemInstruction: { parts: [{ text: systemText }] },
    contents: [{ role: "user", parts: [{ text: userText }] }],
    generationConfig: { temperature: 0.4, topP: 0.9, maxOutputTokens: 8192 },
  };
  const order = process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL]
    : cachedModel ? [cachedModel, ...CANDIDATES.filter((m) => m !== cachedModel)] : CANDIDATES;
  let lastDetail = "", anyBusy = false;
  for (const model of order) {
    const g = await callModel(model, payload);
    if (g.kind === "ok") { cachedModel = g.model; return { ok: true, text: g.text }; }
    if (g.kind === "busy") { anyBusy = true; continue; } // this model is rate-limited — try the next (separate limits)
    lastDetail = g.detail || g.kind;
    if (g.kind === "notfound") continue;
    break; // a real error (400/403) won't be fixed by another model
  }
  if (anyBusy) return { busy: true }; // only busy if EVERY model was rate-limited
  return { error: lastDetail || "no available model" };
}

export default async function handler(req, res) {
  try {
    if (!GEMINI_KEY) return res.status(500).json({ error: "AI is not configured on the server." });
    const authz = req.headers.authorization || "";
    const token = authz.startsWith("Bearer ") ? authz.slice(7) : "";
    if (!token) return res.status(401).json({ error: "Please sign in." });
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(token);
    if (ue || !u || !u.user) return res.status(401).json({ error: "Please sign in." });
    const { data: prof } = await supabaseAdmin.from("profiles").select("is_premium").eq("id", u.user.id).single();
    if (!prof || !prof.is_premium) return res.status(403).json({ error: "Resume tailoring is a Premium feature." });

    // ── Monthly usage limit (retries included) ──
    const LIMIT = 15;
    const month = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const readUsed = async () => { const { data } = await supabaseAdmin.from("ai_tailor_usage").select("count").eq("user_id", u.user.id).eq("month", month).single(); return (data && data.count) || 0; };
    if (req.method === "GET") { const used = await readUsed(); return res.status(200).json({ limit: LIMIT, used, remaining: Math.max(0, LIMIT - used) }); }
    if (req.method !== "POST") return res.status(405).json({ error: "GET or POST only" });
    const used = await readUsed();
    if (used >= LIMIT) return res.status(429).json({ error: `You've used all ${LIMIT} of your resume tailors this month — your limit resets on the 1st.`, limitReached: true, limit: LIMIT, used, remaining: 0 });
    const bumpUsage = async () => { await supabaseAdmin.from("ai_tailor_usage").upsert({ user_id: u.user.id, month, count: used + 1 }, { onConflict: "user_id,month" }); return Math.max(0, LIMIT - (used + 1)); };

    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const resumeText = String(b.resumeText || "").slice(0, 24000);
    const resumeDocxB64 = typeof b.resumeDocxB64 === "string" ? b.resumeDocxB64 : "";
    const keywords = Array.isArray(b.keywords) ? b.keywords.slice(0, 40).map((k) => String(k).slice(0, 60)) : [];
    const job = b.job || {};
    if (!resumeText.trim() && !resumeDocxB64) return res.status(400).json({ error: "No resume found — upload a resume in your profile first." });

    const jobReqs = [].concat(job.requirements || [], job.responsibilities || []).filter(Boolean).map(String).slice(0, 40);
    const jobBlock = `JOB TITLE: ${job.title || ""}\nCOMPANY: ${job.company || ""}\n\nJOB REQUIREMENTS / RESPONSIBILITIES:\n${jobReqs.length ? "- " + jobReqs.join("\n- ") : "(not provided)"}\n\nKEYWORDS TO TARGET (only where truthful):\n${keywords.length ? keywords.map((k) => "- " + k).join("\n") : "(none selected)"}`;

    // ── Preferred path: rewrite inside the user's real .docx, preserving its formatting ──
    if (resumeDocxB64) {
      let busy = false;
      const rewriteFn = async (mds) => {
        const numbered = mds.map((md, i) => `[${i + 1}] ${md}`).join("\n");
        const g = await generate(DOCX_SYSTEM, `${jobBlock}\n\nRESUME PARAGRAPHS:\n${numbered}\n\nReturn the same numbered lines, reworded per the rules.`);
        if (g.busy) { busy = true; return null; }
        if (!g.ok) return null;
        const map = {};
        for (const line of g.text.split(/\r?\n/)) { const m = line.match(/^\s*\[(\d+)\]\s?([\s\S]*)$/); if (m) map[+m[1]] = m[2].trim(); }
        if (Object.keys(map).length < Math.ceil(mds.length * 0.5)) return null; // parse failed → fallback
        return mds.map((md, i) => (map[i + 1] !== undefined ? map[i + 1] : md));
      };
      try {
        const result = await tailorDocx(resumeDocxB64, rewriteFn);
        if (busy) return res.status(429).json({ error: "The AI is busy right now — please try again in a moment." });
        if (result) { const remaining = await bumpUsage(); return res.status(200).json({ resume: result.plain, docxB64: result.base64, remaining }); }
        // result null → fall through to markdown mode below
      } catch (e) { /* invalid docx or parse issue → fall through to markdown */ }
    }

    // ── Fallback path: generate clean Markdown (client builds a .docx from it) ──
    const g = await generate(SYSTEM, `${jobBlock}\n\nCURRENT RESUME:\n"""\n${resumeText}\n"""\n\nReturn the tailored resume in clean Markdown only.`);
    if (g.busy) return res.status(429).json({ error: "The AI is busy right now — please try again in a moment." });
    if (!g.ok) return res.status(502).json({ error: `Couldn't generate the resume — ${g.error}` });
    const clean = g.text.replace(/^```(?:markdown|md)?\s*/i, "").replace(/```\s*$/i, "").trim();
    { const remaining = await bumpUsage(); return res.status(200).json({ resume: clean, remaining }); }
  } catch (e) {
    return res.status(500).json({ error: "Something went wrong." });
  }
}