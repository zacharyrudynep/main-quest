import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").toLowerCase();
const addDays = (dayStr, n) => { const d = new Date(dayStr + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const pct = (n, d) => d ? Math.round((n / d) * 1000) / 10 : 0;

// Owner-only engagement metrics, computed natively from the events table.
export default async function handler(req, res) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return res.status(401).json({ error: "no token" });
    if (!ADMIN_EMAIL) return res.status(500).json({ error: "ADMIN_EMAIL not configured" });
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(token);
    const em = ((u && u.user && u.user.email) || "").toLowerCase();
    if (ue || !em || em !== ADMIN_EMAIL) return res.status(403).json({ error: "forbidden" });

    // Pull events that carry a visitor id.
    const { data: evs } = await supabaseAdmin.from("events").select("visitor,created_at").not("visitor", "is", null).limit(200000);

    const visitorDays = {};   // visitor -> Set(day)
    const dayVisitors = {};   // day -> Set(visitor)
    const sessions = {};      // `${visitor}|${day}` -> { min, max }
    for (const e of evs || []) {
      const v = e.visitor; if (!v || !e.created_at) continue;
      const day = e.created_at.slice(0, 10);
      const ts = new Date(e.created_at).getTime();
      (visitorDays[v] = visitorDays[v] || new Set()).add(day);
      (dayVisitors[day] = dayVisitors[day] || new Set()).add(v);
      const key = v + "|" + day;
      const s = sessions[key] || (sessions[key] = { min: ts, max: ts });
      if (ts < s.min) s.min = ts; if (ts > s.max) s.max = ts;
    }

    const today = new Date().toISOString().slice(0, 10);
    const dataMaxDay = Object.keys(dayVisitors).sort().pop() || today;
    const days30 = []; for (let i = 29; i >= 0; i--) days30.push(addDays(today, -i));

    // First-seen per visitor
    const firstSeen = {};
    for (const v in visitorDays) firstSeen[v] = [...visitorDays[v]].sort()[0];

    // DAU series + new/returning split
    const dauSeries = days30.map((d) => ({ date: d, count: (dayVisitors[d] && dayVisitors[d].size) || 0 }));
    const newReturning = days30.map((d) => {
      let nw = 0, ret = 0;
      const set = dayVisitors[d];
      if (set) for (const v of set) { if (firstSeen[v] === d) nw++; else ret++; }
      return { date: d, new: nw, returning: ret };
    });

    // WAU / MAU (distinct visitors active in trailing 7 / 30 days)
    const distinctIn = (n) => {
      const from = addDays(today, -(n - 1));
      const set = new Set();
      for (const d in dayVisitors) if (d >= from && d <= today) for (const v of dayVisitors[d]) set.add(v);
      return set.size;
    };
    const wau = distinctIn(7), mau = distinctIn(30);
    const avgDau = Math.round(dauSeries.reduce((a, b) => a + b.count, 0) / 30 * 10) / 10;

    // Retention curve: of visitors first seen on day X, % active X+offset (only cohorts old enough)
    const offsets = [1, 3, 7, 14, 30];
    const retention = offsets.map((off) => {
      let eligible = 0, retained = 0;
      for (const v in visitorDays) {
        const target = addDays(firstSeen[v], off);
        if (target > dataMaxDay) continue;
        eligible++;
        if (visitorDays[v].has(target)) retained++;
      }
      return { label: `Day ${off}`, count: pct(retained, eligible) };
    });

    // Sessions (one per visitor per active day) + rough duration
    const sessKeys = Object.keys(sessions);
    const totalSessions = sessKeys.length;
    const totalVisitors = Object.keys(visitorDays).length;
    let durSum = 0, durN = 0;
    for (const k of sessKeys) { const d = (sessions[k].max - sessions[k].min) / 60000; if (d > 0) { durSum += d; durN++; } }

    res.status(200).json({
      generatedAt: new Date().toISOString(),
      dau: dauSeries.length ? dauSeries[dauSeries.length - 1].count : 0,
      avgDau, wau, mau,
      stickiness: pct(avgDau, mau),           // DAU/MAU %
      totalVisitors, totalSessions,
      sessionsPerVisitor: totalVisitors ? Math.round((totalSessions / totalVisitors) * 10) / 10 : 0,
      avgSessionMin: durN ? Math.round((durSum / durN) * 10) / 10 : 0,
      dauSeries, newReturning, retention,
    });
  } catch (e) {
    res.status(500).json({ error: "server error", detail: String((e && e.message) || e) });
  }
}