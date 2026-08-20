// lib/track.js
// Fire-and-forget event tracking. Sends each event to BOTH:
//   1) your own Supabase-backed dashboard (via /api/track), and
//   2) PostHog (if it's loaded), for funnels/retention.
// Every event carries a stable per-browser visitor id so the dashboard can compute
// DAU/MAU, retention and sessions natively. Analytics must never break the UX.
//
// CONSENT: all of this is non-essential and is gated behind hasAnalyticsConsent().
// If the user hasn't accepted, nothing is sent and no visitor id / storage is written.

import { hasAnalyticsConsent } from "./consent";

function getVid() {
  try {
    let v = localStorage.getItem("mq_vid");
    if (!v) {
      v = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).slice(2));
      localStorage.setItem("mq_vid", v);
    }
    return v;
  } catch (e) { return null; }
}

export function track(type, data = {}) {
  if (typeof window === "undefined" || !type) return;
  if (!hasAnalyticsConsent()) return; // no non-essential tracking without consent
  const visitor = getVid();
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ type, visitor, ...data }),
    }).catch(() => {});
  } catch (e) {}
  try {
    if (window.posthog && window.posthog.capture) window.posthog.capture(type, data);
  } catch (e) {}
}

// One lightweight "visit" event per browser per day — so passive visitors still
// count toward active-user and retention metrics.
export function trackVisitOncePerDay() {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return; // don't write mq_lastvisit without consent
  try {
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem("mq_lastvisit") === today) return;
    localStorage.setItem("mq_lastvisit", today);
    track("visit", {});
  } catch (e) {}
}