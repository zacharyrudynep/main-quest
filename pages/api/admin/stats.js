import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").toLowerCase();
const top = (o, n = 10) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([label, count]) => ({ label, count }));

// Owner-only dashboard data, all computed natively from your own Supabase data.
export default async function handler(req, res) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return res.status(401).json({ error: "no token" });
    if (!ADMIN_EMAIL) return res.status(500).json({ error: "ADMIN_EMAIL not configured" });
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(token);
    const email = ((u && u.user && u.user.email) || "").toLowerCase();
    if (ue || !email || email !== ADMIN_EMAIL) return res.status(403).json({ error: "forbidden" });

    // ── Users + signups by day ──
    let totalUsers = 0;
    const signupsByDay = {};
    try {
      let page = 1;
      for (let i = 0; i < 20; i++) {
        const { data } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
        const users = (data && data.users) || [];
        totalUsers += users.length;
        for (const usr of users) { const d = (usr.created_at || "").slice(0, 10); if (d) signupsByDay[d] = (signupsByDay[d] || 0) + 1; }
        if (users.length < 1000) break;
        page++;
      }
    } catch (e) {}

    // ── Profiles: premium, resumes, completion ──
    let premiumUsers = 0, resumesUploaded = 0, completeProfiles = 0;
    try {
      const { data: profs } = await supabaseAdmin.from("profiles").select("data,is_premium").limit(100000);
      for (const p of profs || []) {
        if (p.is_premium) premiumUsers++;
        const d = p.data || {};
        if (d.resumeFileName || d.resumeText) resumesUploaded++;
        if (d.role && d.experience && (d.skills || d.resumeText)) completeProfiles++;
      }
    } catch (e) {}

    // ── Applications ──
    let totalApplications = 0;
    const appsByDay = {}, appsByCompany = {};
    try {
      const { data: apps } = await supabaseAdmin.from("applications").select("applied_at,company").limit(100000);
      totalApplications = (apps || []).length;
      for (const a of apps || []) {
        const d = (a.applied_at || "").slice(0, 10); if (d) appsByDay[d] = (appsByDay[d] || 0) + 1;
        if (a.company) appsByCompany[a.company] = (appsByCompany[a.company] || 0) + 1;
      }
    } catch (e) {}

    // ── Saved jobs ──
    let totalSaves = 0;
    const savesByJob = {};
    try {
      const { data: sv } = await supabaseAdmin.from("saved_jobs").select("job_title,company").limit(100000);
      totalSaves = (sv || []).length;
      for (const s of sv || []) { const label = `${s.company}|${s.job_title}`; savesByJob[label] = (savesByJob[label] || 0) + 1; }
    } catch (e) {}

    // ── Events (views, clicks, shares, searches) ──
    const eventTotals = {};
    const clicks = {}, shares = {}, views = {}, searches = {}, zeros = {}, shareMethods = {};
    try {
      const { data: evs } = await supabaseAdmin.from("events").select("type,job_key,company,meta").limit(100000);
      for (const e of evs || []) {
        eventTotals[e.type] = (eventTotals[e.type] || 0) + 1;
        const label = e.job_key || e.company || "";
        if (e.type === "job_apply_click" && label) clicks[label] = (clicks[label] || 0) + 1;
        else if (e.type === "job_view" && label) views[label] = (views[label] || 0) + 1;
        else if (e.type === "job_share") { if (label) shares[label] = (shares[label] || 0) + 1; const via = e.meta && e.meta.via; if (via) shareMethods[via] = (shareMethods[via] || 0) + 1; }
        else if (e.type === "search" && e.meta && e.meta.q) { const q = String(e.meta.q).toLowerCase(); searches[q] = (searches[q] || 0) + 1; if (e.meta.results === 0) zeros[q] = (zeros[q] || 0) + 1; }
      }
    } catch (e) {}

    // ── 30-day series ──
    const days = [];
    for (let i = 29; i >= 0; i--) days.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));

    res.status(200).json({
      generatedAt: new Date().toISOString(),
      // Users
      totalUsers,
      premiumUsers,
      freeUsers: Math.max(0, totalUsers - premiumUsers),
      premiumPct: totalUsers ? Math.round((premiumUsers / totalUsers) * 1000) / 10 : 0,
      resumesUploaded,
      completeProfiles,
      // Activity
      totalApplications,
      totalSaves,
      totalViews: eventTotals["job_view"] || 0,
      totalClicks: eventTotals["job_apply_click"] || 0,
      totalShares: eventTotals["job_share"] || 0,
      totalSearches: eventTotals["search"] || 0,
      // Series
      signupSeries: days.map((d) => ({ date: d, count: signupsByDay[d] || 0 })),
      appSeries: days.map((d) => ({ date: d, count: appsByDay[d] || 0 })),
      // Top lists
      topViewed: top(views),
      topClicked: top(clicks),
      topSaved: top(savesByJob),
      topShared: top(shares),
      topAppliedCompanies: top(appsByCompany),
      shareMethods: top(shareMethods),
      topSearches: top(searches),
      zeroResultSearches: top(zeros),
      eventTotals,
    });
  } catch (e) {
    res.status(500).json({ error: "server error" });
  }
}