/** @type {import('next').NextConfig} */

const SUPABASE_URL = "https://vtbavrvokhupulokqqqb.supabase.co";
const SUPABASE_WSS = "wss://vtbavrvokhupulokqqqb.supabase.co";
const TURNSTILE = "https://challenges.cloudflare.com";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Report-only: logs violations, blocks nothing. Rename the key to
  // "Content-Security-Policy" (drop "-Report-Only") to enforce once the console
  // is clean during normal use.
  {
    key: "Content-Security-Policy-Report-Only",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${TURNSTILE}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      `connect-src 'self' ${SUPABASE_URL} ${SUPABASE_WSS} ${TURNSTILE}`,
      // Turnstile renders its challenge inside an iframe from this origin.
      `frame-src ${TURNSTILE}`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Standalone output only off-Vercel (Vercel errors on it; Coolify/Docker needs it).
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

module.exports = nextConfig;