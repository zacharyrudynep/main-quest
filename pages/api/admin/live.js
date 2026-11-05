// GET /api/admin/live — owner-only. Powers the "Live & Visits" panel:
//   • live visitor count (who's on the site right now), split signed-in / guest
//   • total VISITS today & this month (counts repeat visits by the same person — a
//     "visit" = a session, i.e. a cluster of that visitor's events with <30 min gaps)
//   • a 14-day timeline of visits split by identity: signed-in / guest / bot-or-other
//   • the signed-in users with the most visits (mapped to their email)
// All derived from the existing `events` table; "bot" and per-user attribution fill in
// from the new fields that /api/track started recording.
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").toLowerCase();
const TZ = "America/New_York";
const etDay = (ms) => new Date(ms).toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD in ET
const addDays = (dayStr, n) => { const d = new Date(dayStr + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

const LIVE_MS = 3 * 60 * 1000;          // "on the site now" = an event in the last 3 min
const SESSION_GAP_MS = 30 * 60 * 1000;  // a >30 min gap starts a new visit
const WINDOW_DAYS = 35;

export default async function handler(req, res) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return res.status(401).json({ error: "no token" });
    if (!ADMIN_EMAIL) return res.status(500).json({ error: "ADMIN_EMAIL not configured" });
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(token);
    const em = ((u && u.user && u.user.email) || "").toLowerCase();
    if (ue || !em || em !== ADMIN_EMAIL) return res.status(403).json({ error: "forbidden" });

    const now = Date.now();
    const sinceIso = new Date(now - WINDOW_DAYS * 86400000).toISOString();
    const { data: evs } = await supabaseAdmin
      .from("events")
      .select("visitor,created_at,meta")
      .not("visitor", "is", null)
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: true })
      .limit(300000);

    // Group a visitor's events; track latest for "live" and the full list for sessions.
    const byVisitor = new Map();   // visitor -> { events:[{ts,authed,bot,uid}], last, lastAuthed, lastBot }
    for (const e of (evs || [])) {
      const v = e.visitor; if (!v) continue;
      const ts = new Date(e.created_at).getTime(); if (!Number.isFinite(ts)) continue;
      const m = (e.meta && typeof e.meta === "object") ? e.meta : {};
      const rec = byVisitor.get(v) || { events: [], last: 0, lastAuthed: false, lastBot: false };
      rec.events.push({ ts, authed: !!m.authed, bot: !!m.bot, uid: m.uid || null });
      if (ts >= rec.last) { rec.last = ts; rec.lastAuthed = !!m.authed; rec.lastBot = !!m.bot; }
      byVisitor.set(v, rec);
    }

    // ── Live now ──
    let liveSignedIn = 0, liveGuest = 0, liveBots = 0;
    for (const rec of byVisitor.values()) {
      if (now - rec.last > LIVE_MS) continue;
      if (rec.lastBot) liveBots++;
      else if (rec.lastAuthed) liveSignedIn++;
      else liveGuest++;
    }
    const liveNow = liveSignedIn + liveGuest;   // real people on the site now (bots excluded)

    // ── Sessions (= visits), clustered per visitor by 30-min gaps ──
    const sessions = [];   // { startTs, kind: 'signedIn'|'guest'|'bot', uid }
    for (const rec of byVisitor.values()) {
      const arr = rec.events.sort((a, b) => a.ts - b.ts);
      let cur = null;
      for (const e of arr) {
        if (!cur || e.ts - cur.lastTs > SESSION_GAP_MS) {
          if (cur) sessions.push(cur);
          cur = { startTs: e.ts, lastTs: e.ts, authed: e.authed, bot: e.bot, uid: e.uid };
        } else {
          cur.lastTs = e.ts; cur.authed = cur.authed || e.authed; cur.bot = cur.bot || e.bot; cur.uid = cur.uid || e.uid;
        }
      }
      if (cur) sessions.push(cur);
    }
    const kindOf = (s) => s.bot ? "bot" : (s.authed || s.uid) ? "signedIn" : "guest";

    const today = etDay(now);
    const month = today.slice(0, 7);
    let visitsToday = 0, visitsMonth = 0, botsToday = 0;
    for (const s of sessions) {
      const d = etDay(s.startTs);
      if (d === today) { visitsToday++; if (kindOf(s) === "bot") botsToday++; }
      if (d.slice(0, 7) === month) visitsMonth++;
    }

    // ── 14-day visit timeline split by identity ──
    const days = []; for (let i = 13; i >= 0; i--) days.push(addDays(today, -i));
    const tl = {}; for (const d of days) tl[d] = { date: d, signedIn: 0, guest: 0, bot: 0 };
    for (const s of sessions) { const d = etDay(s.startTs); if (tl[d]) tl[d][kindOf(s)]++; }
    const timeline = days.map((d) => tl[d]);

    // ── Top signed-in users by visits (last 35 days) ──
    const byUid = new Map();
    for (const s of sessions) { if (kindOf(s) === "signedIn" && s.uid) byUid.set(s.uid, (byUid.get(s.uid) || 0) + 1); }
    const topUidRows = [...byUid.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    const topUsers = [];
    for (const [uid, count] of topUidRows) {
      let label = uid.slice(0, 8);
      try { const r = await supabaseAdmin.auth.admin.getUserById(uid); const em2 = r && r.data && r.data.user && r.data.user.email; if (em2) label = em2; } catch (e) {}
      topUsers.push({ label, count });
    }

    return res.status(200).json({
      generatedAt: new Date().toISOString(),
      live: { now: liveNow, signedIn: liveSignedIn, guest: liveGuest, bots: liveBots },
      visits: { today: visitsToday, month: visitsMonth, botsToday, totalWindow: sessions.length, windowDays: WINDOW_DAYS },
      timeline,
      topUsers,
    });
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e).slice(0, 200) });
  }
}