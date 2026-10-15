// GET /api/auth/ban-status  (auth required)
// Returns { banned, reason } for the signed-in user, read from the RLS-locked
// banned_users table via the service-role client. The app calls this right after
// login and on page load; a banned user is signed out and sent to /banned.
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    const authz = req.headers.authorization || "";
    const tok = authz.startsWith("Bearer ") ? authz.slice(7) : "";
    if (!tok) return res.status(200).json({ banned: false });
    const { data: u } = await supabaseAdmin.auth.getUser(tok);
    if (!u || !u.user) return res.status(200).json({ banned: false });
    const { data } = await supabaseAdmin.from("banned_users").select("reason").eq("user_id", u.user.id).maybeSingle();
    if (data) return res.status(200).json({ banned: true, reason: data.reason || "" });
    return res.status(200).json({ banned: false });
  } catch (e) {
    // Fail OPEN — a transient DB error must not lock everyone out.
    return res.status(200).json({ banned: false });
  }
}