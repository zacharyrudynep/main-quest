// GET /api/health — public, no secret. UptimeRobot (or you) can watch this.
// `ok` reflects the ONE thing users feel: is the job snapshot fresh? A stale
// snapshot means the board fell back to the slow path (or is broken), so that's
// the alert signal. Cron heartbeats are reported as detail + warnings so you can
// see delivery crons slipping without spamming the primary alert.
import { supabaseAdmin } from "../../lib/supabaseAdmin";

const SNAPSHOT_MAX_SEC = 20 * 60; // build-snapshot runs every ~10 min
// Expected max age before a cron is "late" (informational warnings only).
const CRON_MAX_SEC = {
  "build-snapshot": 20 * 60,
  "scan-instant-alerts": 30 * 60,
  "scan-alerts": 26 * 3600,
  "weekly-digest": 8 * 24 * 3600,
};

function ageSec(ts) { return ts ? Math.round((Date.now() - new Date(ts).getTime()) / 1000) : null; }

export default async function handler(req, res) {
  try {
    const { data: cache } = await supabaseAdmin.from("job_cache").select("updated_at").eq("id", "live").single();
    const snapshotAgeSec = ageSec(cache && cache.updated_at);

    const { data: hbs } = await supabaseAdmin.from("cron_heartbeats").select("id,last_run,ok,note");
    const crons = {};
    (hbs || []).forEach(h => { crons[h.id] = { ageSec: ageSec(h.last_run), ok: h.ok, note: h.note || "" }; });

    const warnings = [];
    for (const [id, max] of Object.entries(CRON_MAX_SEC)) {
      const c = crons[id];
      if (!c || c.ageSec == null) warnings.push(`${id}: no heartbeat yet`);
      else if (c.ok === false) warnings.push(`${id}: last run errored`);
      else if (c.ageSec > max) warnings.push(`${id}: stale (${Math.round(c.ageSec / 60)}m)`);
    }

    const ok = snapshotAgeSec != null && snapshotAgeSec < SNAPSHOT_MAX_SEC;
    return res.status(200).json({ ok, snapshotAgeSec, warnings, crons, ts: new Date().toISOString() });
  } catch (e) {
    return res.status(200).json({ ok: false, error: e.message });
  }
}