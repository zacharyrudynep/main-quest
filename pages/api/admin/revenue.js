import Stripe from "stripe";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").toLowerCase();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const money = (n) => Math.round(n * 100) / 100;

// Owner-only revenue metrics pulled live from the Stripe API.
export default async function handler(req, res) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return res.status(401).json({ error: "no token" });
    if (!ADMIN_EMAIL) return res.status(500).json({ error: "ADMIN_EMAIL not configured" });
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(token);
    const em = ((u && u.user && u.user.email) || "").toLowerCase();
    if (ue || !em || em !== ADMIN_EMAIL) return res.status(403).json({ error: "forbidden" });

    if (!stripe) return res.status(200).json({ configured: false });

    const cutoff = Math.floor(Date.now() / 1000) - 30 * 86400;

    // ── Active subscriptions → MRR + plan mix ──
    let mrr = 0, activeSubs = 0, i = 0;
    const planCounts = {};
    for await (const sub of stripe.subscriptions.list({ status: "active", limit: 100 })) {
      activeSubs++;
      const item = sub.items && sub.items.data && sub.items.data[0];
      if (item && item.price) {
        const amt = (item.price.unit_amount || 0) / 100;
        const interval = item.price.recurring && item.price.recurring.interval;
        mrr += interval === "year" ? amt / 12 : amt;
        const plan = interval === "year" ? "Annual" : "Monthly";
        planCounts[plan] = (planCounts[plan] || 0) + 1;
      }
      if (++i >= 5000) break;
    }

    // ── Charges → revenue (all-time + 30d + by day + one-time lifetime) ──
    let totalRevenue = 0, revenue30 = 0, lifetimeCount = 0, c = 0;
    const revByDay = {};
    for await (const ch of stripe.charges.list({ limit: 100 })) {
      if (ch.paid && !ch.refunded) {
        const amt = (ch.amount - (ch.amount_refunded || 0)) / 100;
        totalRevenue += amt;
        if (ch.created >= cutoff) {
          revenue30 += amt;
          const d = new Date(ch.created * 1000).toISOString().slice(0, 10);
          revByDay[d] = (revByDay[d] || 0) + amt;
        }
        if (!ch.invoice) lifetimeCount++; // no invoice → one-time (lifetime) purchase
      }
      if (++c >= 5000) break;
    }

    // ── New + canceled subs in the last 30 days (churn) ──
    let newSubs30 = 0, canceledSubs30 = 0, n = 0, k = 0;
    for await (const sub of stripe.subscriptions.list({ limit: 100, created: { gte: cutoff } })) { newSubs30++; if (++n >= 2000) break; }
    for await (const sub of stripe.subscriptions.list({ status: "canceled", limit: 100 })) { if (sub.canceled_at && sub.canceled_at >= cutoff) canceledSubs30++; if (++k >= 5000) break; }

    const days = [];
    for (let j = 29; j >= 0; j--) days.push(new Date(Date.now() - j * 86400000).toISOString().slice(0, 10));

    res.status(200).json({
      configured: true,
      mrr: money(mrr),
      arr: money(mrr * 12),
      activeSubs,
      totalRevenue: money(totalRevenue),
      revenue30: money(revenue30),
      lifetimeCount,
      newSubs30,
      canceledSubs30,
      churnPct: activeSubs + canceledSubs30 > 0 ? Math.round((canceledSubs30 / (activeSubs + canceledSubs30)) * 1000) / 10 : 0,
      planCounts: Object.entries(planCounts).map(([label, count]) => ({ label, count })),
      revenueSeries: days.map((d) => ({ date: d, count: money(revByDay[d] || 0) })),
    });
  } catch (e) {
    res.status(500).json({ error: "stripe error", detail: String((e && e.message) || e) });
  }
}