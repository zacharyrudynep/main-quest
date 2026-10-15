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

    // Match an unused, unexpired code for this user.
    const { data: row } = await supabaseAdmin
      .from("email_verifications")
      .select("id,expires_at,used_at")
      .eq("user_id", uid)
      .eq("code", code)
      .is("used_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!row) return res.status(400).json({ error: "That code is incorrect. Double-check it, or resend a new one." });
    if (row.expires_at && new Date(row.expires_at).getTime() < Date.now())
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