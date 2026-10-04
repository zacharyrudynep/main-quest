// POST /api/onboarding/claim-reward  (auth required)
// Grants ONE free AI credit when the user has actually completed onboarding.
// Verified server-side against the real profile so the credit can't be farmed.
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { onboardingComplete } from "../../../lib/entitlements";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return res.status(401).json({ error: "Please sign in." });
    const { data: u } = await supabaseAdmin.auth.getUser(token);
    if (!u || !u.user) return res.status(401).json({ error: "Please sign in." });
    const uid = u.user.id;

    const { data: prof } = await supabaseAdmin.from("profiles").select("is_premium,is_admin,plan,data").eq("id", uid).single();
    const d = (prof && prof.data && typeof prof.data === "object") ? prof.data : {};
    if (d.onboardingRewarded) return res.status(200).json({ ok: true, alreadyClaimed: true, freeCredits: Number(d.freeAiCredits) || 0 });

    const emailVerified = !!(u.user.email_confirmed_at || (u.user.app_metadata && u.user.app_metadata.email_verified) || d.email_verified);
    const isPlus = !!(prof && (prof.is_admin || prof.is_premium || prof.plan === "plus" || prof.plan === "premium" || (d.premiumUntil && Number(d.premiumUntil) > Date.now())));
    const status = onboardingComplete({ ...d, email_verified: emailVerified }, isPlus);
    if (!status.complete) return res.status(200).json({ ok: true, granted: false, reason: "not-complete", completeN: status.completeN, total: status.total });

    const nextCredits = (Number(d.freeAiCredits) || 0) + 1;
    const { error } = await supabaseAdmin.from("profiles").update({ data: { ...d, freeAiCredits: nextCredits, onboardingRewarded: true } }).eq("id", uid);
    if (error) return res.status(500).json({ error: "Couldn't grant your reward — try again." });
    return res.status(200).json({ ok: true, granted: true, freeCredits: nextCredits });
  } catch (e) {
    return res.status(500).json({ error: "server error" });
  }
}