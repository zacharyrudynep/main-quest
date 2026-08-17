import { supabaseAdmin } from "../../../lib/supabaseAdmin";

// Shared 15-minute snapshot of the whole job board. The first visitor after it goes
// stale does the full fetch and POSTs the result here; everyone else GETs this snapshot
// and skips the load screen. Cache errors never break the board — the client falls back
// to a normal live fetch. Errors are surfaced in the response body for diagnosis.
const TTL_MS = 15 * 60 * 1000;

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { data, error } = await supabaseAdmin.from("job_cache").select("data,updated_at").eq("id", "live").single();
      if (error && error.code !== "PGRST116") return res.status(200).json({ fresh: false, note: error.message }); // e.g. table missing
      if (data && data.updated_at) {
        const ageMs = Date.now() - new Date(data.updated_at).getTime();
        if (ageMs < TTL_MS && data.data) return res.status(200).json({ fresh: true, jobs: data.data, ageMs });
        return res.status(200).json({ fresh: false, note: `stale (${Math.round(ageMs / 1000)}s old)` });
      }
      return res.status(200).json({ fresh: false, note: "no snapshot yet" });
    }
    if (req.method === "POST") {
      const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      const jobs = b.jobs;
      if (!jobs || typeof jobs !== "object" || Array.isArray(jobs)) return res.status(400).json({ error: "bad payload" });
      const keyCount = Object.keys(jobs).length;
      if (keyCount < 40) return res.status(400).json({ error: `too few companies (${keyCount})` });
      const str = JSON.stringify(jobs);
      if (str.length > 6000000) return res.status(413).json({ error: `too large (${str.length} bytes)` });
      // Only overwrite when the current snapshot is actually stale (avoids herd re-writes).
      const { data: cur } = await supabaseAdmin.from("job_cache").select("updated_at").eq("id", "live").single();
      if (cur && cur.updated_at && (Date.now() - new Date(cur.updated_at).getTime()) < TTL_MS) return res.status(200).json({ ok: true, skipped: true });
      const { error: upErr } = await supabaseAdmin.from("job_cache").upsert({ id: "live", data: jobs, updated_at: new Date().toISOString() }, { onConflict: "id" });
      if (upErr) return res.status(500).json({ error: "save failed: " + upErr.message }); // e.g. table missing / bad column
      return res.status(200).json({ ok: true, savedBytes: str.length });
    }
    return res.status(405).json({ error: "GET or POST only" });
  } catch (e) {
    return res.status(200).json({ fresh: false, note: "handler error: " + String((e && e.message) || e) });
  }
}