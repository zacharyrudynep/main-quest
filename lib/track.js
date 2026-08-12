// Fire-and-forget event tracking. Sends each event to BOTH:
//   1) your own Supabase-backed dashboard (via /api/track), and
//   2) PostHog (if it's loaded), for funnels/retention.
// Analytics must never break the UX, so every call is wrapped and non-blocking.
export function track(type, data = {}) {
  if (typeof window === "undefined" || !type) return;
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({ type, ...data }),
    }).catch(() => {});
  } catch (e) {}
  try {
    if (window.posthog && window.posthog.capture) window.posthog.capture(type, data);
  } catch (e) {}
}