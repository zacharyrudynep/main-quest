// lib/consent.js
// Lightweight consent store for NON-ESSENTIAL analytics (GDPR / ePrivacy + CCPA).
// Essential app functionality (auth, core features) never depends on this file.
//
// Consent values: "accepted" | "declined" | null (undecided)
// We also store a version so you can re-prompt everyone if your tracking changes:
// just bump VERSION and all prior choices are treated as "undecided" again.

const KEY = "mq_consent";
const VERSION_KEY = "mq_consent_v";
const VERSION = "1";

export function getConsent() {
  if (typeof window === "undefined") return null;
  try {
    if (localStorage.getItem(VERSION_KEY) !== VERSION) return null; // stale or absent → undecided
    const v = localStorage.getItem(KEY);
    return v === "accepted" || v === "declined" ? v : null;
  } catch (e) {
    return null;
  }
}

export function setConsent(value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, value);
    localStorage.setItem(VERSION_KEY, VERSION);
    // let any listeners (e.g. _app) react immediately, no reload needed
    window.dispatchEvent(new CustomEvent("mq-consent-change", { detail: value }));
  } catch (e) {}
}

export function hasAnalyticsConsent() {
  return getConsent() === "accepted";
}