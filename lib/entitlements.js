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

// ── AI access (shared by all AI endpoints) ──
// Premium via Stripe (is_premium / plan) OR an active student trial (premiumUntil),
// OR a one-off free credit (e.g. the onboarding reward). Fixes the old split where
// some endpoints checked is_premium and others checked plan==="premium".
export async function aiAccess(supabaseAdmin, userId) {
  const { data: prof } = await supabaseAdmin.from("profiles").select("is_premium,is_admin,plan,data").eq("id", userId).single();
  const isAdmin = !!(prof && prof.is_admin);
  const d = (prof && prof.data && typeof prof.data === "object") ? prof.data : {};
  const isPremium = !!(prof && (prof.is_premium || prof.plan === "premium" || (d.premiumUntil && Number(d.premiumUntil) > Date.now())));
  const freeCredits = Number(d.freeAiCredits) || 0;
  return { prof, data: d, isAdmin, isPremium, freeCredits, ok: isAdmin || isPremium || freeCredits > 0 };
}
export async function consumeFreeCredit(supabaseAdmin, userId) {
  // Re-read fresh so we only touch freeAiCredits and never clobber concurrent data writes.
  const { data: cur } = await supabaseAdmin.from("profiles").select("data").eq("id", userId).single();
  const d = (cur && cur.data && typeof cur.data === "object") ? cur.data : {};
  const next = Math.max(0, (Number(d.freeAiCredits) || 0) - 1);
  await supabaseAdmin.from("profiles").update({ data: { ...d, freeAiCredits: next } }).eq("id", userId);
  return next;
}

// ── Onboarding completion (shared by the checklist UI + the reward endpoint) ──
function alertHasCriteria(ja) {
  if (!ja) return false;
  const arr = Array.isArray(ja) ? ja : [ja];
  return arr.some(a => a && [a.roles, a.seniority, a.locations, a.companies].some(x => Array.isArray(x) ? x.length : (x && String(x).trim())));
}
// p: a flat profile-like object (role, experience, skills, workBlocks, resumeText,
// links, email_verified, jobAlerts, notifyCompanies). isPlus: Plus tier or above.
export function onboardingComplete(p, isPlus) {
  p = p || {};
  const sub = [
    { key: "role",   done: !!String(p.role || "").trim() },
    { key: "exp",    done: !!String(p.experience || p.yearsExp || "").trim() },
    { key: "skills", done: !!String(p.skills || "").trim() },
    { key: "work",   done: ((p.workBlocks || []).some(b => b && (b.company || b.role || b.description || b.project))) || !!String(p.workHistory || "").trim() },
    { key: "resume", done: !!String(p.resumeText || "").trim() },
    { key: "links",  done: !!(p.linkedin || p.portfolio || p.github || p.artstation || p.behance) },
  ];
  const profileDone = sub.every(s => s.done);
  const verifyDone = !!p.email_verified;
  const alertDone = isPlus ? alertHasCriteria(p.jobAlerts) : (p.notifyCompanies || []).length > 0;
  const flags = [verifyDone, ...sub.map(s => s.done), alertDone];
  const completeN = flags.filter(Boolean).length;
  return { verifyDone, profileDone, alertDone, completeN, total: flags.length, complete: completeN >= flags.length };
}