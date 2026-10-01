// GET /api/jobs/apply-counts -> { counts: { "company|title|location": N } }
// N = DISTINCT people who clicked Apply on that posting: signed-in users by user id,
// guests by hashed IP, so each person counts once (no inflation from repeat clicks).
// Cached 5 min in memory.
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

let _cache = { data: null, at: 0 };
const TTL_MS = 5 * 60 * 1000;

export default async function handler(req, res) {
  try {
    if (_cache.data && Date.now() - _cache.at < TTL_MS) {
      return res.status(200).json({ counts: _cache.data, cached: true });
    }
    const perJob = {}; // jobKey -> Set(identity)
    const { data: evs } = await supabaseAdmin
      .from("events").select("job_key,meta").eq("type", "job_apply_click").limit(200000);
    for (const e of evs || []) {
      const jk = e.job_key;
      if (!jk) continue;
      const id = (e.meta && (e.meta.uid || e.meta.iph)) || null;
      if (!id) continue; // can't attribute to a person -> don't count (avoids inflation)
      (perJob[jk] = perJob[jk] || new Set()).add(id);
    }
    const counts = {};
    for (const jk in perJob) counts[jk] = perJob[jk].size;
    _cache = { data: counts, at: Date.now() };
    res.setHeader("Cache-Control", "public, s-maxage=300");
    res.status(200).json({ counts });
  } catch (e) {
    res.status(200).json({ counts: {} });
  }
}