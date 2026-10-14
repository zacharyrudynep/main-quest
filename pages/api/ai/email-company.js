import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { aiAccess, consumeFreeCredit } from "../../../lib/entitlements";
import { generateText, aiErrorResponse } from "../../../lib/gemini";

const LIMIT = 40; // shared monthly AI pool (ai_usage)

// POST { company } -> { text, remaining }
// Premium + verified only. Generates 1-2 sentences about a game company to drop
// into an email application.
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

    const authz = req.headers.authorization || "";
    const tok = authz.startsWith("Bearer ") ? authz.slice(7) : "";
    if (!tok) return res.status(401).json({ error: "Please sign in." });
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(tok);
    if (ue || !u || !u.user) return res.status(401).json({ error: "Please sign in." });
    const access = await aiAccess(supabaseAdmin, u.user.id);
    const unlimited = access.unlimited; // admin or active student trial — no cap
    if (!access.ok) return res.status(403).json({ error: "AI company info is a Premium feature." });
    // Students verified a school email when redeeming, so they skip the account-email gate.
    const emailVerified = !!(u.user.app_metadata && u.user.app_metadata.email_verified);
    if (!emailVerified && !access.isStudent)
      return res.status(403).json({ error: "Please verify your email from the Account tab to use this feature.", needVerify: true });
    const usingFree = !unlimited && !access.isPremium && access.freeCredits > 0;

    const company = String((req.body && req.body.company) || "").trim().slice(0, 120);
    if (!company) return res.status(400).json({ error: "Missing company." });

    const month = new Date().toISOString().slice(0, 7);
    const { data: usageRow } = await supabaseAdmin.from("ai_usage").select("count").eq("user_id", u.user.id).eq("month", month).single();
    const used = (usageRow && usageRow.count) || 0;
    if (!unlimited && !usingFree && used >= LIMIT) return res.status(429).json({ error: `You've used all ${LIMIT} AI company lookups this month.`, remaining: 0 });

    const sys = "You write one or two concise, professional sentences a job applicant can drop into a cover email, describing what the named game company is known for — their games, focus, or reputation. Be specific and factual where you can; if unsure, stay general and never invent details. Output only the sentence(s): no preamble, no quotes, no salutation.";
    const prompt = `Company: ${company}\n\nWrite 1-2 sentences about this game company to use in a job application email.`;

    const g = await generateText({ system: sys, user: prompt, temperature: 0.5, maxOutputTokens: 800, timeoutMs: 20000 });
    if (!g.ok) return aiErrorResponse(res, g);
    const text = g.text.trim();

    if (usingFree) await consumeFreeCredit(supabaseAdmin, u.user.id); else if (!unlimited) await supabaseAdmin.from("ai_usage").upsert({ user_id: u.user.id, month, count: used + 1 }, { onConflict: "user_id,month" });
    return res.status(200).json({ text, remaining: unlimited ? null : (usingFree ? Math.max(0, access.freeCredits - 1) : Math.max(0, LIMIT - (used + 1))) });
  } catch (e) {
    return res.status(500).json({ error: "Something went wrong." });
  }
}