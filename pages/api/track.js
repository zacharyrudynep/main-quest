import { supabaseAdmin } from "../../lib/supabaseAdmin";
import { rateLimit, getClientIp } from "../../lib/rateLimit";

// Records a single behavioral event to the `events` table. Public endpoint — kept
// minimal and defensive; it never throws back to the client (analytics must not break UX).
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  // Per-IP throttle. 100 events/min is generous for real browsing; bots get capped.
  // (The client fires this fire-and-forget and ignores the response, so a 429 is invisible.)
  const rl = await rateLimit(`track:${getClientIp(req)}`, { limit: 100, windowSeconds: 60 });
  if (!rl.allowed) return res.status(429).json({ ok: false, error: "rate_limited" });

  try {
    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const type = b.type ? String(b.type).slice(0, 60) : "";
    if (!type) return res.status(400).json({ error: "type required" });
    await supabaseAdmin.from("events").insert({
      type,
      job_key: b.jobKey ? String(b.jobKey).slice(0, 300) : null,
      company: b.company ? String(b.company).slice(0, 160) : null,
      visitor: b.visitor ? String(b.visitor).slice(0, 64) : null,
      meta: b.meta && typeof b.meta === "object" ? b.meta : null,
    });
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(200).json({ ok: false });
  }
}