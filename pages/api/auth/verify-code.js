// POST /api/auth/verify-code  { code }  (authed via Bearer token)
// The code-entry counterpart to /api/auth/verify-email?token=… . The user types the
// 6-digit code from their email; we match it against an unused, unexpired row for
// THIS user, then flip app_metadata.email_verified + profiles.email_verified true.
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

    const authz = req.headers.authorization || "";
    const tok = authz.startsWith("Bearer ") ? authz.slice(7) : "";
    if (!tok) return res.status(401).json({ error: "Please sign in." });
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(tok);
    if (ue || !u || !u.user) return res.status(401).json({ error: "Please sign in." });
    const uid = u.user.id;

    // Already verified → treat as success (idempotent).
    if (u.user.app_metadata && u.user.app_metadata.email_verified)
      return res.status(200).json({ ok: true, already: true });

    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const code = String(b.code || "").trim().replace(/\s+/g, "");
    if (!/^\d{6}$/.test(code)) return res.status(400).json({ error: "Enter the 6-digit code from your email." });

    // Pull this user's unused verification rows and match the code in JS. We do NOT
    // order by created_at here — that column may not exist on the table, and ordering by
    // a missing column makes PostgREST error and return nothing, which would make EVERY
    // code look wrong while the link still works. Normalizing with padStart also makes
    // the match immune to the `code` column being numeric (which would drop a leading 0).
    const { data: rows, error: qErr } = await supabaseAdmin
      .from("email_verifications")
      .select("id,code,expires_at,used_at")
      .eq("user_id", uid)
      .is("used_at", null)
      .limit(100);
    if (qErr) return res.status(500).json({ error: "Could not verify the code. Please try again." });

    const norm = (v) => String(v == null ? "" : v).trim().padStart(6, "0");
    const matches = (rows || []).filter((r) => norm(r.code) === code);
    if (matches.length === 0)
      return res.status(400).json({ error: "That code is incorrect. Double-check it, or resend a new one." });
    const row = matches.find((r) => !r.expires_at || new Date(r.expires_at).getTime() > Date.now());
    if (!row)
      return res.status(400).json({ error: "That code has expired. Resend a new one and try again." });

    // Flip the authoritative flag + the profile mirror.
    try {
      await supabaseAdmin.auth.admin.updateUserById(uid, { app_metadata: { email_verified: true } });
    } catch (e) {}
    try {
      const { data: fr } = await supabaseAdmin.from("profiles").select("data").eq("id", uid).single();
      const fd = (fr && fr.data && typeof fr.data === "object") ? fr.data : {};
      await supabaseAdmin.from("profiles").update({ email_verified: true, data: { ...fd, email_verified: true } }).eq("id", uid);
    } catch (e) {}
    try { await supabaseAdmin.from("email_verifications").update({ used_at: new Date().toISOString() }).eq("id", row.id); } catch (e) {}

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "Could not verify the code. Please try again." });
  }
}