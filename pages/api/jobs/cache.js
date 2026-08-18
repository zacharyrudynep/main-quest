import { supabaseAdmin } from "../../../lib/supabaseAdmin";

// Shared 15-minute snapshot of the whole job board, stored gzip-compressed (base64) so it
// stays well under Vercel's 4.5MB request/response limit. The client compresses before POST
// and decompresses after GET; this route just stores/returns the compressed blob. Cache
// errors never break the board — the client falls back to a normal live fetch.
const TTL_MS = 15 * 60 * 1000;

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
      const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      const gz = b.gz;
      if (typeof gz !== "string" || gz.length < 200) return res.status(400).json({ error: "bad payload" });
      if (gz.length > 4000000) return res.status(413).json({ error: `too large (${gz.length})` });
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