// POST /api/stripe/webhook
// Stripe calls this after events (payment succeeded, subscription changed, etc.).
// This is the ONLY place that grants or removes Premium — never trust the
// browser redirect for that, because a user can close the tab before it fires.
//
// The signature is verified with STRIPE_WEBHOOK_SECRET so nobody can fake events.
import { stripe } from "../../../lib/stripe";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

// Stripe needs the RAW request body to verify the signature, so we turn off
// Next.js's automatic JSON body parsing for this route.
export const config = { api: { bodyParser: false } };

// Read the raw request body without pulling in an extra dependency.
async function readRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable)
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

// Patch a profile row by user id.
async function updateProfile(userId, patch) {
  if (!userId || Object.keys(patch).length === 0) return;
  const { error } = await supabaseAdmin
    .from("profiles")
    .update(patch)
    .eq("id", userId);
  if (error) console.error("Supabase update error:", error.message);
}

// When an event only carries the Stripe customer id, look up which user that is.
async function updateByCustomer(customerId, patch) {
  if (!customerId) return;
  const { data: rows } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .limit(1);
  if (rows && rows[0]) await updateProfile(rows[0].id, patch);
}

const periodEndISO = (sub) =>
  sub && sub.current_period_end
    ? new Date(sub.current_period_end * 1000).toISOString()
    : null;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  let event;
  try {
    const raw = await readRawBody(req);
    const sig = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(
      raw,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      // First successful payment through Checkout → turn Premium on and save the
      // customer id so we can find this person again later. A one-time (lifetime)
      // payment is marked "lifetime" so it's never treated as a cancelable sub.
      case "checkout.session.completed": {
        const s = event.data.object;
        const userId = s.client_reference_id || (s.metadata && s.metadata.userId);
        const isLifetime = s.mode === "payment";
        await updateProfile(userId, {
          is_premium: true,
          subscription_status: isLifetime ? "lifetime" : "active",
          stripe_customer_id: s.customer,
        });
        break;
      }

      // Subscription created or changed (renewals, plan changes, resubscribes).
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object;
        const userId = sub.metadata && sub.metadata.userId;
        const active = sub.status === "active" || sub.status === "trialing";
        const patch = {
          is_premium: active,
          subscription_status: sub.status,
          subscription_period_end: periodEndISO(sub),
          stripe_customer_id: sub.customer,
        };
        if (userId) await updateProfile(userId, patch);
        else await updateByCustomer(sub.customer, patch);
        break;
      }

      // Subscription fully ended → turn Premium off.
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const userId = sub.metadata && sub.metadata.userId;
        const patch = { is_premium: false, subscription_status: "canceled" };
        if (userId) await updateProfile(userId, patch);
        else await updateByCustomer(sub.customer, patch);
        break;
      }

      // A renewal payment failed → mark past_due (Stripe will retry; if it keeps
      // failing you'll get a subscription.deleted event later).
      case "invoice.payment_failed": {
        const inv = event.data.object;
        await updateByCustomer(inv.customer, { subscription_status: "past_due" });
        break;
      }

      default:
        break; // ignore everything else
    }

    return res.status(200).json({ received: true });
  } catch (e) {
    console.error("Webhook handler error:", e.message);
    return res.status(500).json({ error: e.message });
  }
}