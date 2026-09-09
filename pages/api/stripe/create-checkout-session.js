// POST /api/stripe/create-checkout-session
// Starts a Stripe Checkout session for the chosen tier + billing cycle and
// returns the URL to redirect to. The webhook grants the plan.
import { stripe } from "../../../lib/stripe";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mainquestjobs.com";

// tier:cycle -> Stripe Price id (from env), Checkout mode, and the plan to grant.
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
    const { userId, email, plan, cycle } = req.body || {};
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const tier = (plan === "plus" || plan === "premium") ? plan : "premium";
    const cyc = (cycle === "yearly" || cycle === "lifetime") ? cycle : "monthly";
    const key = `${tier}:${cyc}`;
    const chosen = PRICES[key];
    if (!chosen || !chosen.price) return res.status(500).json({ error: `Price for "${key}" is not configured` });

    // Reuse this user's existing Stripe customer if we've seen them before.
    let customerId = null;
    const { data: profileRow } = await supabaseAdmin.from("profiles").select("stripe_customer_id").eq("id", userId).single();
    if (profileRow && profileRow.stripe_customer_id) customerId = profileRow.stripe_customer_id;

    const meta = { userId, plan: chosen.plan, cycle: cyc };
    const session = await stripe.checkout.sessions.create({
      mode: chosen.mode,
      line_items: [{ price: chosen.price, quantity: 1 }],
      ...(customerId ? { customer: customerId } : email ? { customer_email: email } : {}),
      client_reference_id: userId,
      metadata: meta,
      ...(chosen.mode === "subscription" ? { subscription_data: { metadata: meta } } : {}),
      allow_promotion_codes: true,
      success_url: `${SITE_URL}/?checkout=success`,
      cancel_url: `${SITE_URL}/?checkout=cancel`,
    });
    return res.status(200).json({ url: session.url });
  } catch (e) {
    console.error("create-checkout-session error:", e.message);
    return res.status(500).json({ error: e.message });
  }
}