// Shared entitlement helpers for the student free-trial (A1) + academic-email check (B1).

// True while a user has premium access, whether from Stripe or an active student trial.
export function premiumActive(prof) {
  if (!prof) return false;
  if (prof.is_admin || prof.is_premium) return true;
  const until = prof.data && prof.data.premiumUntil;
  return !!(until && Number(until) > Date.now());
}

// True only for an active, trial-based grant (no Stripe sub).
export function trialActive(prof) {
  const until = prof && prof.data && prof.data.premiumUntil;
  return !!(until && Number(until) > Date.now());
}

// Accepts standard university address shapes:
//   *.edu            (US)            e.g. student@mit.edu
//   *.edu.<cc>       (intl)          e.g. student@uni.edu.au
//   *.ac.<cc>        (intl)          e.g. student@ox.ac.uk
export function isAcademicEmail(email) {
  const m = String(email || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m)) return false;
  const domain = m.split("@")[1] || "";
  return /(^|\.)edu$/.test(domain) || /\.edu\.[a-z]{2,3}$/.test(domain) || /\.ac\.[a-z]{2,3}$/.test(domain);
}

export function normEmail(email) {
  return String(email || "").trim().toLowerCase();
}