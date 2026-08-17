import { supabaseAdmin } from "../../../lib/supabaseAdmin";

// Shared 15-minute snapshot of the whole job board. The first visitor after it goes
// stale does the full fetch and POSTs the result here; everyone else GETs this snapshot
// and skips the load screen entirely. Cache errors never break the board — we just fall
// back to a normal live fetch.
const TTL_MS = 15 * 60 * 1000;

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { data } = await supabaseAdmin.from("job_cache").select("data,updated_at").eq("id", "live").single();
      if (data && data.updated_at) {
        const ageMs = Date.now() - new Date(data.updated_at).getTime();
        if (ageMs < TTL_MS && data.data) return res.status(200).json({ fresh: true, jobs: data.data, ageMs });
      }
      return res.status(200).json({ fresh: false });
    }
    if (req.method === "POST") {
      const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      const jobs = b.jobs;
      if (!jobs || typeof jobs !== "object" || Array.isArray(jobs)) return res.status(400).json({ error: "bad payload" });
      // Reject partial/garbage snapshots so a single bad client can't poison the cache.
      if (Object.keys(jobs).length < 40) return res.status(400).json({ error: "too few companies" });
      const str = JSON.stringify(jobs);
      if (str.length > 6000000) return res.status(413).json({ error: "too large" });
      // Only overwrite if the existing snapshot is actually stale (avoids herd re-writes).
      const { data: cur } = await supabaseAdmin.from("job_cache").select("updated_at").eq("id", "live").single();
      if (cur && cur.updated_at && (Date.now() - new Date(cur.updated_at).getTime()) < TTL_MS) return res.status(200).json({ ok: true, skipped: true });
      await supabaseAdmin.from("job_cache").upsert({ id: "live", data: jobs, updated_at: new Date().toISOString() }, { onConflict: "id" });
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: "GET or POST only" });
  } catch (e) {
    return res.status(200).json({ fresh: false }); // never break the board
  }
}