import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { sendVerificationEmail } from "../../../lib/resend";
import crypto from "crypto";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://mainquestjobs.com";

// Re-send the verification email for the logged-in user. Rate-limited to one per
// minute so it can't be used to spam an inbox.
export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
    const authz = req.headers.authorization || "";
    const tok = authz.startsWith("Bearer ") ? authz.slice(7) : "";
    if (!tok) return res.status(401).json({ error: "Please sign in." });
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(tok);
    if (ue || !u || !u.user) return res.status(401).json({ error: "Please sign in." });

    const uid = u.user.id;
    const email = u.user.email;
    if (u.user.app_metadata && u.user.app_metadata.email_verified)
      return res.status(200).json({ ok: true, already: true });

    // Rate limit: no more than one email per 60s.
    const { data: recent } = await supabaseAdmin
      .from("email_verifications")
      .select("created_at")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (recent && Date.now() - new Date(recent.created_at).getTime() < 60000)
      return res.status(429).json({ error: "Please wait a minute before requesting another email." });

    const { data: prof } = await supabaseAdmin.from("profiles").select("name").eq("id", uid).maybeSingle();
    const name = (prof && prof.name) || "";

    const token = crypto.randomUUID();
    await supabaseAdmin.from("email_verifications").insert({
      token, user_id: uid, email,
      expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    });
    await sendVerificationEmail(email, name, `${SITE}/api/auth/verify-email?token=${token}`);

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: (e && e.message) ? ("Email error: " + e.message) : "Could not send the email. Please try again." });
  }
}