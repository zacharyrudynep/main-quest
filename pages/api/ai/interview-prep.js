import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { aiAccess, consumeFreeCredit } from "../../../lib/entitlements";
import { generateText, aiErrText } from "../../../lib/gemini";

const LIMIT = 40; // shared monthly AI pool (ai_usage)

function nowIso() { return new Date().toISOString(); }
async function setJobError(id, msg) {
  try { await supabaseAdmin.from("ai_jobs").update({ status: "error", error: String(msg || "error").slice(0, 300), updated_at: nowIso() }).eq("id", id); } catch (e) {}
}

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

async function processInterviewJob(jobId, ctx) {
  const { uid, jobKey, company, title, location, url, requirements, usingFree, isAdmin, used } = ctx;
  try {
    const month = new Date().toISOString().slice(0, 7);
    const siteText = await fetchSiteText(url);
    const sys = "You are an expert game-industry career coach preparing a candidate for a specific interview. Produce a focused, practical interview prep guide in clean markdown with clear section headers. Include: (1) a short profile of the company and what they are known for; (2) 6-10 likely interview questions for THIS role, each with a concise suggested angle/approach tailored to a game-industry candidate; (3) role-specific technical or portfolio topics to review; (4) smart questions the candidate should ask the interviewer; (5) general game-industry interview tips. If the provided company website text mentions their hiring or interview process, incorporate it explicitly and call it out. Be specific and useful, but never invent facts about the company you cannot support.";
    const prompt = `Role: ${title}\nCompany: ${company}\nLocation: ${location || "n/a"}\nKey requirements: ${requirements || "n/a"}\n\nCompany website text (may be empty or irrelevant):\n"""${siteText || "(none available)"}"""\n\nWrite the interview prep guide now.`;

    const g = await generateText({ system: sys, user: prompt, temperature: 0.6, maxOutputTokens: 2600, timeoutMs: 55000 });
    if (!g.ok) { await setJobError(jobId, aiErrText(g)); return; }
    const prep = g.text.trim();

    try { await supabaseAdmin.from("interview_preps").upsert({ user_id: uid, job_key: jobKey, company, title, location, url, prep_text: prep }, { onConflict: "user_id,job_key" }); } catch (e) {}
    try { if (usingFree) await consumeFreeCredit(supabaseAdmin, uid); else if (!isAdmin) await supabaseAdmin.from("ai_usage").upsert({ user_id: uid, month, count: used + 1 }, { onConflict: "user_id,month" }); } catch (e) {}
    await supabaseAdmin.from("ai_jobs").update({ status: "done", result: {}, error: null, updated_at: nowIso() }).eq("id", jobId);
  } catch (e) {
    await setJobError(jobId, "Something went wrong.");
  }
}

export default async function handler(req, res) {
  try {
    const authz = req.headers.authorization || "";
    const tok = authz.startsWith("Bearer ") ? authz.slice(7) : "";
    if (!tok) return res.status(401).json({ error: "Please sign in." });
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(tok);
    if (ue || !u || !u.user) return res.status(401).json({ error: "Please sign in." });
    const uid = u.user.id;

    if (req.method === "GET") {
      const jobKey = String((req.query && req.query.jobKey) || "");
      if (!jobKey) return res.status(400).json({ error: "Missing jobKey." });
      const { data } = await supabaseAdmin.from("interview_preps").select("prep_text").eq("user_id", uid).eq("job_key", jobKey).maybeSingle();
      return res.status(200).json({ prep: data ? data.prep_text : null });
    }
    if (req.method !== "POST") { res.setHeader("Allow", "GET, POST"); return res.status(405).json({ error: "Method not allowed" }); }

    if (!(u.user.app_metadata && u.user.app_metadata.email_verified))
      return res.status(403).json({ error: "Please verify your email from the Account tab to use this feature.", needVerify: true });
    const access = await aiAccess(supabaseAdmin, uid);
    const isAdmin = access.isAdmin;
    if (!access.ok) return res.status(403).json({ error: "Interview prep is a Premium feature." });
    const usingFree = !isAdmin && !access.isPremium && access.freeCredits > 0;

    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const jobKey = String(b.jobKey || "").slice(0, 400);
    const company = String(b.company || "").slice(0, 200);
    const title = String(b.title || "").slice(0, 300);
    const location = String(b.location || "").slice(0, 200);
    const url = String(b.url || "").slice(0, 800);
    const requirements = (Array.isArray(b.requirements) ? b.requirements.join(" ") : String(b.requirements || "")).slice(0, 2500);
    if (!jobKey || !company || !title) return res.status(400).json({ error: "Missing job info." });

    // Already generated → return instantly, no job, no usage.
    const { data: existing } = await supabaseAdmin.from("interview_preps").select("prep_text").eq("user_id", uid).eq("job_key", jobKey).maybeSingle();
    if (existing && existing.prep_text) return res.status(200).json({ prep: existing.prep_text, already: true });

    const month = new Date().toISOString().slice(0, 7);
    const { data: usageRow } = await supabaseAdmin.from("ai_usage").select("count").eq("user_id", uid).eq("month", month).single();
    const used = (usageRow && usageRow.count) || 0;
    if (!isAdmin && !usingFree && used >= LIMIT) return res.status(429).json({ error: `You've used all ${LIMIT} interview preps this month.`, remaining: 0 });

    // De-dupe in-flight.
    const { data: inflight } = await supabaseAdmin.from("ai_jobs").select("id").eq("user_id", uid).eq("kind", "interview").eq("job_key", jobKey).eq("status", "pending").maybeSingle();
    if (inflight) return res.status(202).json({ jobId: inflight.id, pending: true, reused: true });

    const { data: created, error: cErr } = await supabaseAdmin.from("ai_jobs").insert({ user_id: uid, kind: "interview", job_key: jobKey, status: "pending" }).select("id").single();
    if (cErr || !created) return res.status(500).json({ error: "Couldn't start the job — please try again." });

    res.status(202).json({ jobId: created.id, pending: true });
    processInterviewJob(created.id, { uid, jobKey, company, title, location, url, requirements, usingFree, isAdmin, used })
      .catch((e) => setJobError(created.id, "Something went wrong."));
    return;
  } catch (e) {
    try { return res.status(500).json({ error: "Something went wrong." }); } catch (e2) {}
  }
}