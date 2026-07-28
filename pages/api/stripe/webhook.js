// POST /api/stripe/webhook
// Stripe calls this after events. This is the ONLY place that grants or removes
// Premium — never trust the browser redirect for that.
//
// Handles two kinds of purchase:
//   • subscription (monthly / annual) → is_premium while active, revoked on cancel
//   • one-time lifetime payment       → is_premium forever, never revoked
import { stripe } from "../../../lib/stripe";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

// Stripe needs the RAW body to verify the signature.
export const config = { api: { bodyParser: false } };

async function readRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable)
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

async function updateProfile(userId, patch) {
  if (!userId || Object.keys(patch).length === 0) return;
  const { error } = await supabaseAdmin
    .from("profiles")
    .update(patch)
    .eq("id", userId);
  if (error) console.error("Supabase update error:", error.message);
}

// Look up which user a Stripe customer id belongs to.
async function userIdForCustomer(customerId) {
  if (!customerId) return null;
  const { data: rows } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .limit(1);
  return rows && rows[0] ? rows[0].id : null;
}

async function statusFor(userId) {
  if (!userId) return null;
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("subscription_status")
    .eq("id", userId)
    .single();
  return data ? data.subscription_status : null;
}

// Revoke access — but NEVER downgrade a lifetime buyer.
async function revoke(userId, patch) {
  if (!userId) return;
  if ((await statusFor(userId)) === "lifetime") return;
  await updateProfile(userId, patch);
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
      case "checkout.session.completed": {
        const s = event.data.object;
        const userId = s.client_reference_id || (s.metadata && s.metadata.userId);
        if (s.mode === "payment") {
          // One-time lifetime purchase — permanent access, no renewal.
          await updateProfile(userId, {
            is_premium: true,
            subscription_status: "lifetime",
            subscription_period_end: null,
            stripe_customer_id: s.customer,
          });
        } else {
          // Subscription (monthly/annual). Full detail also arrives via the
          // subscription.* events below.
          await updateProfile(userId, {
            is_premium: true,
            subscription_status: "active",
            stripe_customer_id: s.customer,
          });
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object;
        const userId =
          (sub.metadata && sub.metadata.userId) ||
          (await userIdForCustomer(sub.customer));
        // Don't let a subscription event clobber a lifetime buyer.
        if ((await statusFor(userId)) === "lifetime") break;
        const active = sub.status === "active" || sub.status === "trialing";
        await updateProfile(userId, {
          is_premium: active,
          subscription_status: sub.status,
          subscription_period_end: periodEndISO(sub),
          stripe_customer_id: sub.customer,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const userId =
          (sub.metadata && sub.metadata.userId) ||
          (await userIdForCustomer(sub.customer));
        await revoke(userId, { is_premium: false, subscription_status: "canceled" });
        break;
      }

      case "invoice.payment_failed": {
        const inv = event.data.object;
        const userId = await userIdForCustomer(inv.customer);
        await revoke(userId, { subscription_status: "past_due" });
        break;
      }

      default:
        break;
    }

    return res.status(200).json({ received: true });
  } catch (e) {
    console.error("Webhook handler error:", e.message);
    return res.status(500).json({ error: e.message });
  }
}