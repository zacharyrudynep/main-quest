import { ATS_STUDIOS } from "./studios";

// Lightweight per-platform extraction of just what alerts need: title, location, url.
// Field paths mirror normalizeATSJob() in pages/index.js. If a raw job carries no
// URL we fall back to a board URL built from the platform + slug.
function boardUrl(platform, slug){
  switch(platform){
    case "greenhouse": return `https://job-boards.greenhouse.io/${slug}`;
    case "lever": return `https://jobs.lever.co/${slug}`;
    case "ashby": return `https://jobs.ashbyhq.com/${slug}`;
    case "workable": return `https://apply.workable.com/${slug}/`;
    case "smartrecruiters": return `https://jobs.smartrecruiters.com/${slug}`;
    case "recruitee": return `https://${slug}.recruitee.com/`;
    case "breezy": return `https://${slug}.breezy.hr/`;
    default: return "";
  }
}

export function liteNormalize(raw, platform, slug){
  let title = "", url = "", loc = "", isRemote = false;
  if(platform === "greenhouse"){
    title = raw.title || ""; url = raw.absolute_url || ""; loc = (raw.location && raw.location.name) || "";
  } else if(platform === "lever"){
    title = raw.text || ""; url = raw.hostedUrl || raw.applyUrl || ""; loc = (raw.categories && raw.categories.location) || "";
  } else if(platform === "ashby"){
    title = raw.title || ""; url = raw.jobUrl || raw.applyUrl || "";
    loc = raw.location || (raw.address && raw.address.postalAddress ? [raw.address.postalAddress.addressLocality, raw.address.postalAddress.addressRegion].filter(Boolean).join(", ") : "") || "";
    if(raw.isRemote === true || raw.workplaceType === "Remote") isRemote = true;
  } else if(platform === "workable"){
    title = raw.title || ""; url = raw.url || raw.application_url || ""; loc = (raw.location && raw.location.location_str) || raw.city || "";
  } else if(platform === "smartrecruiters"){
    title = raw.name || ""; const sc = (raw.company && raw.company.identifier) || "";
    url = (raw.id && sc && `https://jobs.smartrecruiters.com/${sc}/${raw.id}`) || raw.applyUrl || raw.jobAdUrl || "";
    loc = [raw.location && raw.location.city, raw.location && raw.location.region].filter(Boolean).join(", ");
  } else if(platform === "recruitee"){
    title = raw.title || ""; url = raw.careers_url || raw.url || ""; loc = raw.location || raw.city || "";
  } else if(platform === "applytojob"){
    title = raw.title || raw.name || ""; url = raw.board_url || raw.apply_url || ""; loc = [raw.city, raw.state].filter(Boolean).join(", ") || raw.location || "";
  } else if(platform === "bamboohr"){
    title = raw.jobOpeningName || raw.title || ""; url = (raw.id && `https://${slug || ""}.bamboohr.com/careers/${raw.id}`) || "";
    loc = raw.location ? (typeof raw.location === "string" ? raw.location : [raw.location.city, raw.location.state].filter(Boolean).join(", ")) : "";
  } else if(platform === "paylocity"){
    title = raw.title || raw.jobTitle || raw.name || ""; url = raw.url || raw.applyUrl || ""; loc = [raw.city, raw.state].filter(Boolean).join(", ") || raw.location || "";
  } else if(platform === "jobvite"){
    title = raw.title || raw.jobTitle || ""; url = raw.detailUrl || raw.applyUrl || raw.url || ""; loc = raw.location || [raw.city, raw.state].filter(Boolean).join(", ") || "";
  } else if(platform === "personio"){
    title = raw.name || ""; url = raw.jobUrl || ""; loc = raw.office || "";
  } else if(platform === "rippling"){
    title = raw.name || raw.title || ""; url = raw.url || raw.jobUrl || raw.applyUrl || "";
    const wl = raw.workLocation || raw.location || {};
    loc = (typeof wl === "string" ? wl : (wl.label || wl.name || [wl.city, wl.state, wl.country].filter(Boolean).join(", "))) || "";
    const wt = ((raw.workLocation && raw.workLocation.workplaceType) || raw.workplaceType || "").toLowerCase();
    if(wt === "remote") isRemote = true;
  } else if(platform === "breezy"){
    title = raw.name || raw.title || ""; url = raw.url || raw.careersUrl || "";
    const bl = raw.location || {};
    loc = (typeof bl === "string" ? bl : (bl.name || [bl.city, bl.state, bl.country_name || bl.country].filter(Boolean).join(", "))) || "";
    if(raw.remote === true || bl.is_remote === true || /remote/i.test(bl.name || "")) isRemote = true;
  } else if(platform === "workday"){
    title = raw.title || ""; const host = raw.__wdHost || "", path = raw.externalPath || "";
    url = raw.externalUrl || ((host && path) ? `${host}${path}` : ""); loc = raw.locationsText || "";
  } else {
    title = raw.title || raw.name || raw.text || ""; url = raw.url || raw.absolute_url || raw.jobUrl || raw.hostedUrl || "";
    loc = (raw.location && (raw.location.name || raw.location.location_str)) || (typeof raw.location === "string" ? raw.location : "") || "";
  }
  if(!isRemote) isRemote = /remote|distributed|anywhere/i.test(`${title} ${loc}`);
  if(!url) url = boardUrl(platform, slug);
  return { title: String(title || "").trim(), location: String(loc || "").trim(), url: url || "", isRemote };
}

// Fetch every studio's current jobs (through the site's own ATS proxy, which is
// edge-cached) and return a flat list of {company, title, location, url, isRemote}.
export async function fetchAllJobs(baseUrl, { concurrency = 10, perRequestMs = 28000 } = {}){
  const entries = Object.entries(ATS_STUDIOS); // [name, {platform, slug}]
  const out = [];
  const one = async ([name, { platform, slug }]) => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), perRequestMs);
    try{
      const res = await fetch(`${baseUrl}/api/jobs/ats?platform=${platform}&slug=${encodeURIComponent(slug)}`, { signal: ctrl.signal });
      if(!res.ok) return;
      const data = await res.json();
      for(const raw of (data.jobs || [])){
        const j = liteNormalize(raw, platform, slug);
        if(j.title) out.push({ company: name, ...j });
      }
    }catch(e){ /* skip this studio on error/timeout */ }
    finally{ clearTimeout(t); }
  };
  for(let i = 0; i < entries.length; i += concurrency){
    await Promise.all(entries.slice(i, i + concurrency).map(one));
  }
  return out;
}
