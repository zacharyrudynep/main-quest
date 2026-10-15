// GET /api/stripe/status?userId=...
// Lightweight lookup the app uses to apply a user's tier (plan + premium flags).
// IMPORTANT: this must return `plan` — the client derives Plus-tier features from it.
// Without it, an admin-set Plus account would never actually unlock Plus features.
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: "Missing userId" });
  try {
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("is_premium, is_admin, plan, data, subscription_status, subscription_period_end")
      .eq("id", userId)
      .single();
    const d = (data && data.data && typeof data.data === "object") ? data.data : {};
    const trialActive = !!(d.premiumUntil && Number(d.premiumUntil) > Date.now());
    const isPremium = !!(data && (data.is_premium || data.is_admin || data.plan === "premium" || trialActive));
    // Effective tier: an explicit plan wins; otherwise infer from premium status.
    const plan = (data && data.plan) || (isPremium ? "premium" : "basic");
    return res.status(200).json({
      isPremium,
      isAdmin: !!(data && data.is_admin),
      plan,
      student: !!(d.studentTrialRedeemed && trialActive),
      premiumUntil: d.premiumUntil || null,
      status: (data && data.subscription_status) || null,
      periodEnd: (data && data.subscription_period_end) || null,
    });
  } catch (e) {
    return res.status(200).json({ isPremium: false, plan: "basic", status: null, periodEnd: null });
  }
}