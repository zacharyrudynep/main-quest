// POST /api/stripe/finalize
// After a successful join-flow checkout, the client creates the account and calls
// this with { sessionId, userId }. We verify the session was actually paid, then
// grant Premium on that profile and store the Stripe customer id so future
// subscription webhooks (renewals/cancellations) can find the user.
import { stripe } from "../../../lib/stripe";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { sessionId, userId } = req.body || {};
    if (!sessionId || !userId) return res.status(400).json({ error: "Missing sessionId or userId" });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return res.status(402).json({ error: "Payment not completed", paid: false });
    }

    const plan = (session.metadata && session.metadata.plan) || "monthly";
    const customerId = session.customer || null;

    let subStatus = "active";
    let periodEnd = null;
    if (session.mode === "payment") {
      subStatus = "lifetime"; // one-time payment — never revoked
    } else if (session.subscription) {
      try {
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        subStatus = sub.status || "active";
        if (sub.current_period_end) periodEnd = new Date(sub.current_period_end * 1000).toISOString();
      } catch (e) { /* keep defaults */ }
    }

    await supabaseAdmin
      .from("profiles")
      .update({
        is_premium: true,
        stripe_customer_id: customerId,
        subscription_status: subStatus,
        subscription_period_end: periodEnd,
      })
      .eq("id", userId);

    return res.status(200).json({ ok: true, plan, status: subStatus });
  } catch (e) {
    console.error("finalize error:", e.message);
    return res.status(500).json({ error: e.message });
  }
}
