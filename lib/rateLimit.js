// lib/rateLimit.js
// Serverless-safe rate limiting backed by the Supabase `rate_limits` table + the
// check_rate_limit() function (see rate_limits.sql). Fixed-window per key.
//
// IMPORTANT: this fails OPEN. If the limiter itself errors (e.g. Supabase blip),
// we allow the request rather than block a real user. Rate limiting is a guard
// rail, not a gate that should ever take the app down.

import { supabaseAdmin } from "./supabaseAdmin";

// Best-effort client IP. Vercel and Netlify both set x-forwarded-for.
export function getClientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (xff) return String(xff).split(",")[0].trim();
  return (
    req.headers["x-real-ip"] ||
    (req.socket && req.socket.remoteAddress) ||
    "unknown"
  );
}

// Returns { allowed, remaining, retryAfter }. On any internal error → allowed:true.
export async function rateLimit(key, { limit, windowSeconds }) {
  try {
    const { data, error } = await supabaseAdmin.rpc("check_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) return { allowed: true, remaining: limit, retryAfter: 0, degraded: true };
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return { allowed: true, remaining: limit, retryAfter: 0, degraded: true };
    return {
      allowed: !!row.allowed,
      remaining: typeof row.remaining === "number" ? row.remaining : 0,
      retryAfter: typeof row.retry_after === "number" ? row.retry_after : 0,
    };
  } catch (e) {
    return { allowed: true, remaining: limit, retryAfter: 0, degraded: true };
  }
}