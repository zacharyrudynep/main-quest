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

// ── Effective tier (single source of truth) ──
// Works out what a profile is ACTUALLY entitled to right now, correctly handling a
// student trial whose clock has run out even before the expire-trials cron flips
// is_premium. This is what makes a lapsed trial (or any downgrade) revert cleanly.
//   - paidPremium: a real, non-trial premium (explicit plan, or is_premium on a
//     non-student account). A student's is_premium flag does NOT count here, so when
//     their premiumUntil passes they fall back to basic immediately.
//   - trialActive: student trial still within its window.
// Returns { isAdmin, isPremium, isStudent, isPlus, plan, premiumUntil, trialExpired }.
export function effectiveTier(prof) {
  const d = (prof && prof.data && typeof prof.data === "object") ? prof.data : {};
  const isAdmin = !!(prof && prof.is_admin);
  const rawPlan = (prof && prof.plan) || "basic";
  const premiumUntil = Number(d.premiumUntil) || 0;
  const trialRedeemed = !!d.studentTrialRedeemed;
  const trialActive = premiumUntil > Date.now();
  const paidPremium = rawPlan === "premium" || (!!(prof && prof.is_premium) && !trialRedeemed);
  const isStudent = trialRedeemed && trialActive;
  const isPremium = isAdmin || paidPremium || isStudent;
  // Plus-or-above: premium implies plus. An explicit "plus" plan grants plus-tier.
  const isPlus = isPremium || rawPlan === "plus";
  const plan = isAdmin ? "premium" : paidPremium ? "premium" : isStudent ? "premium" : rawPlan === "plus" ? "plus" : "basic";
  return { isAdmin, isPremium, isStudent, isPlus, plan, premiumUntil: premiumUntil || null, trialExpired: trialRedeemed && !trialActive };
}

// ── AI access (shared by all AI endpoints) ──
// Premium via Stripe (is_premium / plan) OR an active student trial, OR a one-off
// free credit. Uses effectiveTier so a lapsed trial loses access immediately.
export async function aiAccess(supabaseAdmin, userId) {
  const { data: prof } = await supabaseAdmin.from("profiles").select("is_premium,is_admin,plan,data").eq("id", userId).single();
  const d = (prof && prof.data && typeof prof.data === "object") ? prof.data : {};
  const t = effectiveTier(prof);
  const freeCredits = Number(d.freeAiCredits) || 0;
  // unlimited = admin or an ACTIVE student trial (no monthly cap). Lapsed trials are not.
  return { prof, data: d, isAdmin: t.isAdmin, isStudent: t.isStudent, isPremium: t.isPremium, freeCredits, unlimited: t.isAdmin || t.isStudent, ok: t.isAdmin || t.isPremium || freeCredits > 0 };
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