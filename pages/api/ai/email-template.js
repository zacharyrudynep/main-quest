import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { aiAccess, consumeFreeCredit } from "../../../lib/entitlements";
import { generateText, aiErrorResponse } from "../../../lib/gemini";
import { logAiTxn } from "../../../lib/aiTxn";

const LIMIT = 40; // shared monthly AI pool (ai_usage)

// POST -> a reusable email-application template using {company} and {position} markers.
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
    const authz = req.headers.authorization || "";
    const tok = authz.startsWith("Bearer ") ? authz.slice(7) : "";
    if (!tok) return res.status(401).json({ error: "Please sign in." });
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(tok);
    if (ue || !u || !u.user) return res.status(401).json({ error: "Please sign in." });
    const uid = u.user.id;
    const access = await aiAccess(supabaseAdmin, uid);
    const unlimited = access.unlimited; // admin or active student trial — no cap
    if (!access.ok) return res.status(403).json({ error: "AI template generation is a Premium feature." });
    // Students verified a school email when redeeming, so they skip the account-email gate.
    const emailVerified = !!(u.user.app_metadata && u.user.app_metadata.email_verified);
    if (!emailVerified && !access.isStudent)
      return res.status(403).json({ error: "Please verify your email from the Account tab to use this feature.", needVerify: true });
    const usingFree = !unlimited && !access.isPremium && access.freeCredits > 0;

    const month = new Date().toISOString().slice(0, 7);
    const { data: usageRow } = await supabaseAdmin.from("ai_usage").select("count").eq("user_id", uid).eq("month", month).single();
    const used = (usageRow && usageRow.count) || 0;
    if (!unlimited && !usingFree && used >= LIMIT) return res.status(429).json({ error: `You've used all ${LIMIT} template generations this month.`, remaining: 0 });

    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const name = String(b.name || "").slice(0, 80).trim();

    const sys = "You write a single, reusable, professional email template a candidate sends when applying to game-industry jobs by email. Use exactly the markers {company} and {position} where the company name and the role title belong (they are auto-filled per job). Do NOT invent a company or role. Structure: a greeting, one or two short paragraphs expressing genuine interest and a concise, credible reason they'd be a good fit for game development, and a professional sign-off. Warm but professional, about 120-160 words. End the sign-off with the applicant's name if provided, otherwise with [Your Name]. Output ONLY the email body text — no subject line, no commentary, no markdown.";
    const prompt = `Applicant name: ${name || "(not provided)"}\n\nWrite the reusable email application template now, using {company} and {position} markers.`;

    const g = await generateText({ system: sys, user: prompt, temperature: 0.7, maxOutputTokens: 1200, timeoutMs: 25000, generationExtras: { thinkingConfig: { thinkingBudget: 0 } } });
    await logAiTxn(supabaseAdmin, { userId: uid, kind: "email_template", g });
    if (!g.ok) return aiErrorResponse(res, g);
    const text = g.text.trim();

    if (usingFree) await consumeFreeCredit(supabaseAdmin, uid); else if (!unlimited) await supabaseAdmin.from("ai_usage").upsert({ user_id: uid, month, count: used + 1 }, { onConflict: "user_id,month" });
    return res.status(200).json({ text, remaining: unlimited ? null : (usingFree ? Math.max(0, access.freeCredits - 1) : Math.max(0, LIMIT - (used + 1))) });
  } catch (e) {
    return res.status(500).json({ error: "Something went wrong." });
  }
}