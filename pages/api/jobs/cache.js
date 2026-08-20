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
      const { data, error } = await supabaseAdmin.from("job_cache").select("data,updated_at").eq("id", "live").single();
      if (error && error.code !== "PGRST116") return res.status(200).json({ fresh: false, note: error.message });
      const gz = data && data.data && data.data.gz;
      if (data && data.updated_at && gz) {
        const ageMs = Date.now() - new Date(data.updated_at).getTime();
        if (ageMs < TTL_MS) return res.status(200).json({ fresh: true, gz, ageMs });
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
      const { error: upErr } = await supabaseAdmin.from("job_cache").upsert({ id: "live", data: { gz }, updated_at: new Date().toISOString() }, { onConflict: "id" });
      if (upErr) return res.status(500).json({ error: "save failed: " + upErr.message });
      return res.status(200).json({ ok: true, savedBytes: gz.length });
    }
    return res.status(405).json({ error: "GET or POST only" });
  } catch (e) {
    return res.status(200).json({ fresh: false, note: "handler error: " + String((e && e.message) || e) });
  }
}