// lib/salary.js — turns messy job data into game-industry salary stats.
// Parses salary strings to annual USD ranges, classifies each posting into a
// canonical role / level / region, and aggregates into median + quartiles with
// sample sizes. USD-only for now (mixing currencies in a median is meaningless).

export function parseSalaryRange(s) {
  if (!s || typeof s !== "string") return null;
  if (/€|£|eur|gbp|cad|aud|\bc\$/i.test(s)) return { currency: "OTHER" }; // flag non-USD, excluded from stats
  const nums = [...s.matchAll(/\$?\s*([\d][\d,.]*)\s*([kKmM])?/g)].map(m => {
    let n = parseFloat(m[1].replace(/,/g, ""));
    if (!isFinite(n)) return null;
    const suf = (m[2] || "").toLowerCase();
    if (suf === "k") n *= 1000; else if (suf === "m") n *= 1000000;
    return n;
  }).filter(n => n != null);
  const annual = nums.filter(n => n >= 25000 && n <= 800000); // plausible annual salaries
  if (annual.length === 0) return null;
  const min = Math.min(...annual), max = Math.max(...annual);
  return { min, max: max > min ? max : min, currency: "USD" };
}

const ROLE_RULES = [
  ["Technical Artist", /technical artist|tech artist/i],
  ["Gameplay Programmer", /gameplay (programmer|engineer|developer)|game(play)? (programmer|engineer)/i],
  ["Engine / Graphics Programmer", /engine (programmer|engineer)|graphics (programmer|engineer)|rendering (engineer|programmer)/i],
  ["Tools Programmer", /tools (programmer|engineer)|pipeline (engineer|programmer)/i],
  ["Backend / Server Engineer", /back ?end|server (engineer|programmer)|services engineer|platform engineer|infrastructure engineer/i],
  ["Programmer / Engineer", /programmer|software (engineer|developer)|\bengineer\b|\bdeveloper\b/i],
  ["Level Designer", /level designer|world designer|encounter designer/i],
  ["Narrative Designer / Writer", /narrative|\bwriter\b|writing/i],
  ["Systems / Combat Designer", /systems? designer|combat designer|economy designer|game systems/i],
  ["UI/UX Designer", /ui\/?ux|ux designer|ui designer|user experience/i],
  ["Game Designer", /game designer|gameplay designer|\bdesigner\b/i],
  ["Environment / 3D Artist", /environment artist|3d artist|character artist|prop artist|world artist/i],
  ["Concept Artist", /concept artist/i],
  ["Animator", /animator|animation/i],
  ["VFX Artist", /\bvfx\b|visual effects/i],
  ["Artist / Art Director", /\bartist\b|art director|art lead/i],
  ["Producer", /producer|production (manager|coordinator|director)/i],
  ["Product Manager", /product manager|product owner/i],
  ["QA / Tester", /\bqa\b|quality assurance|\btester\b|test (engineer|analyst)/i],
  ["Audio / Sound", /\baudio\b|sound designer|composer|music/i],
  ["Data / Analytics", /data (scientist|analyst|engineer)|analytics/i],
  ["DevOps / IT", /devops|site reliability|\bsre\b|sysadmin|it (support|engineer|administrator)/i],
  ["Community / Marketing", /community (manager|coordinator)|marketing|social media|brand manager|influencer/i],
];

export function classifyRole(title) {
  const t = String(title || "");
  for (const [role, re] of ROLE_RULES) if (re.test(t)) return role;
  return "Other";
}

export function classifyLevel(title) {
  const t = String(title || "").toLowerCase();
  if (/\b(principal|staff|director|head of|vp|vice president|chief|distinguished)\b/.test(t)) return "Principal / Director";
  if (/\b(lead|manager|supervisor|management)\b/.test(t)) return "Lead / Manager";
  if (/\b(senior|sr\.?|iii)\b/.test(t)) return "Senior";
  if (/\b(junior|jr\.?|entry|associate|intern|graduate|trainee)\b/.test(t)) return "Junior / Entry";
  return "Mid";
}

export function classifyRegion(job) {
  if (job && job.isRemote) return "Remote";
  const loc = String((job && job.location) || "").toLowerCase();
  if (!loc) return "Remote";
  if (/canada|, on\b|, bc\b|, qc\b|, ab\b|ontario|quebec|british columbia|toronto|montreal|vancouver/.test(loc)) return "Canada";
  if (/united kingdom|england|london|scotland|, uk\b/.test(loc)) return "United Kingdom";
  if (/germany|france|spain|italy|netherlands|sweden|poland|finland|europe|berlin|paris|madrid|amsterdam/.test(loc)) return "Europe";
  if (/, [a-z]{2}\b|united states|usa|, us\b|california|texas|washington|new york|remote us/.test(loc)) return "United States";
  return "Other";
}

function stat(nums) {
  if (!nums || nums.length === 0) return null;
  const s = [...nums].sort((a, b) => a - b);
  const q = p => s[Math.min(s.length - 1, Math.max(0, Math.floor(p * s.length)))];
  return { median: q(0.5), p25: q(0.25), p75: q(0.75), min: s[0], max: s[s.length - 1], count: s.length };
}

const MIN_N = 4; // don't publish a bucket with fewer than this many samples

export function aggregate(jobs) {
  const buckets = {};
  let usdCount = 0;
  for (const j of jobs) {
    if (!j || !j.title) continue;
    const sal = parseSalaryRange(j.salary);
    if (!sal || sal.currency !== "USD") continue;
    const role = classifyRole(j.title);
    if (role === "Other") continue;
    usdCount++;
    const mid = (sal.min + sal.max) / 2;
    const level = classifyLevel(j.title);
    const region = classifyRegion(j);
    const b = (buckets[role] = buckets[role] || { all: [], byLevel: {}, byRegion: {} });
    b.all.push(mid);
    (b.byLevel[level] = b.byLevel[level] || []).push(mid);
    (b.byRegion[region] = b.byRegion[region] || []).push(mid);
  }
  const out = {};
  for (const [role, b] of Object.entries(buckets)) {
    if (b.all.length < MIN_N) continue;
    const filt = obj => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, stat(v)]).filter(([, s]) => s && s.count >= MIN_N));
    out[role] = { all: stat(b.all), byLevel: filt(b.byLevel), byRegion: filt(b.byRegion) };
  }
  return { roles: out, sampleSize: usdCount };
}

export function roleSlug(role) {
  return String(role).toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/[\s/]+/g, "-").replace(/-+/g, "-");
}

// Cached aggregation over the live snapshot (5 min), so the salary pages don't
// re-aggregate ~4500 jobs on every request. Imports snapshot lazily to stay
// build-safe.
let _statsCache = { data: null, at: 0 };
export async function getSalaryStats() {
  if (_statsCache.data && Date.now() - _statsCache.at < 5 * 60 * 1000) return _statsCache.data;
  const { getSnapshot } = await import("./snapshot");
  const map = await getSnapshot();
  const jobs = Object.values(map || {}).flat().filter(Boolean);
  const data = aggregate(jobs);
  _statsCache = { data, at: Date.now() };
  return data;
}

// Role landing-page data: all live jobs classified into this role + its salary stat.
export async function getRolePageData(slug) {
  const { getSnapshot } = await import("./snapshot");
  const map = await getSnapshot();
  const jobs = Object.values(map || {}).flat().filter(Boolean);
  let role = null;
  const matched = [];
  for (const j of jobs) {
    if (!j.title) continue;
    const r = classifyRole(j.title);
    if (r === "Other") continue;
    if (roleSlug(r) === slug) { role = r; matched.push(j); }
  }
  if (!role) return null;
  let salary = null;
  try { const stats = await getSalaryStats(); salary = (stats.roles[role] && stats.roles[role].all) || null; } catch (e) {}
  return { role, jobs: matched, salary };
}

// {role, slug, count}[] for every role that has at least one live posting (sitemap/index).
export async function allRolesWithJobs() {
  const { getSnapshot } = await import("./snapshot");
  const map = await getSnapshot();
  const jobs = Object.values(map || {}).flat().filter(Boolean);
  const counts = {};
  for (const j of jobs) {
    if (!j.title) continue;
    const r = classifyRole(j.title);
    if (r === "Other") continue;
    counts[r] = (counts[r] || 0) + 1;
  }
  return Object.entries(counts).map(([role, count]) => ({ role, slug: roleSlug(role), count })).sort((a, b) => b.count - a.count);
}
