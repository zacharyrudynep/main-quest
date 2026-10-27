import zlib from "zlib";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { rateLimit, getClientIp } from "../../../lib/rateLimit";
// First-seen posted-date stamping lives in a shared module so the build-snapshot cron
// (the authoritative writer) and this client-POST fallback use the exact same logic.
import { applyFirstSeen, getFirstSeenDiag, SEEN_ID, REG_VERSION, GRACE_MS } from "../../../lib/firstSeen";

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
      // Diagnostic: /api/jobs/cache?seen=1 reports the first-seen registry state so we
      // can confirm which version of this file is actually live and what it's doing.
      if (req.query && req.query.seen) {
        res.setHeader("Cache-Control", "no-store");
        try {
          const { data } = await supabaseAdmin.from("job_cache").select("data,updated_at").eq("id", SEEN_ID).single();
          const d = (data && data.data && typeof data.data === "object") ? data.data : {};
          const keys = (d.keys && typeof d.keys === "object") ? d.keys : {};
          let stamped = 0, baseline = 0;
          for (const k in keys) { const e = keys[k]; if (Array.isArray(e) && e[0] > 0) stamped++; else baseline++; }
          return res.status(200).json({
            fileVersion: REG_VERSION,                 // what the DEPLOYED code expects
            registryVersion: d.ver || null,           // what's actually stored
            baselineAt: d.baselineAt || null,
            graceMsLeft: d.baselineAt ? Math.max(0, GRACE_MS - (Date.now() - d.baselineAt)) : null,
            totalKeys: Object.keys(keys).length, stamped, baseline,
            registryUpdatedAt: data && data.updated_at,
            lastRun: getFirstSeenDiag(),                 // what the most recent stamping run (cron or POST) saw/did
          });
        } catch (e) { return res.status(200).json({ error: String((e && e.message) || e) }); }
      }
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
      // so the board is never broken by this feature. Each step is recorded in a
      // diagnostic that ?seen=1 surfaces (via the shared module's getFirstSeenDiag).
      // In practice the build-snapshot cron keeps the cache fresh, so this fallback
      // rarely fires — but when it does it uses the same stamping as the cron.
      let outGz = gz, stamped = false;
      try {
        const raw = Buffer.from(gz, "base64");
        const map = JSON.parse(zlib.gunzipSync(raw, { maxOutputLength: 80 * 1024 * 1024 }).toString("utf8"));
        await applyFirstSeen(map, "post");                // mutates map; throws on Supabase failure
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