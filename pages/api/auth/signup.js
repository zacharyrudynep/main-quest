import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { getClientIp } from "../../../lib/clientIp";
import { logUserIp } from "../../../lib/bans";
import { sendWelcomeEmail } from "../../../lib/resend";
import crypto from "crypto";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://mainquestjobs.com";

// Verify a Cloudflare Turnstile token. Skipped if TURNSTILE_SECRET isn't set, so
// signup keeps working until you enable it. Fails OPEN on a network error to CF.
async function verifyTurnstile(token, ip) {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) return { ok: true };
  if (!token) return { ok: false };
  try {
    const form = new URLSearchParams();
    form.append("secret", secret);
    form.append("response", token);
    if (ip) form.append("remoteip", ip);
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    const data = await r.json().catch(() => ({}));
    return { ok: !!data.success };
  } catch (e) {
    return { ok: true };
  }
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const email = String(b.email || "").trim().toLowerCase();
    const password = String(b.password || "");
    const name = String(b.name || "").trim().slice(0, 120);
    const tosVersion = b.tosVersion ? String(b.tosVersion).slice(0, 40) : null;

    if (!email || !password) return res.status(400).json({ error: "Email and password are required." });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters." });

    const ip = getClientIp(req);

    // ── Bot check ──
    const ts = await verifyTurnstile(b.turnstileToken, ip);
    if (!ts.ok) return res.status(400).json({ error: "Please complete the verification challenge and try again." });

    // ── IP ban check ──
    if (ip) {
      const { data: bip } = await supabaseAdmin.from("banned_ips").select("ip").eq("ip", ip).maybeSingle();
      if (bip) return res.status(403).json({ error: "Sign-ups from your network are not permitted." });
    }

    // ── Create the user (login-confirmed so they can browse; email_verified=false
    //    in app_metadata gates the features until they click the email link). ──
    const { data: created, error: ce } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { email_verified: false },
    });
    if (ce || !created || !created.user) {
      const msg = (ce && ce.message) || "Could not create account.";
      if (/already|exists|registered|duplicate/i.test(msg)) return res.status(409).json({ error: "An account with this email already exists." });
      return res.status(400).json({ error: msg });
    }
    const uid = created.user.id;

    // ── Profile row ──
    try { await supabaseAdmin.from("profiles").insert({ id: uid, name, data: { tosVersion }, email_verified: false }); } catch (e) {}

    // ── Send the verification email (best-effort; never blocks signup) ──
    try {
      const token = crypto.randomUUID();
      await supabaseAdmin.from("email_verifications").insert({
        token, user_id: uid, email,
        expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      });
      await sendWelcomeEmail(email, name, `${SITE}/api/auth/verify-email?token=${token}`);
    } catch (e) {}

    // ── Log signup IP + bump lifetime counter (best-effort) ──
    logUserIp(uid, ip);
    try { await supabaseAdmin.rpc("bump_counter", { counter_key: "lifetime_signups" }); } catch (e) {}

    return res.status(200).json({ ok: true, userId: uid });
  } catch (e) {
    return res.status(500).json({ error: "Something went wrong creating your account." });
  }
}