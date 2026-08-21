/** @type {import('next').NextConfig} */

// Your Supabase project origin (used so the browser is allowed to talk to it).
const SUPABASE_URL = "https://vtbavrvokhupulokqqqb.supabase.co";
const SUPABASE_WSS = "wss://vtbavrvokhupulokqqqb.supabase.co";

// Security headers applied to every route. These are the standard hardening
// headers modern sites are expected to send; they also help your site look
// trustworthy to scanners and browsers.
const securityHeaders = [
  // Force HTTPS for two years (Vercel already serves HTTPS, so this is safe).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Stop the browser from guessing a different content-type than you sent.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Disallow embedding your site in an <iframe> (clickjacking protection).
  { key: "X-Frame-Options", value: "DENY" },
  // Only send the origin (not the full URL) as the referrer to other sites.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Turn off powerful browser features this app doesn't use.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Content-Security-Policy — now ENFORCING (blocks anything not allowed below).
  // Allowed sources reflect everything this app actually loads:
  //   - 'self'                     : your own origin (incl. Vercel Analytics, which is same-origin)
  //   - fonts.googleapis/gstatic   : Cinzel / Cinzel Decorative web fonts
  //   - *.i.posthog.com            : PostHog script (us-assets.*) + event ingestion (us.*)
  //   - Supabase URL/WSS           : database + realtime
  // Stripe is redirect-based (no client-side Stripe.js), so it needs no CSP entry.
  //
  // TO REVERT INSTANTLY: rename the key below back to
  //   "Content-Security-Policy-Report-Only"
  // and the browser will log violations without blocking anything.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.i.posthog.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      `connect-src 'self' ${SUPABASE_URL} ${SUPABASE_WSS} https://*.i.posthog.com`,
      "worker-src 'self' blob:",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // remove the "X-Powered-By: Next.js" fingerprint
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
