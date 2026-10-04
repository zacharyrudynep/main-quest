// GET/POST /api/admin/student-code  (owner only)
// GET  -> { codes: [...] } every student code with its redemption count.
// POST { code, active, expiresAt, daysGranted, maxRedemptions } -> upsert one code.
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").toLowerCase();

async function owner(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || !ADMIN_EMAIL) return false;
  const { data: u } = await supabaseAdmin.auth.getUser(token);
  return !!(u && u.user && (u.user.email || "").toLowerCase() === ADMIN_EMAIL);
}

export default async function handler(req, res) {
  try {
    if (!(await owner(req))) return res.status(403).json({ error: "forbidden" });

    if (req.method === "GET") {
      const { data } = await supabaseAdmin.from("student_codes").select("*").order("created_at", { ascending: false });
      return res.status(200).json({ codes: data || [] });
    }

    if (req.method === "POST") {
      const b = req.body || {};
      const code = String(b.code || "").trim();
      if (!code) return res.status(400).json({ error: "code required" });
      const row = {
        code,
        active: b.active !== false,
        expires_at: b.expiresAt ? new Date(b.expiresAt).toISOString() : null,
        days_granted: Number(b.daysGranted) > 0 ? Number(b.daysGranted) : 30,
        max_redemptions: b.maxRedemptions === "" || b.maxRedemptions == null ? null : Number(b.maxRedemptions),
      };
      // Preserve redeemed_count on update.
      const { data: existing } = await supabaseAdmin.from("student_codes").select("redeemed_count").eq("code", code).maybeSingle();
      if (existing) row.redeemed_count = existing.redeemed_count || 0;
      const { error } = await supabaseAdmin.from("student_codes").upsert(row, { onConflict: "code" });
      if (error) return res.status(500).json({ error: error.message || "save failed" });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "GET or POST only" });
  } catch (e) {
    return res.status(500).json({ error: "server error" });
  }
}