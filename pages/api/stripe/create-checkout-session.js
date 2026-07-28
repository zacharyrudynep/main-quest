// POST /api/stripe/create-checkout-session
// Starts a Stripe Checkout session for the chosen plan and returns the URL to
// redirect to. The webhook (not this route) is what actually grants Premium.
import { stripe } from "../../../lib/stripe";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://main-quest-beta.vercel.app";

// Each plan maps to a Stripe Price id (from env) and a Checkout mode.
// monthly + annual are recurring subscriptions; lifetime is a one-time payment.
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
    const { userId, email, plan } = req.body || {};
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const key = PLANS[plan] ? plan : "monthly"; // default to monthly if unknown
    const chosen = PLANS[key];
    if (!chosen.price)
      return res
        .status(500)
        .json({ error: `Price for the "${key}" plan is not configured` });

    // Reuse this user's existing Stripe customer if we've seen them before.
    let customerId = null;
    const { data: profileRow } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();
    if (profileRow && profileRow.stripe_customer_id)
      customerId = profileRow.stripe_customer_id;

    const session = await stripe.checkout.sessions.create({
      mode: chosen.mode,
      line_items: [{ price: chosen.price, quantity: 1 }],
      ...(customerId
        ? { customer: customerId }
        : email
        ? { customer_email: email }
        : {}),
      client_reference_id: userId,
      metadata: { userId, plan: key },
      // Only subscriptions carry subscription_data.
      ...(chosen.mode === "subscription"
        ? { subscription_data: { metadata: { userId, plan: key } } }
        : {}),
      allow_promotion_codes: true, // lets users enter a launch coupon at checkout
      success_url: `${SITE_URL}/?checkout=success`,
      cancel_url: `${SITE_URL}/?checkout=cancel`,
    });

    return res.status(200).json({ url: session.url });
  } catch (e) {
    console.error("create-checkout-session error:", e.message);
    return res.status(500).json({ error: e.message });
  }
}