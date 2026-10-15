// POST /api/admin/set-plan  (owner only)
// Admin override of a user's plan — no Stripe, no student verification.
//   body: { userId, plan: "basic"|"plus"|"premium"|"student", days? }
// - basic/plus:  clears premium + any trial markers, sets the tier.
// - premium:     permanent premium (is_premium = true), clears trial markers.
// - student:     time-boxed student trial (default 30 days) with the Student badge,
//                granted directly — no school-email OTP, no code redemption.
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").toLowerCase();

async function owner(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || !ADMIN_EMAIL) return false;
  const { data: u } = await supabaseAdmin.auth.getUser(token);
  return !!(u && u.user && (u.user.email || "").toLowerCase() === ADMIN_EMAIL);
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
    if (!(await owner(req))) return res.status(403).json({ error: "forbidden" });

    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const userId = String(b.userId || "").trim();
    const plan = String(b.plan || "").trim().toLowerCase();
    if (!userId) return res.status(400).json({ error: "Missing userId." });
    if (!["basic", "plus", "premium", "student"].includes(plan)) return res.status(400).json({ error: "Invalid plan." });
    const days = Number(b.days) > 0 ? Math.min(3650, Math.floor(Number(b.days))) : 30;

    const { data: prof } = await supabaseAdmin.from("profiles").select("data").eq("id", userId).single();
    const d = (prof && prof.data && typeof prof.data === "object") ? prof.data : {};
    // Start from the existing profile data minus any premium/trial markers.
    const base = { ...d };
    delete base.premiumUntil; delete base.studentTrialRedeemed; delete base.studentCode; delete base.studentVerifiedAt; delete base.studentTrialExpired;

    let patch;
    if (plan === "basic") patch = { is_premium: false, plan: "basic", data: base };
    else if (plan === "plus") patch = { is_premium: false, plan: "plus", data: base };
    else if (plan === "premium") patch = { is_premium: true, plan: "premium", data: base };
    else { // student — a time-boxed trial. plan stays "basic" so that when premiumUntil
      // passes the account reverts to basic cleanly (premium is driven by the trial window).
      const premiumUntil = Date.now() + days * 86400000;
      patch = { is_premium: true, plan: "basic", data: { ...base, premiumUntil, studentTrialRedeemed: true, studentCode: "ADMIN_GRANT", studentVerifiedAt: Date.now() } };
    }

    // On a downgrade, trim followed-company bells to the new tier's cap (don't delete the
    // profile's data — just enforce the limit). premium=∞, plus=15, basic=5.
    const cap = plan === "premium" || plan === "student" ? Infinity : plan === "plus" ? 15 : 5;
    if (cap !== Infinity && Array.isArray(patch.data.notifyCompanies) && patch.data.notifyCompanies.length > cap) {
      patch.data.notifyCompanies = patch.data.notifyCompanies.slice(0, cap);
    }

    const { error } = await supabaseAdmin.from("profiles").update(patch).eq("id", userId);
    if (error) return res.status(500).json({ error: error.message || "update failed" });
    return res.status(200).json({ ok: true, plan, days: plan === "student" ? days : null, premiumUntil: plan === "student" ? patch.data.premiumUntil : null });
  } catch (e) {
    return res.status(500).json({ error: "server error" });
  }
}