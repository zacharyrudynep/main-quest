// GET /api/stripe/status?userId=...
// Lightweight lookup the app uses to apply a user's tier (plan + premium flags).
// Uses the shared effectiveTier() so the client sees exactly what the server enforces
// — including a student trial that has lapsed (reverts to basic immediately).
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { effectiveTier } from "../../../lib/entitlements";

export default async function handler(req, res) {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: "Missing userId" });
  try {
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("is_premium, is_admin, plan, data, subscription_status, subscription_period_end")
      .eq("id", userId)
      .single();
    const t = effectiveTier(data);
    return res.status(200).json({
      isPremium: t.isPremium,
      isAdmin: t.isAdmin,
      isPlus: t.isPlus,
      plan: t.plan,
      student: t.isStudent,
      premiumUntil: t.premiumUntil,
      trialExpired: t.trialExpired,
      status: (data && data.subscription_status) || null,
      periodEnd: (data && data.subscription_period_end) || null,
    });
  } catch (e) {
    return res.status(200).json({ isPremium: false, isPlus: false, plan: "basic", status: null, periodEnd: null });
  }
}