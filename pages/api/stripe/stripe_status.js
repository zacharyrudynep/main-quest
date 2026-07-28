// GET /api/stripe/status?userId=...
// Lightweight lookup the app can call to show whether a user is Premium.
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: "Missing userId" });
  try {
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("is_premium, subscription_status, subscription_period_end")
      .eq("id", userId)
      .single();
    return res.status(200).json({
      isPremium: !!(data && data.is_premium),
      status: (data && data.subscription_status) || null,
      periodEnd: (data && data.subscription_period_end) || null,
    });
  } catch (e) {
    return res.status(200).json({ isPremium: false, status: null, periodEnd: null });
  }
}
