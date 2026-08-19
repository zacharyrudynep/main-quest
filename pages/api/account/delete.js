import { supabaseAdmin } from "../../../lib/supabaseAdmin";

// Soft-delete: marks the account for deletion (14-day grace period) or cancels a pending
// deletion. The actual data removal happens later via the purge cron, so the user can recover
// by logging back in and cancelling before the window closes.
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const authz = req.headers.authorization || "";
    const token = authz.startsWith("Bearer ") ? authz.slice(7) : "";
    if (!token) return res.status(401).json({ error: "Please sign in." });
    const { data: u, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !u || !u.user) return res.status(401).json({ error: "Please sign in." });

    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});

    if (b.cancel) {
      const { error: ce } = await supabaseAdmin.from("profiles").update({ deletion_requested_at: null }).eq("id", u.user.id);
      if (ce) return res.status(500).json({ error: ce.message });
      return res.status(200).json({ ok: true, cancelled: true });
    }

    // Confirmation phrase must match exactly (server-side check too).
    if (b.confirm !== "GODSPEED") return res.status(400).json({ error: "Confirmation phrase incorrect." });
    const { error: ue } = await supabaseAdmin.from("profiles").update({ deletion_requested_at: new Date().toISOString() }).eq("id", u.user.id);
    if (ue) return res.status(500).json({ error: ue.message });
    return res.status(200).json({ ok: true, scheduled: true });
  } catch (e) {
    return res.status(500).json({ error: "Something went wrong." });
  }
}