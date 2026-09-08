import { sendSupportTicket } from "../../lib/resend";
import { supabaseAdmin } from "../../lib/supabaseAdmin";

// Identify the account behind a ticket: the logged-in user (via token) or,
// failing that, any registered user whose email matches the one submitted.
async function lookupAccount({ token, email }) {
  let authUser = null, source = null;
  if (token) {
    try { const { data } = await supabaseAdmin.auth.getUser(token); if (data && data.user) { authUser = data.user; source = "logged in"; } } catch (e) {}
  }
  if (!authUser && email) {
    try {
      for (let page = 1; page <= 6 && !authUser; page++) {
        const { data } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
        const list = (data && data.users) || [];
        const found = list.find(u => String(u.email || "").toLowerCase() === String(email).toLowerCase());
        if (found) { authUser = found; source = "email match"; }
        if (list.length < 200) break;
      }
    } catch (e) {}
  }
  if (!authUser) return null;
  let profile = null;
  try { const { data } = await supabaseAdmin.from("profiles").select("*").eq("id", authUser.id).single(); profile = data || null; } catch (e) {}
  return {
    source,
    id: authUser.id,
    email: authUser.email,
    created_at: authUser.created_at,
    last_sign_in_at: authUser.last_sign_in_at,
    email_confirmed: !!(authUser.email_confirmed_at),
    profile,
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed" }); }
  const { name, email, reason, message, token } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ error: "Please fill in your name, email, and message." });
  try {
    let account = null;
    try { account = await lookupAccount({ token, email }); } catch (e) {}
    await sendSupportTicket({ name, email, reason: reason || "General Inquiry", message, account });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("support error:", e.message);
    return res.status(500).json({ error: e.message });
  }
}