import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash"; // override via env if you switch models
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// The honesty guardrail: only truthfully resurface real experience — never invent.
const SYSTEM = `You are a professional resume editor helping a candidate tailor their existing resume to a specific job posting.

STRICT RULES — follow exactly:
- Only rephrase, reorganize, and emphasize experience, skills, and accomplishments the candidate ALREADY demonstrates in their resume.
- NEVER invent or imply skills, tools, job titles, employers, dates, certifications, metrics, or accomplishments that are not supported by the original resume.
- For each requested keyword: incorporate it ONLY if the resume shows genuine, related experience it can honestly attach to. If there is no honest basis for a keyword, silently omit it. Do NOT fabricate experience to justify a keyword.
- Preserve all real facts exactly (company names, dates, job titles, education). You may rewrite descriptions to use the job's terminology where truthful.
- Keep a professional, concise, results-oriented tone.

OUTPUT FORMAT: Return ONLY the tailored resume as clean Markdown. Use "# Full Name" for the name at the top, "## Section" for section headers (e.g. Summary, Experience, Skills, Education), "**Title — Company** (dates)" lines for roles, and "- " for bullet points. No preamble, no commentary, no notes about what you changed — output the resume and nothing else.`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    if (!GEMINI_KEY) return res.status(500).json({ error: "AI is not configured on the server." });

    // ── Auth + premium gate (server-side, so the paid endpoint can't be abused) ──
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

    // ── Call Gemini with backoff on transient throttling ──
    let out = null, transient = false, hardErr = "";
    for (let attempt = 0; attempt < 3; attempt++) {
      let r;
      try {
        r = await fetch(`${ENDPOINT}?key=${encodeURIComponent(GEMINI_KEY)}`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        });
      } catch (e) { transient = true; await sleep(700 * (attempt + 1)); continue; }
      if (r.status === 429 || r.status === 503) { transient = true; await sleep(700 * (attempt + 1) + Math.random() * 400); continue; }
      const data = await r.json().catch(() => ({}));
      if (!r.ok) { hardErr = (data && data.error && data.error.message) || "error"; break; }
      out = ((((data.candidates || [])[0] || {}).content || {}).parts || []).map(p => p.text || "").join("");
      break;
    }

    if (!out) {
      if (transient) return res.status(429).json({ error: "The AI is busy right now — please try again in a moment." });
      return res.status(502).json({ error: "Couldn't generate the tailored resume. Please try again." });
    }
    out = out.replace(/^```(?:markdown|md)?\s*/i, "").replace(/```\s*$/i, "").trim();
    return res.status(200).json({ resume: out });
  } catch (e) {
    return res.status(500).json({ error: "Something went wrong." });
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }