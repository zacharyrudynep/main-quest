import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const GEMINI_KEY = process.env.GEMINI_API_KEY;
// Google keeps rotating Flash models and blocks older ones for new accounts, so we try
// several current ones in order and use whichever the account accepts. Set GEMINI_MODEL
// in Vercel to pin one explicitly and skip the probing.
const CANDIDATES = ["gemini-flash-latest", "gemini-2.5-flash-lite", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-2.5-flash"];
let cachedModel = null; // remember what worked on this warm instance

const SYSTEM = `You are a professional resume editor helping a candidate tailor their existing resume to a specific job posting.

STRICT RULES — follow exactly:
- Only rephrase, reorganize, and emphasize experience, skills, and accomplishments the candidate ALREADY demonstrates in their resume.
- NEVER invent or imply skills, tools, job titles, employers, dates, certifications, metrics, or accomplishments that are not supported by the original resume.
- For each requested keyword: incorporate it ONLY if the resume shows genuine, related experience it can honestly attach to. If there is no honest basis for a keyword, silently omit it. Do NOT fabricate experience to justify a keyword.
- Preserve all real facts exactly (company names, dates, job titles, education). You may rewrite descriptions to use the job's terminology where truthful.
- Keep a professional, concise, results-oriented tone.

OUTPUT FORMAT: Return ONLY the tailored resume as clean Markdown. Use "# Full Name" for the name at the top, "## Section" for section headers (e.g. Summary, Experience, Skills, Education), "**Title — Company** (dates)" lines for roles, and "- " for bullet points. No preamble, no commentary, no notes about what you changed — output the resume and nothing else.`;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

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
    const text = cand && cand.content && cand.content.parts ? cand.content.parts.map(p => p.text || "").join("") : "";
    if (text) return { kind: "ok", text, model };
    return { kind: "empty", detail: `empty (finish: ${(cand && cand.finishReason) || "?"}${data.promptFeedback && data.promptFeedback.blockReason ? ", blocked: " + data.promptFeedback.blockReason : ""})` };
  }
  return { kind: "busy" };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    if (!GEMINI_KEY) return res.status(500).json({ error: "AI is not configured on the server." });

    // ── Auth + premium gate ──
    const authz = req.headers.authorization || "";
    const token = authz.startsWith("Bearer ") ? authz.slice(7) : "";
    if (!token) return res.status(401).json({ error: "Please sign in." });
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(token);
    if (ue || !u || !u.user) return res.status(401).json({ error: "Please sign in." });
    const { data: prof } = await supabaseAdmin.from("profiles").select("is_premium").eq("id", u.user.id).single();
    if (!prof || !prof.is_premium) return res.status(403).json({ error: "Resume tailoring is a Premium feature." });

    // ── Input ──
    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const resumeText = String(b.resumeText || "").slice(0, 24000);
    const keywords = Array.isArray(b.keywords) ? b.keywords.slice(0, 40).map(k => String(k).slice(0, 60)) : [];
    const job = b.job || {};
    if (!resumeText.trim()) return res.status(400).json({ error: "No resume text found — upload a resume in your profile first." });

    const jobReqs = [].concat(job.requirements || [], job.responsibilities || []).filter(Boolean).map(String).slice(0, 40);
    const taskPrompt =
`JOB TITLE: ${job.title || ""}
COMPANY: ${job.company || ""}

JOB REQUIREMENTS / RESPONSIBILITIES:
${jobReqs.length ? "- " + jobReqs.join("\n- ") : "(not provided)"}

KEYWORDS THE CANDIDATE WANTS TO TARGET (only incorporate where truthful):
${keywords.length ? keywords.map(k => "- " + k).join("\n") : "(none selected)"}

CURRENT RESUME:
"""
${resumeText}
"""

Return the tailored resume in clean Markdown only.`;

    const payload = {
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [{ role: "user", parts: [{ text: taskPrompt }] }],
      generationConfig: { temperature: 0.4, topP: 0.9, maxOutputTokens: 8192 },
    };

    // ── Try models in order until the account accepts one ──
    const order = process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL]
      : cachedModel ? [cachedModel, ...CANDIDATES.filter(m => m !== cachedModel)]
      : CANDIDATES;

    let lastDetail = "";
    for (const model of order) {
      const g = await callModel(model, payload);
      if (g.kind === "ok") {
        cachedModel = g.model;
        const clean = g.text.replace(/^```(?:markdown|md)?\s*/i, "").replace(/```\s*$/i, "").trim();
        return res.status(200).json({ resume: clean, model: g.model });
      }
      if (g.kind === "busy") return res.status(429).json({ error: "The AI is busy right now — please try again in a moment." });
      lastDetail = g.detail || g.kind;
      if (g.kind === "notfound") continue; // this model isn't available — try the next
      break; // a real error (400/403/empty) won't be fixed by another model
    }
    return res.status(502).json({ error: `Couldn't generate the resume — ${lastDetail || "no available model"}` });
  } catch (e) {
    return res.status(500).json({ error: "Something went wrong." });
  }
}