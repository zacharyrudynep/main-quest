// GET /api/admin/user-detail?id=<uuid>  (owner only)
// Returns the heavy, detail-only profile fields for ONE user (currently the résumé
// text), so the admin Users LIST doesn't have to ship every user's résumé.
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
    const id = req.query && req.query.id;
    if (!id) return res.status(400).json({ error: "Missing id." });
    const { data } = await supabaseAdmin.from("profiles").select("resumeText:data->resumeText").eq("id", id).single();
    return res.status(200).json({ resumeText: (data && data.resumeText) || "" });
  } catch (e) {
    return res.status(500).json({ error: "server error" });
  }
}