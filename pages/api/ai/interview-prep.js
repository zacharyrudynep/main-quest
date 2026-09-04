import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const CANDIDATES = ["gemini-2.5-flash-lite", "gemini-flash-latest", "gemini-2.5-flash"];
const LIMIT = 10; // interview preps per user per month

// Best-effort: fetch the company site and strip to plain text so the model can use
// any hiring/interview-process info. Fails silently (site may block or omit it).
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
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z]+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    return text.slice(0, 6000);
  } catch (e) { return ""; }
}

export default async function handler(req, res) {
  try {
    const authz = req.headers.authorization || "";
    const tok = authz.startsWith("Bearer ") ? authz.slice(7) : "";
    if (!tok) return res.status(401).json({ error: "Please sign in." });
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(tok);
    if (ue || !u || !u.user) return res.status(401).json({ error: "Please sign in." });
    const uid = u.user.id;

    // GET: return existing prep for a job (used to open an already-generated prep)
    if (req.method === "GET") {
      const jobKey = String((req.query && req.query.jobKey) || "");
      if (!jobKey) return res.status(400).json({ error: "Missing jobKey." });
      const { data } = await supabaseAdmin.from("interview_preps").select("prep_text").eq("user_id", uid).eq("job_key", jobKey).maybeSingle();
      return res.status(200).json({ prep: data ? data.prep_text : null });
    }
    if (req.method !== "POST") { res.setHeader("Allow", "GET, POST"); return res.status(405).json({ error: "Method not allowed" }); }
    if (!GEMINI_KEY) return res.status(503).json({ error: "AI is not configured." });

    if (!(u.user.app_metadata && u.user.app_metadata.email_verified))
      return res.status(403).json({ error: "Please verify your email from the Account tab to use this feature.", needVerify: true });
    const { data: prof } = await supabaseAdmin.from("profiles").select("is_premium,is_admin").eq("id", uid).single();
    const isAdmin = !!(prof && prof.is_admin);
    if (!isAdmin && !(prof && prof.is_premium)) return res.status(403).json({ error: "Interview prep is a Premium feature." });

    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const jobKey = String(b.jobKey || "").slice(0, 400);
    const company = String(b.company || "").slice(0, 200);
    const title = String(b.title || "").slice(0, 300);
    const location = String(b.location || "").slice(0, 200);
    const url = String(b.url || "").slice(0, 800);
    const requirements = (Array.isArray(b.requirements) ? b.requirements.join(" ") : String(b.requirements || "")).slice(0, 2500);
    if (!jobKey || !company || !title) return res.status(400).json({ error: "Missing job info." });

    // Already generated? return it (view-only, no regen, no usage spent)
    const { data: existing } = await supabaseAdmin.from("interview_preps").select("prep_text").eq("user_id", uid).eq("job_key", jobKey).maybeSingle();
    if (existing && existing.prep_text) return res.status(200).json({ prep: existing.prep_text, already: true });

    // Usage cap
    const month = new Date().toISOString().slice(0, 7);
    const { data: usageRow } = await supabaseAdmin.from("ai_interview_usage").select("count").eq("user_id", uid).eq("month", month).single();
    const used = (usageRow && usageRow.count) || 0;
    if (!isAdmin && used >= LIMIT) return res.status(429).json({ error: `You've used all ${LIMIT} interview preps this month.`, remaining: 0 });

    const siteText = await fetchSiteText(url);

    const sys = "You are an expert game-industry career coach preparing a candidate for a specific interview. Produce a focused, practical interview prep guide in clean markdown with clear section headers. Include: (1) a short profile of the company and what they are known for; (2) 6-10 likely interview questions for THIS role, each with a concise suggested angle/approach tailored to a game-industry candidate; (3) role-specific technical or portfolio topics to review; (4) smart questions the candidate should ask the interviewer; (5) general game-industry interview tips. If the provided company website text mentions their hiring or interview process, incorporate it explicitly and call it out. Be specific and useful, but never invent facts about the company you cannot support.";
    const prompt = `Role: ${title}\nCompany: ${company}\nLocation: ${location || "n/a"}\nKey requirements: ${requirements || "n/a"}\n\nCompany website text (may be empty or irrelevant):\n"""${siteText || "(none available)"}"""\n\nWrite the interview prep guide now.`;

    let prep = null;
    for (const model of CANDIDATES) {
      try {
        const ctl = new AbortController();
        const tmo = setTimeout(() => ctl.abort(), 40000);
        let r;
        try {
          r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(GEMINI_KEY)}`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ systemInstruction: { parts: [{ text: sys }] }, contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.6, maxOutputTokens: 2600 } }),
            signal: ctl.signal,
          });
        } finally { clearTimeout(tmo); }
        const data = await r.json().catch(() => ({}));
        const cand = data && data.candidates && data.candidates[0];
        const out = cand && cand.content && cand.content.parts && cand.content.parts.map((x) => x.text || "").join("").trim();
        if (out) { prep = out; break; }
      } catch (e) { /* next model */ }
    }
    if (!prep) return res.status(503).json({ error: "Could not generate right now. Please try again." });

    await supabaseAdmin.from("interview_preps").upsert({ user_id: uid, job_key: jobKey, company, title, location, url, prep_text: prep }, { onConflict: "user_id,job_key" });
    if (!isAdmin) await supabaseAdmin.from("ai_interview_usage").upsert({ user_id: uid, month, count: used + 1 }, { onConflict: "user_id,month" });
    return res.status(200).json({ prep, remaining: isAdmin ? null : Math.max(0, LIMIT - (used + 1)) });
  } catch (e) {
    return res.status(500).json({ error: "Something went wrong." });
  }
}