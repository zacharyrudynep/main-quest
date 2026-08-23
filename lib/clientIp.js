// lib/clientIp.js — best-effort real client IP, proxy-aware.
// Order matters: Cloudflare sets cf-connecting-ip; most hosts set x-forwarded-for.
export function getClientIp(req) {
  const h = (req && req.headers) || {};
  const cf = h["cf-connecting-ip"];
  if (cf) return String(cf).trim();
  const xr = h["x-real-ip"];
  if (xr) return String(xr).trim();
  const xff = h["x-forwarded-for"];
  if (xff) return String(xff).split(",")[0].trim();
  return (req && req.socket && req.socket.remoteAddress) || "";
}
