// GET /api/admin/new-jobs — owner-only. Lists recently-posted jobs, newest first,
// drawn from the live board snapshot. A job carries a date when its ATS feed provided
// a real post date OR when our first-seen tracker dated it on the day we first pulled
// it; those first-seen ones are flagged so you can tell them apart. Jobs with no date
// at all (e.g. Greenhouse, whose public feed has no real post date) appear here only
// once first-seen has dated them.
import zlib from "zlib";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").toLowerCase();
const WINDOW_DAYS = 30;
const _nk = (c, t) => `${String(c || "").trim().toLowerCase().replace(/\s+/g, " ")}|${String(t || "").trim().toLowerCase().replace(/\s+/g, " ")}`;

export default async function handler(req, res) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return res.status(401).json({ error: "no token" });
    if (!ADMIN_EMAIL) return res.status(500).json({ error: "ADMIN_EMAIL not configured" });
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(token);
    const email = ((u && u.user && u.user.email) || "").toLowerCase();
    if (ue || !email || email !== ADMIN_EMAIL) return res.status(403).json({ error: "forbidden" });

    // Current board snapshot.
    const { data: live } = await supabaseAdmin.from("job_cache").select("data,updated_at").eq("id", "live").single();
    const gz = live && live.data && live.data.gz;
    if (!gz) return res.status(200).json({ generatedAt: new Date().toISOString(), windowDays: WINDOW_DAYS, total: 0, counts: { today: 0, week: 0, dated: 0 }, jobs: [], note: "no snapshot yet" });
    let map;
    try { map = JSON.parse(zlib.gunzipSync(Buffer.from(gz, "base64"), { maxOutputLength: 80 * 1024 * 1024 }).toString("utf8")); }
    catch (e) { return res.status(200).json({ error: "could not read snapshot", detail: String((e && e.message) || e).slice(0, 200) }); }

    // Which keys were dated by the first-seen tracker (stamp > 0) vs. a real ATS date.
    const firstSeen = new Set();
    try {
      const { data: seen } = await supabaseAdmin.from("job_cache").select("data").eq("id", "job_seen").single();
      const keys = (seen && seen.data && seen.data.keys) || {};
      for (const k in keys) { const e = keys[k]; if (Array.isArray(e) && e[0] > 0) firstSeen.add(k); }
    } catch (e) { /* registry optional */ }

    const now = Date.now();
    const windowMs = WINDOW_DAYS * 86400000;
    const rows = [];
    for (const company of Object.keys(map)) {
      const arr = map[company];
      if (!Array.isArray(arr)) continue;
      for (const j of arr) {
        if (!j || typeof j !== "object" || !j.posted) continue;   // dated jobs only
        const t = new Date(j.posted).getTime();
        if (!Number.isFinite(t) || now - t > windowMs) continue;   // within the window
        rows.push({
          company: j.company || company,
          title: j.title || "",
          url: j.applyUrl || j.url || "",
          location: j.locationLabel || j.location || "",
          postedStr: j.postedStr || "",
          posted: j.posted,
          daysAgo: (typeof j.daysAgo === "number") ? j.daysAgo : Math.floor((now - t) / 86400000),
          firstSeen: firstSeen.has(_nk(j.company || company, j.title)),
          ts: t,
        });
      }
    }
    rows.sort((a, b) => b.ts - a.ts);

    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const counts = {
      today: rows.filter(r => r.postedStr === today).length,
      week: rows.filter(r => now - r.ts <= 7 * 86400000).length,
      dated: rows.length,
    };
    const jobs = rows.slice(0, 500).map(({ ts, ...r }) => r);
    return res.status(200).json({
      generatedAt: new Date().toISOString(),
      snapshotAt: live && live.updated_at,
      windowDays: WINDOW_DAYS,
      total: rows.length,
      counts,
      jobs,
    });
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e).slice(0, 200) });
  }
}