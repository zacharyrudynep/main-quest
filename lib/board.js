// lib/board.js — the shared job-board assembly. buildJobMap() produces the exact
// same company->jobs snapshot that pages/index.js builds on the client, so the
// snapshot cron and the browser are interchangeable. The per-feed fetch is injected
// (browser fetch vs server fetch) via fetchRaw(platform, slug) => rawJobs[].
import { COMPANIES_DATA } from "./companiesData";
import { ATS_STUDIOS } from "./studios";
import { normalizeATSJob } from "./normalize";

const _BLOCKED_JOBS = new Set([
  "Crazy Maple Studio||Director, Brand Partnerships & Branded Content",
]);
const _isBlockedJob = (job) => !!job && _BLOCKED_JOBS.has(`${job.company}||${job.title}`);

export async function buildJobMap({ fetchRaw, concurrency = 12, onProgress } = {}) {
  // company -> { company, stateKey } (home-state drives placement; must match index.js)
  const coLookup = {};
  for (const [, states] of Object.entries(COMPANIES_DATA))
    for (const [state, companies] of Object.entries(states))
      for (const c of companies) { if (!coLookup[c.name]) coLookup[c.name] = { company: c, stateKey: state }; }

  // Group studios that share a platform+slug so a shared board is fetched once and
  // its postings are divided among the studios (a posting never shows under two).
  const entries = Object.entries(ATS_STUDIOS);
  const groups = {};
  for (const e of entries) { const [, { platform, slug }] = e; const key = platform + "\u241f" + String(slug); (groups[key] = groups[key] || []).push(e); }
  const groupList = Object.values(groups);

  const nameTokens = nm => String(nm || "").toLowerCase()
    .replace(/\b(studios?|games?|entertainment|interactive|inc|llc|ltd|the|group|co|corp)\b/g, " ")
    .split(/[^a-z0-9]+/).filter(t => t.length >= 3);
  const rawText = raw => {
    const L = raw.location;
    const locStr = typeof L === "string" ? L : (L && (L.name || L.location_str || [L.city, L.state].filter(Boolean).join(" ")) || "");
    return [raw.title, raw.text, raw.name, raw.brand, raw.team, raw.office, raw.locationsText, raw.department,
      raw.departments && JSON.stringify(raw.departments), raw.offices && JSON.stringify(raw.offices),
      raw.categories && (raw.categories.team || raw.categories.department), locStr]
      .filter(Boolean).join(" ").toLowerCase();
  };
  const pickStudio = (raw, members) => {
    const text = rawText(raw);
    let best = members[0][0], bestScore = 0;
    for (const [nm] of members) { let sc = 0; for (const tk of nameTokens(nm)) { if (text.includes(tk)) sc += 2; } if (sc > bestScore) { bestScore = sc; best = nm; } }
    if (bestScore > 0) return best;
    for (const [nm] of members) { const st = ((coLookup[nm] && coLookup[nm].stateKey) || "").toLowerCase(); if (st && st !== "remote" && text.includes(st)) return nm; }
    return members[0][0];
  };
  const normFor = (companyName, platform, rawJobs, slug) => {
    const found = coLookup[companyName];
    const company = found ? found.company : { name: companyName, url: "", email: null };
    const stateKey = found ? found.stateKey : "Remote";
    const jobs = rawJobs.map(j => normalizeATSJob(j, platform, company, stateKey, slug)).filter(j => j && !_isBlockedJob(j));
    return [companyName, jobs.length > 0 ? jobs : null];
  };
  const fetchGroup = async (members) => {
    const [, { platform, slug }] = members[0];
    let rawJobs = [];
    try { rawJobs = (await fetchRaw(platform, slug)) || []; } catch (e) { return members.map(([nm]) => [nm, null]); }
    if (members.length === 1) return [normFor(members[0][0], platform, rawJobs, slug)];
    const buckets = {}; for (const [nm] of members) buckets[nm] = [];
    for (const rj of rawJobs) { buckets[pickStudio(rj, members)].push(rj); }
    return members.map(([nm]) => normFor(nm, platform, buckets[nm], slug));
  };

  const map = {};
  let done = 0;
  for (let i = 0; i < groupList.length; i += concurrency) {
    const slice = groupList.slice(i, i + concurrency);
    const results = await Promise.all(slice.map(fetchGroup));
    for (const pairs of results) for (const [nm, jobs] of pairs) map[nm] = jobs;
    done += slice.length;
    if (onProgress) onProgress(Math.min(99, Math.round((done / groupList.length) * 100)));
  }
  return map;
}
