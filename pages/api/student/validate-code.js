// POST /api/student/validate-code { code } -> { ok, valid, reason? }
// Quick pre-check before we ask for a school email. Does NOT grant anything.
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const code = String((req.body && req.body.code) || "").trim();
    if (!code) return res.status(200).json({ ok: true, valid: false, reason: "Enter a code." });
    const { data: row } = await supabaseAdmin
      .from("student_codes").select("*").ilike("code", code).maybeSingle();
    if (!row || row.active === false) return res.status(200).json({ ok: true, valid: false, reason: "That code isn't valid." });
    if (row.expires_at && new Date(row.expires_at) < new Date()) return res.status(200).json({ ok: true, valid: false, reason: "That code has expired." });
    if (row.max_redemptions != null && (row.redeemed_count || 0) >= row.max_redemptions) {
      return res.status(200).json({ ok: true, valid: false, reason: "That code has reached its redemption limit." });
    }
    return res.status(200).json({ ok: true, valid: true, code: row.code, days: row.days_granted || 30 });
  } catch (e) {
    return res.status(500).json({ error: "server error" });
  }
}