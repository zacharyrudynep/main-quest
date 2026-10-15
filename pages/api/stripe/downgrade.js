// POST /api/stripe/downgrade  { userId }
// Lets a paying/plus user drop to the free Basic plan.
//  - Real Stripe subscribers → returned a Billing Portal URL to cancel/downgrade
//    (the canonical, safe path; Stripe updates their billing and the webhook reverts
//    the profile when the subscription ends).
//  - Admin-granted / trial / non-Stripe accounts → reverted to Basic directly, with
//    followed-company bells trimmed to the Basic cap (nothing else is deleted).
import { stripe } from "../../../lib/stripe";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mainquestjobs.com";

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed" }); }
  try {
    const authz = req.headers.authorization || "";
    const tok = authz.startsWith("Bearer ") ? authz.slice(7) : "";
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    let uid = body.userId;
    if (tok) { const { data: u } = await supabaseAdmin.auth.getUser(tok); if (u && u.user) uid = u.user.id; }
    if (!uid) return res.status(401).json({ error: "Please sign in." });

    const { data: prof } = await supabaseAdmin
      .from("profiles").select("stripe_customer_id,subscription_status,plan,is_premium,data").eq("id", uid).single();
    const status = String((prof && prof.subscription_status) || "").toLowerCase();
    const d = (prof && prof.data && typeof prof.data === "object") ? prof.data : {};

    if (status === "lifetime") return res.status(400).json({ error: "Lifetime access can't be downgraded." });

    // Active Stripe subscription → hand off to the hosted Billing Portal to cancel.
    if (prof && prof.stripe_customer_id && (status === "active" || status === "trialing" || status === "past_due")) {
      try {
        const session = await stripe.billingPortal.sessions.create({ customer: prof.stripe_customer_id, return_url: `${SITE_URL}/` });
        return res.status(200).json({ url: session.url });
      } catch (e) { /* fall through to a direct downgrade if the portal can't open */ }
    }

    // No cancelable Stripe subscription → revert to Basic directly (keep all other data).
    const base = { ...d };
    delete base.premiumUntil; delete base.studentTrialRedeemed; delete base.studentCode; delete base.studentVerifiedAt; delete base.studentTrialExpired;
    if (Array.isArray(base.notifyCompanies) && base.notifyCompanies.length > 5) base.notifyCompanies = base.notifyCompanies.slice(0, 5);
    const { error } = await supabaseAdmin.from("profiles").update({ is_premium: false, plan: "basic", data: base }).eq("id", uid);
    if (error) return res.status(500).json({ error: error.message || "Couldn't downgrade." });
    return res.status(200).json({ ok: true, downgraded: true });
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
}