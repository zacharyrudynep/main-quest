import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const CANDIDATES = ["gemini-2.5-flash-lite", "gemini-flash-latest", "gemini-2.5-flash"];
const LIMIT = 25; // AI company lookups per user per month

// POST { company } -> { text, remaining }
// Premium + verified only. Generates 1-2 sentences about a game company to drop
// into an email application. Fires only when the user's template has an AI slot.
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
    if (!GEMINI_KEY) return res.status(503).json({ error: "AI is not configured." });

    const authz = req.headers.authorization || "";
    const tok = authz.startsWith("Bearer ") ? authz.slice(7) : "";
    if (!tok) return res.status(401).json({ error: "Please sign in." });
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(tok);
    if (ue || !u || !u.user) return res.status(401).json({ error: "Please sign in." });
    if (!(u.user.app_metadata && u.user.app_metadata.email_verified))
      return res.status(403).json({ error: "Please verify your email from the Account tab to use this feature.", needVerify: true });

    const { data: prof } = await supabaseAdmin.from("profiles").select("is_premium,is_admin").eq("id", u.user.id).single();
    const isAdmin = !!(prof && prof.is_admin);
    if (!isAdmin && !(prof && prof.is_premium)) return res.status(403).json({ error: "AI company info is a Premium feature." });

    const company = String((req.body && req.body.company) || "").trim().slice(0, 120);
    if (!company) return res.status(400).json({ error: "Missing company." });

    const month = new Date().toISOString().slice(0, 7);
    const { data: usageRow } = await supabaseAdmin.from("ai_email_usage").select("count").eq("user_id", u.user.id).eq("month", month).single();
    const used = (usageRow && usageRow.count) || 0;
    if (!isAdmin && used >= LIMIT) return res.status(429).json({ error: `You've used all ${LIMIT} AI company lookups this month.`, remaining: 0 });

    const sys = "You write one or two concise, professional sentences a job applicant can drop into a cover email, describing what the named game company is known for — their games, focus, or reputation. Be specific and factual where you can; if unsure, stay general and never invent details. Output only the sentence(s): no preamble, no quotes, no salutation.";
    const prompt = `Company: ${company}\n\nWrite 1-2 sentences about this game company to use in a job application email.`;

    let text = null;
    for (const model of CANDIDATES) {
      try {
        const ctl = new AbortController();
        const tmo = setTimeout(() => ctl.abort(), 20000);
        let r;
        try {
          r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(GEMINI_KEY)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: sys }] },
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.5, maxOutputTokens: 220 },
            }),
            signal: ctl.signal,
          });
        } finally { clearTimeout(tmo); }
        const data = await r.json().catch(() => ({}));
        const cand = data && data.candidates && data.candidates[0];
        const out = cand && cand.content && cand.content.parts && cand.content.parts.map((x) => x.text || "").join("").trim();
        if (out) { text = out; break; }
      } catch (e) { /* try next model */ }
    }
    if (!text) return res.status(503).json({ error: "Could not generate right now. Please try again." });

    if (!isAdmin) await supabaseAdmin.from("ai_email_usage").upsert({ user_id: u.user.id, month, count: used + 1 }, { onConflict: "user_id,month" });
    return res.status(200).json({ text, remaining: isAdmin ? null : Math.max(0, LIMIT - (used + 1)) });
  } catch (e) {
    return res.status(500).json({ error: "Something went wrong." });
  }
}