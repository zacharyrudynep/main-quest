// GET /api/cron/build-snapshot — builds the whole job board server-side and writes
// the gzip snapshot to job_cache, so visitors load an instant cached board and never
// do the slow per-feed fetch themselves. Schedule it every ~10-12 min (under the
// cache's 15-min TTL) so the snapshot is always fresh.
import zlib from "zlib";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { buildJobMap } from "../../../lib/board";

export const config = { maxDuration: 120 };

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.authorization || "";
  const authorized = secret && (auth === `Bearer ${secret}` || req.query.key === secret);
  if (secret && !authorized) return res.status(401).json({ error: "unauthorized" });

  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://mainquestjobs.com";
  const started = Date.now();
  try {
    // Fetch one ATS feed's raw jobs through the site's own edge-cached proxy.
    const fetchRaw = async (platform, slug) => {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 28000);
      try {
        const r = await fetch(`${base}/api/jobs/ats?platform=${platform}&slug=${encodeURIComponent(slug)}`, { signal: ctrl.signal });
        if (!r.ok) return [];
        const d = await r.json();
        return d.jobs || [];
      } catch (e) { return []; }
      finally { clearTimeout(t); }
    };

    const map = await buildJobMap({ fetchRaw, concurrency: 12 });
    const companies = Object.keys(map).length;
    // Guard against a thin/broken build overwriting a good snapshot.
    if (companies < 40) {
      return res.status(200).json({ ok: false, skipped: true, note: `only ${companies} companies — not caching`, ms: Date.now() - started });
    }

    const gz = zlib.gzipSync(Buffer.from(JSON.stringify(map), "utf8")).toString("base64");
    const { error } = await supabaseAdmin
      .from("job_cache")
      .upsert({ id: "live", data: { gz }, updated_at: new Date().toISOString() }, { onConflict: "id" });
    if (error) return res.status(500).json({ ok: false, error: error.message });

    return res.status(200).json({ ok: true, companies, bytes: gz.length, ms: Date.now() - started });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
