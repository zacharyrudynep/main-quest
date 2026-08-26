import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { getClientIp } from "../../../lib/clientIp";
import { logUserIp } from "../../../lib/bans";

// Verify a Cloudflare Turnstile token. If TURNSTILE_SECRET isn't configured yet,
// this is skipped (returns ok) so signup keeps working until you enable it.
// On a network error reaching Cloudflare we fail OPEN, so a CF outage can't lock
// real users out of signing up; an actually-invalid/missing token fails closed.
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
    return { ok: true }; // fail open on network error
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

    // ── Bot check (Cloudflare Turnstile) ──
    const ts = await verifyTurnstile(b.turnstileToken, ip);
    if (!ts.ok) return res.status(400).json({ error: "Please complete the verification challenge and try again." });

    // ── IP ban check ──
    if (ip) {
      const { data: bip } = await supabaseAdmin.from("banned_ips").select("ip").eq("ip", ip).maybeSingle();
      if (bip) return res.status(403).json({ error: "Sign-ups from your network are not permitted." });
    }

    // ── Create the confirmed user ──
    const { data: created, error: ce } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (ce || !created || !created.user) {
      const msg = (ce && ce.message) || "Could not create account.";
      if (/already|exists|registered|duplicate/i.test(msg)) return res.status(409).json({ error: "An account with this email already exists." });
      return res.status(400).json({ error: msg });
    }
    const uid = created.user.id;

    // ── Profile row (service role bypasses RLS) ──
    try { await supabaseAdmin.from("profiles").insert({ id: uid, name, data: { tosVersion } }); } catch (e) {}

    // ── Log signup IP (best-effort) ──
    logUserIp(uid, ip);

    // ── Bump the lifetime signup counter (best-effort) ──
    try { await supabaseAdmin.rpc("bump_counter", { counter_key: "lifetime_signups" }); } catch (e) {}

    return res.status(200).json({ ok: true, userId: uid });
  } catch (e) {
    return res.status(500).json({ error: "Something went wrong creating your account." });
  }
}