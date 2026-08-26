import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://mainquestjobs.com";

// The link in the verification email points here. Marks the account verified and
// sends the person back to the site with a status flag the UI can react to.
export default async function handler(req, res) {
  try {
    const token = req.query.token;
    if (!token) return res.redirect(302, `${SITE}/?verify=invalid`);

    const { data: row } = await supabaseAdmin
      .from("email_verifications")
      .select("token,user_id,used_at,expires_at")
      .eq("token", token)
      .maybeSingle();

    if (!row) return res.redirect(302, `${SITE}/?verify=invalid`);
    if (row.used_at) return res.redirect(302, `${SITE}/?verify=already`);
    if (row.expires_at && new Date(row.expires_at) < new Date())
      return res.redirect(302, `${SITE}/?verify=expired`);

    // Set the authoritative flag (app_metadata) + the client mirror (profiles).
    await supabaseAdmin.auth.admin.updateUserById(row.user_id, { app_metadata: { email_verified: true } });
    await supabaseAdmin.from("profiles").update({ email_verified: true }).eq("id", row.user_id);
    await supabaseAdmin.from("email_verifications").update({ used_at: new Date().toISOString() }).eq("token", token);

    return res.redirect(302, `${SITE}/?verify=success`);
  } catch (e) {
    return res.redirect(302, `${SITE}/?verify=error`);
  }
}