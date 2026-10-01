import { supabaseAdmin } from "../../lib/supabaseAdmin";
import crypto from "crypto";

// Records a single behavioral event to the `events` table. Public endpoint — kept
// minimal and defensive; it never throws back to the client (analytics must not break UX).
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const type = b.type ? String(b.type).slice(0, 60) : "";
    if (!type) return res.status(400).json({ error: "type required" });
    // Cloudflare gives us the country for free; hash the IP so guests can be de-duped
    // (e.g. for distinct apply counts) without storing a readable address.
    const country = String(req.headers["cf-ipcountry"] || "").toUpperCase();
    const ipRaw = (req.headers["cf-connecting-ip"] || String(req.headers["x-forwarded-for"] || "").split(",")[0] || "").trim();
    const iph = ipRaw ? crypto.createHash("sha256").update(ipRaw + "|" + (process.env.CRON_SECRET || "mq")).digest("hex").slice(0, 16) : null;
    await supabaseAdmin.from("events").insert({
      type,
      job_key: b.jobKey ? String(b.jobKey).slice(0, 300) : null,
      company: b.company ? String(b.company).slice(0, 160) : null,
      visitor: b.visitor ? String(b.visitor).slice(0, 64) : null,
      meta: { ...(b.meta && typeof b.meta === "object" ? b.meta : {}), authed: !!b.authed, ...(country && country !== "XX" && country !== "T1" ? { country } : {}), ...(iph ? { iph } : {}) },
    });
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(200).json({ ok: false });
  }
}