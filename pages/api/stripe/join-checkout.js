// POST /api/stripe/join-checkout
// Starts a Stripe Checkout session for a NEW visitor who has not created an
// account yet (the join flow defers account creation until payment succeeds).
// On success Stripe returns to /join?checkout=success&session_id=..., where the
// client creates the account and calls /api/stripe/finalize to grant Premium.
import { stripe } from "../../../lib/stripe";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://main-quest-beta.vercel.app";

const PLANS = {
  monthly:  { price: process.env.STRIPE_PRICE_MONTHLY,  mode: "subscription" },
  annual:   { price: process.env.STRIPE_PRICE_ANNUAL,   mode: "subscription" },
  lifetime: { price: process.env.STRIPE_PRICE_LIFETIME, mode: "payment" },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { email, plan } = req.body || {};
    if (!email) return res.status(400).json({ error: "Missing email" });

    const key = PLANS[plan] ? plan : "monthly";
    const chosen = PLANS[key];
    if (!chosen.price) return res.status(500).json({ error: `Price for the "${key}" plan is not configured` });

    const session = await stripe.checkout.sessions.create({
      mode: chosen.mode,
      line_items: [{ price: chosen.price, quantity: 1 }],
      customer_email: email,
      metadata: { plan: key, joinFlow: "1" },
      ...(chosen.mode === "subscription" ? { subscription_data: { metadata: { plan: key, joinFlow: "1" } } } : {}),
      allow_promotion_codes: true,
      success_url: `${SITE_URL}/join?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/join?checkout=cancel`,
    });

    return res.status(200).json({ url: session.url });
  } catch (e) {
    console.error("join-checkout error:", e.message);
    return res.status(500).json({ error: e.message });
  }
}
