import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").toLowerCase();

// Owner-only dashboard data. The caller must present a valid Supabase access token
// whose email matches ADMIN_EMAIL — verified SERVER-SIDE, so it can't be bypassed
// by loading the page or calling the endpoint directly.
export default async function handler(req, res) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return res.status(401).json({ error: "no token" });
    if (!ADMIN_EMAIL) return res.status(500).json({ error: "ADMIN_EMAIL not configured" });
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(token);
    const email = ((u && u.user && u.user.email) || "").toLowerCase();
    if (ue || !email || email !== ADMIN_EMAIL) return res.status(403).json({ error: "forbidden" });

    // ── Users + signups by day (page through auth users) ──
    let totalUsers = 0;
    const signupsByDay = {};
    try {
      let page = 1;
      const perPage = 1000;
      for (let i = 0; i < 20; i++) {
        const { data } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
        const users = (data && data.users) || [];
        totalUsers += users.length;
        for (const usr of users) {
          const d = (usr.created_at || "").slice(0, 10);
          if (d) signupsByDay[d] = (signupsByDay[d] || 0) + 1;
        }
        if (users.length < perPage) break;
        page++;
      }
    } catch (e) {}

    // ── Premium users ──
    let premiumUsers = 0;
    try {
      const { count } = await supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).eq("is_premium", true);
      premiumUsers = count || 0;
    } catch (e) {}

    // ── Applications (total + by day) ──
    let totalApplications = 0;
    const appsByDay = {};
    try {
      const { data: apps } = await supabaseAdmin.from("applications").select("applied_at").limit(100000);
      totalApplications = (apps || []).length;
      for (const a of apps || []) {
        const d = (a.applied_at || "").slice(0, 10);
        if (d) appsByDay[d] = (appsByDay[d] || 0) + 1;
      }
    } catch (e) {}

    // ── Events (clicks, shares) ──
    const eventTotals = {};
    let topClicked = [];
    let topShared = [];
    try {
      const { data: evs } = await supabaseAdmin.from("events").select("type,job_key,company").limit(100000);
      const clicks = {};
      const shares = {};
      for (const e of evs || []) {
        eventTotals[e.type] = (eventTotals[e.type] || 0) + 1;
        const label = e.job_key || e.company || "";
        if (!label) continue;
        if (e.type === "job_apply_click") clicks[label] = (clicks[label] || 0) + 1;
        else if (e.type === "job_share") shares[label] = (shares[label] || 0) + 1;
      }
      const top = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([label, count]) => ({ label, count }));
      topClicked = top(clicks);
      topShared = top(shares);
    } catch (e) {}

    // ── 30-day series ──
    const days = [];
    for (let i = 29; i >= 0; i--) days.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
    const signupSeries = days.map((d) => ({ date: d, count: signupsByDay[d] || 0 }));
    const appSeries = days.map((d) => ({ date: d, count: appsByDay[d] || 0 }));

    res.status(200).json({
      generatedAt: new Date().toISOString(),
      totalUsers,
      premiumUsers,
      premiumPct: totalUsers ? Math.round((premiumUsers / totalUsers) * 1000) / 10 : 0,
      totalApplications,
      totalClicks: eventTotals["job_apply_click"] || 0,
      totalShares: eventTotals["job_share"] || 0,
      eventTotals,
      signupSeries,
      appSeries,
      topClicked,
      topShared,
    });
  } catch (e) {
    res.status(500).json({ error: "server error" });
  }
}