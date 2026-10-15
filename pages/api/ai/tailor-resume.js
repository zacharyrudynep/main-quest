import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { tailorDocx } from "../../../lib/docxTailor";
import { aiAccess, consumeFreeCredit } from "../../../lib/entitlements";
import { generateText, aiErrText } from "../../../lib/gemini";
import { logAiTxn } from "../../../lib/aiTxn";

const LIMIT = 40; // shared monthly AI pool (ai_usage) — same currency as every other AI feature

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

function nowIso() { return new Date().toISOString(); }
async function setJobError(id, msg) {
  try { await supabaseAdmin.from("ai_jobs").update({ status: "error", error: String(msg || "error").slice(0, 300), updated_at: nowIso() }).eq("id", id); } catch (e) {}
}

// The heavy work. Runs AFTER the 202 response has been sent — on a long-running
// Node server (Coolify) the process stays alive, so this finishes even though the
// user's request already returned. Never touches `res`.
async function processResumeJob(jobId, ctx) {
  const { uid, resumeText, resumeDocxB64, keywords, job, usingFree, unlimited, used } = ctx;
  try {
    const month = new Date().toISOString().slice(0, 7);
    const jobReqs = [].concat(job.requirements || [], job.responsibilities || []).filter(Boolean).map(String).slice(0, 40);
    const jobBlock = `JOB TITLE: ${job.title || ""}\nCOMPANY: ${job.company || ""}\n\nJOB REQUIREMENTS / RESPONSIBILITIES:\n${jobReqs.length ? "- " + jobReqs.join("\n- ") : "(not provided)"}\n\nKEYWORDS TO TARGET (only where truthful):\n${keywords.length ? keywords.map((k) => "- " + k).join("\n") : "(none selected)"}`;

    let resumeMd = null, docxB64 = null;

    // Preferred: rewrite inside the real .docx, preserving formatting.
    if (resumeDocxB64) {
      let fail = null;
      const rewriteFn = async (mds) => {
        const numbered = mds.map((md, i) => `[${i + 1}] ${md}`).join("\n");
        const g = await generateText({ system: DOCX_SYSTEM, user: `${jobBlock}\n\nRESUME PARAGRAPHS:\n${numbered}\n\nReturn the same numbered lines, reworded per the rules.`, temperature: 0.4, maxOutputTokens: 8192, timeoutMs: 60000 });
        await logAiTxn(supabaseAdmin, { userId: uid, kind: "resume", g });
        if (!g.ok) { fail = aiErrText(g); return null; }
        const map = {};
        for (const line of g.text.split(/\r?\n/)) { const m = line.match(/^\s*\[(\d+)\]\s?([\s\S]*)$/); if (m) map[+m[1]] = m[2].trim(); }
        if (Object.keys(map).length < Math.ceil(mds.length * 0.5)) return null; // parse failed → fallback
        return mds.map((md, i) => (map[i + 1] !== undefined ? map[i + 1] : md));
      };
      try { const result = await tailorDocx(resumeDocxB64, rewriteFn); if (result) { resumeMd = result.plain; docxB64 = result.base64; } }
      catch (e) { /* invalid docx → fall through to markdown */ }
      if (!resumeMd && fail) { await setJobError(jobId, fail); return; } // AI busy/timeout → stop (don't double-spend)
    }

    // Fallback: clean Markdown.
    if (!resumeMd) {
      const g = await generateText({ system: SYSTEM, user: `${jobBlock}\n\nCURRENT RESUME:\n"""\n${resumeText}\n"""\n\nReturn the tailored resume in clean Markdown only.`, temperature: 0.4, maxOutputTokens: 8192, timeoutMs: 60000 });
      await logAiTxn(supabaseAdmin, { userId: uid, kind: "resume", g });
      if (!g.ok) { await setJobError(jobId, aiErrText(g)); return; }
      resumeMd = g.text.replace(/^```(?:markdown|md)?\s*/i, "").replace(/```\s*$/i, "").trim();
      docxB64 = null;
    }

    // Persist to Generated Resumes (now truly saved even if they navigated away).
    const jobKey = `${job.company}|${job.title}|${job.location || ""}`;
    let resumeId = null;
    try {
      const { data } = await supabaseAdmin.from("generated_resumes").insert({
        user_id: uid, job_key: jobKey.slice(0, 400), company: String(job.company || "").slice(0, 200),
        title: String(job.title || "").slice(0, 300), location: String(job.location || "").slice(0, 200),
        url: String(job.url || "").slice(0, 800), resume_text: resumeMd.slice(0, 60000),
      }).select("id").single();
      resumeId = data && data.id;
    } catch (e) {}

    // Spend the use only now that it succeeded.
    try { if (usingFree) await consumeFreeCredit(supabaseAdmin, uid); else if (!unlimited) await supabaseAdmin.from("ai_usage").upsert({ user_id: uid, month, count: used + 1 }, { onConflict: "user_id,month" }); } catch (e) {}

    await supabaseAdmin.from("ai_jobs").update({ status: "done", result: { resumeId, resume: resumeMd, docxB64: docxB64 || null }, error: null, updated_at: nowIso() }).eq("id", jobId);
  } catch (e) {
    await setJobError(jobId, "Something went wrong.");
  }
}

export default async function handler(req, res) {
  try {
    const authz = req.headers.authorization || "";
    const token = authz.startsWith("Bearer ") ? authz.slice(7) : "";
    if (!token) return res.status(401).json({ error: "Please sign in." });
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(token);
    if (ue || !u || !u.user) return res.status(401).json({ error: "Please sign in." });
    const uid = u.user.id;

    const access = await aiAccess(supabaseAdmin, uid);
    const unlimited = access.unlimited; // admin or active student trial — no cap
    if (!access.ok) return res.status(403).json({ error: "Resume tailoring is a Premium feature." });
    const usingFree = !unlimited && !access.isPremium && access.freeCredits > 0;

    const month = new Date().toISOString().slice(0, 7);
    const readUsed = async () => { const { data } = await supabaseAdmin.from("ai_usage").select("count").eq("user_id", uid).eq("month", month).single(); return (data && data.count) || 0; };

    if (req.method === "GET") { const used = await readUsed(); return res.status(200).json({ limit: LIMIT, used, remaining: unlimited ? null : Math.max(0, LIMIT - used), unlimited }); }
    if (req.method !== "POST") return res.status(405).json({ error: "GET or POST only" });

    const used = await readUsed();
    if (!unlimited && !usingFree && used >= LIMIT) return res.status(429).json({ error: `You've used all ${LIMIT} of your monthly AI credits — your limit resets on the 1st.`, limitReached: true, limit: LIMIT, used, remaining: 0 });

    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const resumeText = String(b.resumeText || "").slice(0, 24000);
    const resumeDocxB64 = typeof b.resumeDocxB64 === "string" ? b.resumeDocxB64 : "";
    const keywords = Array.isArray(b.keywords) ? b.keywords.slice(0, 40).map((k) => String(k).slice(0, 60)) : [];
    const job = b.job || {};
    if (!resumeText.trim() && !resumeDocxB64) return res.status(400).json({ error: "No resume found — upload a resume in your profile first." });

    const jobKey = `${job.company || ""}|${job.title || ""}|${job.location || ""}`;

    // De-dupe: reuse an in-flight job for the same posting instead of starting another.
    const { data: inflight } = await supabaseAdmin.from("ai_jobs").select("id").eq("user_id", uid).eq("kind", "resume").eq("job_key", jobKey).eq("status", "pending").maybeSingle();
    if (inflight) return res.status(202).json({ jobId: inflight.id, pending: true, reused: true, remaining: unlimited ? null : Math.max(0, LIMIT - used) });

    const { data: created, error: cErr } = await supabaseAdmin.from("ai_jobs").insert({ user_id: uid, kind: "resume", job_key: jobKey.slice(0, 400), status: "pending" }).select("id").single();
    if (cErr || !created) return res.status(500).json({ error: "Couldn't start the job — please try again." });

    // Return immediately; finish in the background.
    res.status(202).json({ jobId: created.id, pending: true, remaining: unlimited ? null : Math.max(0, LIMIT - (used + 1)) });
    processResumeJob(created.id, { uid, resumeText, resumeDocxB64, keywords, job, usingFree, unlimited, used })
      .catch((e) => setJobError(created.id, "Something went wrong."));
    return;
  } catch (e) {
    try { return res.status(500).json({ error: "Something went wrong." }); } catch (e2) {}
  }
}