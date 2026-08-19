import { supabaseAdmin } from "../../../lib/supabaseAdmin";

// Runs on a schedule (Vercel Cron). Permanently deletes accounts whose deletion was requested
// more than GRACE_DAYS ago — giving users a recovery window before anything is actually removed.
const GRACE_DAYS = 14;

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  const authz = req.headers.authorization || "";
  const key = req.query.key;
  if (secret && authz !== `Bearer ${secret}` && key !== secret) return res.status(401).json({ error: "unauthorized" });
  try {
    const cutoff = new Date(Date.now() - GRACE_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const { data: rows, error } = await supabaseAdmin.from("profiles").select("id").not("deletion_requested_at", "is", null).lt("deletion_requested_at", cutoff);
    if (error) return res.status(500).json({ error: error.message });
    const ids = (rows || []).map((r) => r.id);
    let deleted = 0;
    for (const id of ids) {
      try {
        await supabaseAdmin.from("applications").delete().eq("user_id", id);
        await supabaseAdmin.from("saved_jobs").delete().eq("user_id", id);
        await supabaseAdmin.from("profiles").delete().eq("id", id);
        await supabaseAdmin.auth.admin.deleteUser(id);
        deleted++;
      } catch (e) { /* skip individual failures, continue */ }
    }
    return res.status(200).json({ ok: true, checked: ids.length, deleted });
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e) });
  }
}