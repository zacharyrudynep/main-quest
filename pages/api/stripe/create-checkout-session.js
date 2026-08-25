// POST /api/stripe/create-checkout-session
// Starts a Stripe Checkout session for a LOGGED-IN user upgrading to Premium and
// returns the URL the browser should redirect to. The webhook (not this route) is
// what actually grants Premium once payment succeeds.
import { stripe } from "../../../lib/stripe";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://mainquestjobs.com";

// The three plans the in-app Upgrade modal offers. monthly falls back to the
// legacy STRIPE_PRICE_ID so nothing breaks if only that one is configured.
const PLANS = {
  monthly:  { price: process.env.STRIPE_PRICE_MONTHLY || process.env.STRIPE_PRICE_ID, mode: "subscription" },
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

    // Pick the requested plan (default to monthly for anything unrecognized).
    const key = PLANS[plan] ? plan : "monthly";
    const chosen = PLANS[key];
    if (!chosen.price)
      return res.status(500).json({ error: `Price for the "${key}" plan is not configured` });

    // Reuse this user's existing Stripe customer if we've seen them before, so a
    // person never ends up with duplicate customer records.
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
      // Attach to an existing customer, or let Stripe create one from the email.
      ...(customerId
        ? { customer: customerId }
        : email
        ? { customer_email: email }
        : {}),
      // These let the webhook know WHICH user this payment belongs to.
      client_reference_id: userId,
      metadata: { userId, plan: key },
      // subscription_data is only valid for subscription mode (not lifetime).
      ...(chosen.mode === "subscription"
        ? { subscription_data: { metadata: { userId, plan: key } } }
        : {}),
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