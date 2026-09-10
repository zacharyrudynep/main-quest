// POST /api/stripe/join-checkout
// Checkout for a NEW visitor (account created after payment succeeds).
import { stripe } from "../../../lib/stripe";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mainquestjobs.com";

const PRICES = {
  "plus:monthly":     { price: process.env.STRIPE_PRICE_PLUS_MONTHLY,     mode: "subscription", plan: "plus" },
  "plus:yearly":      { price: process.env.STRIPE_PRICE_PLUS_YEARLY,      mode: "subscription", plan: "plus" },
  "premium:monthly":  { price: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,  mode: "subscription", plan: "premium" },
  "premium:yearly":   { price: process.env.STRIPE_PRICE_PREMIUM_YEARLY,   mode: "subscription", plan: "premium" },
  "premium:lifetime": { price: process.env.STRIPE_PRICE_PREMIUM_LIFETIME, mode: "payment",      plan: "premium" },
};

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed" }); }
  try {
    const { email, plan, cycle } = req.body || {};
    if (!email) return res.status(400).json({ error: "Missing email" });
    const tier = (plan === "plus" || plan === "premium") ? plan : "premium";
    const cyc = (cycle === "yearly" || cycle === "lifetime") ? cycle : "monthly";
    const key = `${tier}:${cyc}`;
    const chosen = PRICES[key];
    if (!chosen || !chosen.price) return res.status(500).json({ error: `Price for "${key}" is not configured` });

    const meta = { plan: chosen.plan, cycle: cyc, joinFlow: "1" };
    const session = await stripe.checkout.sessions.create({
      mode: chosen.mode,
      line_items: [{ price: chosen.price, quantity: 1 }],
      customer_email: email,
      metadata: meta,
      ...(chosen.mode === "subscription" ? { subscription_data: { metadata: meta } } : {}),
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