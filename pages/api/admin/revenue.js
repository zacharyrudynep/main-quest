import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Active subscriptions → MRR
let mrr = 0, active = 0, starting = null;
for await (const sub of stripe.subscriptions.list({ status: "active", limit: 100 }).autoPagingEach ? [] : []) {}
const subs = await stripe.subscriptions.list({ status: "active", limit: 100 });
for (const s of subs.data) {
  active++;
  const item = s.items.data[0];
  const amt = (item.price.unit_amount || 0) / 100;      // dollars
  const interval = item.price.recurring.interval;         // "month" | "year"
  mrr += interval === "year" ? amt / 12 : amt;            // normalize to monthly
}

// Revenue → sum of paid charges (or use balance transactions for net)
const charges = await stripe.charges.list({ limit: 100 });
const revenue = charges.data.filter(c => c.paid).reduce((t, c) => t + c.amount / 100, 0);