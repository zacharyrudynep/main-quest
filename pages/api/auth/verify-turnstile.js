// POST /api/auth/verify-turnstile  { token }  ->  { ok }
// Server-side Cloudflare Turnstile check used to gate the login form.
// Fails OPEN if no secret is configured or no token is supplied, so it can never
// lock a legitimate user out — it only rejects a token that is present but invalid.
export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ ok: false }); }
  try {
    const token = (req.body && req.body.token) || "";
    const secret = process.env.TURNSTILE_SECRET_KEY || process.env.CF_TURNSTILE_SECRET || "";
    if (!secret) return res.status(200).json({ ok: true });   // not configured -> don't block
    if (!token) return res.status(200).json({ ok: true });     // widget blocked/slow -> don't lock out
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    });
    const d = await r.json().catch(() => ({}));
    return res.status(200).json({ ok: !!d.success });
  } catch (e) {
    return res.status(200).json({ ok: true }); // never block login on our own error
  }
}