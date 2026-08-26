import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { getClientIp } from "../../../lib/clientIp";
import { logUserIp } from "../../../lib/bans";

// Server-side signup so account creation can be gated by the IP ban list.
// Creates a confirmed user (matching the app's no-email-confirmation flow),
// inserts the profile row, logs the signup IP, and bumps the lifetime counter.
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

    // ── IP ban check ──
    const ip = getClientIp(req);
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

    // ── Profile row (service role bypasses RLS). email_verified starts false. ──
    try { await supabaseAdmin.from("profiles").insert({ id: uid, name, data: { tosVersion } }); } catch (e) { /* profile may already exist via trigger */ }

    // ── Log signup IP (best-effort) ──
    logUserIp(uid, ip);

    // ── Bump the lifetime signup counter (best-effort; never blocks signup) ──
    try { await supabaseAdmin.rpc("bump_counter", { counter_key: "lifetime_signups" }); } catch (e) {}

    return res.status(200).json({ ok: true, userId: uid });
  } catch (e) {
    return res.status(500).json({ error: "Something went wrong creating your account." });
  }
}