import zlib from "zlib";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { rateLimit, getClientIp } from "../../../lib/rateLimit";

// Raise Next.js's default 1MB API body limit — the compressed snapshot can be a few MB.
// (Stays under Vercel's hard 4.5MB request cap.)
export const config = { api: { bodyParser: { sizeLimit: "4mb" } } };

// Shared 15-minute snapshot of the whole job board, stored gzip-compressed (base64) so it
// stays well under Vercel's 4.5MB request/response limit. The client compresses before POST
// and decompresses after GET; this route just stores/returns the compressed blob. Cache
// errors never break the board — the client falls back to a normal live fetch.
const TTL_MS = 15 * 60 * 1000;

// In-memory snapshot cache. On a persistent Node server this serves the (multi-MB) blob
// to every visitor from RAM and reads Supabase at most once per MEM_TTL — a major egress
// cut, since otherwise each board load re-downloaded the whole snapshot from the database.
let MEM = { gz: null, updatedAt: 0, fetchedAt: 0 };
const MEM_TTL = 60 * 1000;

// ─── First-seen posted dates ────────────────────────────────────────────────
// Policy: a job shows a "Posted" date ONLY if the company's ATS feed provides a
// real one (handled in lib/normalize.js — undated jobs arrive with posted:null).
// For jobs with NO real date, we stamp the day WE first pulled them: a job that's
// new to our board was, in practice, posted that day. We never back-date the jobs
// already on the board — the first scan after this ships is a BASELINE: every
// currently-undated job is recorded as pre-existing and stays dateless. Only keys
// that appear for the FIRST time after that baseline get the pull-date stamp.
//
// Storage: a second row in the existing job_cache table (id="job_seen"), plain
// JSON — no schema migration. Shape: { baselined:bool, keys:{ "<key>": [stampMs, lastSeenMs] } }
//   stampMs 0  → known at baseline (or had a real date) → leave undated
//   stampMs >0 → the pull-date to display for this undated job
// Only undated jobs are ever tracked; dated jobs never consult the registry.
const SEEN_ID = "job_seen";
const PRUNE_MS = 45 * 24 * 60 * 60 * 1000; // drop keys unseen this long (tolerates transient feed gaps)
// Bump to force a clean re-baseline on deploy, discarding any registry a prior/buggy
// version wrote (e.g. one that wrongly stamped existing jobs "today").
const REG_VERSION = 2;

// Stable job identity: company|title, matching the inbox/alerts key.
const _nk = (c, t) => `${String(c || "").trim().toLowerCase().replace(/\s+/g, " ")}|${String(t || "").trim().toLowerCase().replace(/\s+/g, " ")}`;
const _fmtDate = (ms) => new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// Walk the company→jobs snapshot, stamp first-seen dates on undated jobs per the
// policy above, and persist the registry. Mutates `map` in place. THROWS on any
// Supabase read/write failure so the caller keeps the client's original snapshot
// rather than showing a date we didn't actually persist (keeps the two in sync).
async function applyFirstSeen(map) {
  const { data, error } = await supabaseAdmin.from("job_cache").select("data").eq("id", SEEN_ID).single();
  if (error && error.code !== "PGRST116") throw error;   // real read failure → abort, don't risk a false re-baseline
  const prev = (data && data.data && typeof data.data === "object") ? data.data : null;
  // A registry from an older version (or none) is discarded so this version baselines
  // cleanly from scratch — wiping any bad "today" stamps a prior version may have saved.
  const verOk = !!prev && prev.ver === REG_VERSION;
  const baselined = verOk ? !!prev.baselined : false;
  const keys = (verOk && prev.keys && typeof prev.keys === "object") ? { ...prev.keys } : {};
  const now = Date.now();

  // Baseline mode records every CURRENT undated job as pre-existing (no stamp) so we
  // never back-date the board. We enter it on the first run, AND we self-heal a bad
  // baseline that locked onto an empty set: if a prior scan ran under the old
  // normalizer (every job carried a fabricated date, so nothing looked undated), it
  // would have saved baselined:true with zero keys — and then stamped every real
  // undated job "today" once the new normalizer went live. An empty key set with
  // baselined:true is exactly that signature, so re-baseline instead.
  const firstRun = !baselined || Object.keys(keys).length === 0;
  let undatedSeen = 0;

  for (const name of Object.keys(map)) {
    const arr = map[name];
    if (!Array.isArray(arr)) continue;
    for (const job of arr) {
      if (!job || typeof job !== "object") continue;
      if (job.postedStr || job.posted) continue;         // has a real date → show as-is, never track
      const key = _nk(job.company || name, job.title);
      if (!key || key === "|") continue;
      undatedSeen++;
      let ent = keys[key];
      if (!ent) {
        // first time we've recorded this undated key
        keys[key] = ent = firstRun ? [0, now] : [now, now]; // baseline → no date; otherwise → posted today
      } else {
        ent[1] = now;                                    // refresh last-seen
      }
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

  // Only LOCK the baseline once we've actually captured undated jobs (i.e. the new
  // normalizer is live and producing posted:null). A scan that saw none leaves the
  // baseline open so a later scan under the new normalizer can baseline correctly —
  // this prevents the empty-baseline latch described above.
  const nextBaselined = (baselined && Object.keys(keys).length > 0) || undatedSeen > 0;
  const { error: wErr } = await supabaseAdmin.from("job_cache")
    .upsert({ id: SEEN_ID, data: { ver: REG_VERSION, baselined: nextBaselined, keys }, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (wErr) throw wErr;                                   // persist failed → caller keeps original snapshot
}

// Validate an incoming compressed snapshot before we store it, so a bad actor can't
// poison the shared cache. Layered + safe:
//  1) must be valid base64 and start with the gzip magic bytes (1f 8b),
//  2) if it decompresses in our runtime, it must be a non-empty object (the client
//     sends a company→jobs map), and it must not be a decompression bomb.
// If decompression throws for a non-size reason (runtime/env quirk), we DON'T block the
// write — steps (1) already rejected obvious garbage, and the happy path must never break.
function looksLikeSnapshot(gz) {
  let raw;
  try { raw = Buffer.from(gz, "base64"); } catch (e) { return false; }
  if (raw.length < 100) return false;
  if (raw[0] !== 0x1f || raw[1] !== 0x8b) return false; // not gzip
  try {
    const out = zlib.gunzipSync(raw, { maxOutputLength: 80 * 1024 * 1024 }); // bomb guard
    const parsed = JSON.parse(out.toString("utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return false;
    if (Object.keys(parsed).length < 10) return false;
  } catch (e) {
    const msg = String((e && (e.code || e.message)) || "");
    if (/TOO_LARGE|maxOutputLength|output length/i.test(msg)) return false; // decompression bomb
    // otherwise: environment couldn't decompress — magic-byte + length checks passed, allow.
  }
  return true;
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      // Let browsers (and any CDN in front) cache briefly too.
      res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");
      const now = Date.now();
      if (!MEM.gz || (now - MEM.fetchedAt) > MEM_TTL) {
        try {
          const { data, error } = await supabaseAdmin.from("job_cache").select("data,updated_at").eq("id", "live").single();
          if (!error || error.code === "PGRST116") {
            MEM = {
              gz: (data && data.data && data.data.gz) || null,
              updatedAt: (data && data.updated_at) ? new Date(data.updated_at).getTime() : 0,
              fetchedAt: now,
            };
          }
        } catch (e) { /* keep whatever we had in memory */ }
      }
      if (MEM.gz && MEM.updatedAt) {
        const ageMs = Date.now() - MEM.updatedAt;
        if (ageMs < TTL_MS) return res.status(200).json({ fresh: true, gz: MEM.gz, ageMs });
        return res.status(200).json({ fresh: false, note: `stale (${Math.round(ageMs / 1000)}s)` });
      }
      return res.status(200).json({ fresh: false, note: "no snapshot yet" });
    }
    if (req.method === "POST") {
      // Writes are rare (TTL-gated), so a tight per-IP cap is safe.
      const rl = await rateLimit(`jobcache:${getClientIp(req)}`, { limit: 10, windowSeconds: 60 });
      if (!rl.allowed) return res.status(429).json({ error: "rate_limited", retryAfter: rl.retryAfter });

      const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      const gz = b.gz;
      if (typeof gz !== "string" || gz.length < 200) return res.status(400).json({ error: "bad payload" });
      if (gz.length > 4000000) return res.status(413).json({ error: `too large (${gz.length})` });
      if (!looksLikeSnapshot(gz)) return res.status(400).json({ error: "invalid snapshot" });
      const { data: cur } = await supabaseAdmin.from("job_cache").select("updated_at").eq("id", "live").single();
      if (cur && cur.updated_at && (Date.now() - new Date(cur.updated_at).getTime()) < TTL_MS) return res.status(200).json({ ok: true, skipped: true });

      // This write is the authoritative ~15-min "scan". Stamp first-seen dates on
      // undated jobs here, then store the stamped snapshot. Anything going wrong
      // (decompress, parse, registry I/O) falls back to the client's original gz
      // so the board is never broken by this feature.
      let outGz = gz, stamped = false;
      try {
        const raw = Buffer.from(gz, "base64");
        const map = JSON.parse(zlib.gunzipSync(raw, { maxOutputLength: 80 * 1024 * 1024 }).toString("utf8"));
        await applyFirstSeen(map);                        // mutates map; throws on Supabase failure
        const reGz = zlib.gzipSync(Buffer.from(JSON.stringify(map))).toString("base64");
        if (reGz.length <= 4000000) { outGz = reGz; stamped = true; } // keep original if re-gzip overflows the cap
      } catch (e) { outGz = gz; stamped = false; }

      const { error: upErr } = await supabaseAdmin.from("job_cache").upsert({ id: "live", data: { gz: outGz }, updated_at: new Date().toISOString() }, { onConflict: "id" });
      if (upErr) return res.status(500).json({ error: "save failed: " + upErr.message });
      // Reflect the new snapshot in the in-memory cache immediately.
      MEM = { gz: outGz, updatedAt: Date.now(), fetchedAt: Date.now() };
      return res.status(200).json({ ok: true, savedBytes: outGz.length, stamped });
    }
    return res.status(405).json({ error: "GET or POST only" });
  } catch (e) {
    return res.status(200).json({ fresh: false, note: "handler error: " + String((e && e.message) || e) });
  }
}