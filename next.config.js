/** @type {import('next').NextConfig} */

// Your Supabase project origin (used so the browser is allowed to talk to it).
const SUPABASE_URL = "https://vtbavrvokhupulokqqqb.supabase.co";
const SUPABASE_WSS = "wss://vtbavrvokhupulokqqqb.supabase.co";

// Security headers applied to every route. These are the standard hardening
// headers modern sites are expected to send; they also help your site look
// trustworthy to scanners and browsers.
const securityHeaders = [
  // Force HTTPS for two years.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Stop the browser from guessing a different content-type than you sent.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Disallow embedding your site in an <iframe> (clickjacking protection).
  { key: "X-Frame-Options", value: "DENY" },
  // Only send the origin (not the full URL) as the referrer to other sites.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Turn off powerful browser features this app doesn't use.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Content-Security-Policy in REPORT-ONLY mode: it logs violations to the browser
  // console but blocks nothing, so it is safe to ship. Once the console is clean
  // while using the site normally, rename this header key to
  // "Content-Security-Policy" (drop "-Report-Only") to actually enforce it.
  {
    key: "Content-Security-Policy-Report-Only",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      `connect-src 'self' ${SUPABASE_URL} ${SUPABASE_WSS}`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // remove the "X-Powered-By: Next.js" fingerprint
  // Produce a self-contained build (.next/standalone) so the Docker image is
  // small and starts fast. Ignored by Vercel, so it's safe to keep on either host.
  output: "standalone",
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

module.exports = nextConfig;
