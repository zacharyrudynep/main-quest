// POST /api/stripe/create-checkout-session
// Starts a Stripe Checkout session for the Premium subscription and returns the
// URL the browser should redirect to. The webhook (not this route) is what
// actually grants Premium once payment succeeds.
import { stripe } from "../../../lib/stripe";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://main-quest-beta.vercel.app";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { userId, email } = req.body || {};
    if (!userId) return res.status(400).json({ error: "Missing userId" });
    if (!process.env.STRIPE_PRICE_ID)
      return res.status(500).json({ error: "STRIPE_PRICE_ID is not set" });

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
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      // Attach to an existing customer, or let Stripe create one from the email.
      ...(customerId
        ? { customer: customerId }
        : email
        ? { customer_email: email }
        : {}),
      // These let the webhook know WHICH user this payment belongs to.
      client_reference_id: userId,
      metadata: { userId },
      subscription_data: { metadata: { userId } },
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
