// lib/firstSeen.js — shared first-seen posted-date stamping for the job board.
//
// Policy: a job shows a "Posted" date ONLY if the company's ATS feed provides a real
// one (lib/normalize.js leaves undated jobs with posted:null / postedStr:""). For jobs
// with NO real date we stamp the day WE first pulled them — a job that's new to our
// board was, in practice, posted that day. We never back-date the existing board.
//
// BASELINE BY GRACE WINDOW: baselineAt is anchored the first time this version runs.
// Any undated job first seen within GRACE_MS of that anchor is recorded as pre-existing
// (no date). Only undated jobs that FIRST appear AFTER the window are genuinely new and
// get the pull-date. This absorbs feed hiccups and deploy timing — the whole current
// board is captured over the window, so nothing already listed is stamped "today".
//
// This runs from the authoritative snapshot writer, the build-snapshot cron (and from
// the client POST fallback in /api/jobs/cache). Registry lives in a second job_cache
// row (id="job_seen"), plain JSON — no schema migration.
import { supabaseAdmin } from "./supabaseAdmin";

export const SEEN_ID = "job_seen";
export const REG_VERSION = 3;              // bump to force a clean re-baseline on deploy
export const GRACE_MS = 24 * 60 * 60 * 1000;
const PRUNE_MS = 45 * 24 * 60 * 60 * 1000; // drop keys unseen this long (tolerates transient feed gaps)

const _nk = (c, t) => `${String(c || "").trim().toLowerCase().replace(/\s+/g, " ")}|${String(t || "").trim().toLowerCase().replace(/\s+/g, " ")}`;
const _fmtDate = (ms) => new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// Diagnostics from the most recent stamping run (surfaced via /api/jobs/cache?seen=1),
// so we can see what the snapshot builder produced and whether stamping succeeded.
let LAST_DIAG = null;
export function getFirstSeenDiag() { return LAST_DIAG; }

// Walk the company→jobs snapshot and stamp first-seen dates on undated jobs. Mutates
// `map` in place and persists the registry. THROWS on Supabase read/write failure so
// the caller can fall back to the unstamped snapshot. `src` labels the caller in diag.
export async function applyFirstSeen(map, src = "?") {
  const diag = { ts: new Date().toISOString(), src, phase: "read" };
  try {
    const { data, error } = await supabaseAdmin.from("job_cache").select("data").eq("id", SEEN_ID).single();
    if (error && error.code !== "PGRST116") throw error;   // real read failure → abort
    const prev = (data && data.data && typeof data.data === "object") ? data.data : null;
    const verOk = !!prev && prev.ver === REG_VERSION;       // discard an older/other registry → clean baseline
    const keys = (verOk && prev.keys && typeof prev.keys === "object") ? { ...prev.keys } : {};
    const now = Date.now();
    const baselineAt = (verOk && typeof prev.baselineAt === "number") ? prev.baselineAt : now;
    const inGrace = (now - baselineAt) < GRACE_MS;
    const today = _fmtDate(now);

    let companies = 0, jobsIn = 0, undatedIn = 0, todayIn = 0;
    diag.phase = "walk";
    for (const name of Object.keys(map)) {
      const arr = map[name];
      if (!Array.isArray(arr)) continue;
      companies++;
      for (const job of arr) {
        if (!job || typeof job !== "object") continue;
        jobsIn++;
        if (job.postedStr === today) todayIn++;
        if (job.postedStr || job.posted) continue;         // has a real date → show as-is, never track
        undatedIn++;
        const key = _nk(job.company || name, job.title);
        if (!key || key === "|") continue;
        let ent = keys[key];
        if (!ent) keys[key] = ent = [inGrace ? 0 : now, now]; // pre-existing within window → no date; else new → today
        else ent[1] = now;                                   // refresh last-seen
        const stamp = ent[0];
        if (stamp > 0) {
          job.posted = new Date(stamp).toISOString();
          job.postedStr = _fmtDate(stamp);
          const d = Math.floor((now - stamp) / 86400000);
          job.daysAgo = d;
          job.isNew = d < 3;
        }
        // stamp === 0 → leave undated (no "Posted" badge).
      }
    }

    // Prune keys not seen recently so the registry stays bounded.
    for (const k of Object.keys(keys)) {
      const e = keys[k];
      if (!Array.isArray(e) || e[1] < now - PRUNE_MS) delete keys[k];
    }

    diag.phase = "write";
    const { error: wErr } = await supabaseAdmin.from("job_cache")
      .upsert({ id: SEEN_ID, data: { ver: REG_VERSION, baselineAt, keys }, updated_at: new Date().toISOString() }, { onConflict: "id" });
    if (wErr) throw wErr;

    let stamped = 0, baseline = 0;
    for (const k in keys) { const e = keys[k]; if (Array.isArray(e) && e[0] > 0) stamped++; else baseline++; }
    Object.assign(diag, { ok: true, phase: "done", companies, jobsIn, undatedIn, todayIn, inGrace, baselineAt, totalKeys: Object.keys(keys).length, stamped, baseline });
    LAST_DIAG = diag;
  } catch (e) {
    diag.ok = false;
    diag.error = String((e && (e.stack || e.message)) || e).slice(0, 600);
    LAST_DIAG = diag;
    throw e;
  }
}