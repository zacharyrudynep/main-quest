// POST /api/stripe/create-portal-session
// Opens Stripe's hosted Billing Portal so a subscriber can update their card,
// cancel, or change plans. Returns the URL to redirect to.
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
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const { data: profileRow } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single();

    if (!profileRow || !profileRow.stripe_customer_id)
      return res.status(400).json({ error: "No subscription on file" });

    const session = await stripe.billingPortal.sessions.create({
      customer: profileRow.stripe_customer_id,
      return_url: `${SITE_URL}/`,
    });

    return res.status(200).json({ url: session.url });
  } catch (e) {
    console.error("create-portal-session error:", e.message);
    return res.status(500).json({ error: e.message });
  }
}
