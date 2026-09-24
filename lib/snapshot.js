// lib/snapshot.js — server-side access to the cached job board for SEO pages
// (job pages, company pages, sitemap). Reads the same gzip snapshot the client
// uses, decompresses it ONCE and caches in memory for 5 min so crawlers hitting
// many pages don't each pay the decompress + parse cost.
import zlib from "zlib";
import { COMPANIES_DATA } from "./companiesData";

let _cache = { map: null, index: null, at: 0 };
const TTL_MS = 5 * 60 * 1000;

export function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

// Stable, human-readable slug for a job. Includes location so same-title roles at
// one studio don't collide.
export function jobSlug(job) {
  return slugify(`${job.company || ""} ${job.title || ""} ${job.location || ""}`) || "role";
}

export function companySlug(name) { return slugify(name); }

async function load() {
  if (_cache.map && Date.now() - _cache.at < TTL_MS) return _cache;
  try {
    const { supabaseAdmin } = await import("./supabaseAdmin"); // lazy: avoid instantiating at build time (no env vars then)
    const { data } = await supabaseAdmin.from("job_cache").select("data").eq("id", "live").single();
    const gz = data && data.data && data.data.gz;
    if (!gz) return _cache.map ? _cache : { map: {}, index: {}, at: Date.now() };
    const map = JSON.parse(zlib.gunzipSync(Buffer.from(gz, "base64")).toString("utf8"));
    const index = {};
    for (const [company, jobs] of Object.entries(map)) {
      if (!Array.isArray(jobs)) continue;
      for (const j of jobs) {
        if (!j || !j.title) continue;
        if (!j.company) j.company = company;
        const s = jobSlug(j);
        if (!index[s]) index[s] = j; // first wins on the rare collision
      }
    }
    _cache = { map, index, at: Date.now() };
  } catch (e) { /* keep any previous cache */ }
  return _cache;
}

export async function getSnapshot() { return (await load()).map || {}; }
export async function findJobBySlug(slug) { return (await load()).index[slug] || null; }
export async function getCompanyJobs(cSlug) {
  const { map } = await load();
  for (const [company, jobs] of Object.entries(map || {})) {
    if (companySlug(company) === cSlug && Array.isArray(jobs)) return { company, jobs: jobs.filter(j => j && j.title) };
  }
  return null;
}

// Curated studio directory (name -> meta) from COMPANIES_DATA, keyed by slug.
let _metaIdx = null;
function companyMetaIndex() {
  if (_metaIdx) return _metaIdx;
  const idx = {};
  for (const [country, states] of Object.entries(COMPANIES_DATA || {})) {
    for (const [state, companies] of Object.entries(states)) {
      for (const c of companies) {
        if (!c || !c.name) continue;
        const s = companySlug(c.name);
        if (!idx[s]) idx[s] = { ...c, location: [state, country].filter(x => x && x !== "Remote").join(", ") || country };
      }
    }
  }
  _metaIdx = idx;
  return idx;
}

// Company page data for ANY studio: live jobs from the snapshot (if any) plus
// directory meta (website, email, contact, apply method). Resolves even for
// studios with no live postings.
export async function getCompanyPageData(slug) {
  const meta = companyMetaIndex()[slug] || null;
  const live = await getCompanyJobs(slug);
  const name = (live && live.company) || (meta && meta.name) || null;
  if (!name) return null;
  return { name, meta, jobs: (live && live.jobs) || [] };
}

// [{ slug, company, updatedHint }] for the sitemap.
export async function allJobEntries() {
  const { index } = await load();
  return Object.entries(index || {}).map(([slug, j]) => ({ slug, company: j.company, title: j.title }));
}
export async function allCompanies() {
  const { map } = await load();
  const set = {};
  for (const [company, jobs] of Object.entries(map || {}))
    if (Array.isArray(jobs) && jobs.some(j => j && j.title)) set[companySlug(company)] = company;
  for (const meta of Object.values(companyMetaIndex())) set[companySlug(meta.name)] = meta.name;
  return Object.entries(set).map(([slug, company]) => ({ company, slug }));
}