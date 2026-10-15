// POST /api/admin/user-action  (owner only)
// One endpoint for the admin's per-user support actions. All operate on Supabase
// (our tables + Supabase Auth) via the service-role key — no Stripe involved.
//   body: { userId, action, ...args }
// actions:
//   verifyEmail   { value?:bool=true }  force email verified / un-verify
//   setCredits    { credits:int }       set free AI credits
//   resetUsage                          zero this month's shared AI usage
//   extendTrial   { days:int }          extend (or shorten, if negative) the student trial
//   ban           { reason? }           add to banned_users
//   unban                               remove from banned_users
//   scheduleDelete                      start the 14-day deletion window
//   cancelDelete                        cancel a pending deletion
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
    if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
    if (!(await owner(req))) return res.status(403).json({ error: "forbidden" });

    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const userId = String(b.userId || "").trim();
    const action = String(b.action || "").trim();
    if (!userId || !action) return res.status(400).json({ error: "Missing userId or action." });

    const getData = async () => {
      const { data } = await supabaseAdmin.from("profiles").select("data").eq("id", userId).single();
      return (data && data.data && typeof data.data === "object") ? data.data : {};
    };

    if (action === "verifyEmail") {
      const on = b.value !== false; // default true
      try { await supabaseAdmin.auth.admin.updateUserById(userId, { ...(on ? { email_confirm: true } : {}), app_metadata: { email_verified: on } }); }
      catch (e) { return res.status(500).json({ error: "Couldn't update the auth user." }); }
      const d = await getData();
      await supabaseAdmin.from("profiles").update({ data: { ...d, email_verified: on } }).eq("id", userId);
      return res.status(200).json({ ok: true, emailVerified: on });
    }

    if (action === "setCredits") {
      const n = Math.max(0, Math.min(9999, Math.floor(Number(b.credits) || 0)));
      const d = await getData();
      const { error } = await supabaseAdmin.from("profiles").update({ data: { ...d, freeAiCredits: n } }).eq("id", userId);
      if (error) return res.status(500).json({ error: error.message || "update failed" });
      return res.status(200).json({ ok: true, freeCredits: n });
    }

    if (action === "resetUsage") {
      const month = new Date().toISOString().slice(0, 7);
      const { error } = await supabaseAdmin.from("ai_usage").upsert({ user_id: userId, month, count: 0 }, { onConflict: "user_id,month" });
      if (error) return res.status(500).json({ error: error.message || "reset failed" });
      return res.status(200).json({ ok: true });
    }

    if (action === "extendTrial") {
      const days = Math.floor(Number(b.days) || 0);
      if (!days) return res.status(400).json({ error: "Enter a number of days (negative to shorten)." });
      const d = await getData();
      const from = (d.premiumUntil && Number(d.premiumUntil) > Date.now()) ? Number(d.premiumUntil) : Date.now();
      const premiumUntil = from + days * 86400000;
      const nd = { ...d, premiumUntil, studentTrialRedeemed: true, studentCode: d.studentCode || "ADMIN_GRANT", studentVerifiedAt: d.studentVerifiedAt || Date.now() };
      const { error } = await supabaseAdmin.from("profiles").update({ is_premium: true, data: nd }).eq("id", userId);
      if (error) return res.status(500).json({ error: error.message || "update failed" });
      return res.status(200).json({ ok: true, premiumUntil });
    }

    if (action === "ban") {
      const { error } = await supabaseAdmin.from("banned_users").upsert({ user_id: userId, reason: String(b.reason || "").slice(0, 300) }, { onConflict: "user_id" });
      if (error) return res.status(500).json({ error: error.message || "ban failed" });
      return res.status(200).json({ ok: true, banned: true });
    }
    if (action === "unban") {
      const { error } = await supabaseAdmin.from("banned_users").delete().eq("user_id", userId);
      if (error) return res.status(500).json({ error: error.message || "unban failed" });
      return res.status(200).json({ ok: true, banned: false });
    }

    if (action === "scheduleDelete") {
      const { error } = await supabaseAdmin.from("profiles").update({ deletion_requested_at: new Date().toISOString() }).eq("id", userId);
      if (error) return res.status(500).json({ error: error.message || "update failed" });
      return res.status(200).json({ ok: true, scheduled: true });
    }
    if (action === "cancelDelete") {
      const { error } = await supabaseAdmin.from("profiles").update({ deletion_requested_at: null }).eq("id", userId);
      if (error) return res.status(500).json({ error: error.message || "update failed" });
      return res.status(200).json({ ok: true, cancelled: true });
    }

    return res.status(400).json({ error: "Unknown action." });
  } catch (e) {
    return res.status(500).json({ error: "server error" });
  }
}