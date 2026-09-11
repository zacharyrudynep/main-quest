// Shared job-alert matching — identical logic to the site's client-side scan.
// jobAlerts is an array of {id, roles[], seniority[], locations[], companies[], matchAll}.

export function asAlertArray(ja){
  if(Array.isArray(ja)) return ja;
  if(ja && typeof ja === "object"){
    const roles = ja.roles || [], seniority = ja.seniority || [];
    const locations = typeof ja.locations === "string" ? ja.locations.split(",").map(s=>s.trim()).filter(Boolean) : (ja.locations || []);
    const companies = typeof ja.companies === "string" ? ja.companies.split(",").map(s=>s.trim()).filter(Boolean) : (ja.companies || []);
    if(roles.length || seniority.length || locations.length || companies.length)
      return [{ id:"legacy", roles, seniority, locations, companies, matchAll:!!ja.matchAll }];
  }
  return [];
}

export function alertHasCriteria(alerts){ return asAlertArray(alerts).length > 0; }

// Precise role matching: the whole role must be present as whole words
// (seniority prefixes ignored), so "Game Producer" does not match "Game Designer".
const _MQ_LEVELS=/\b(senior|sr|junior|jr|principal|staff|associate|assoc|mid|entry|intermediate|ii|iii|iv)\b/g;
function _mqNorm(s){ return " "+String(s||"").toLowerCase().replace(/[\/_,.()\-]/g," ").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim()+" "; }
function _mqStrip(n){ return " "+n.replace(_MQ_LEVELS," ").replace(/\s+/g," ").trim()+" "; }
function _mqTokens(s){ return _mqStrip(_mqNorm(s)).trim().split(" ").filter(w=>w.length>1); }
function _mqExpandSlash(t){ const m=String(t||"").match(/([A-Za-z]+(?:\/[A-Za-z]+)+)/); if(!m) return [t]; const s=m[1]; return s.split("/").map(p=>String(t).replace(s,p)); }
function titleMatchesFilter(jobTitle, filterTitle){
  const jt=_mqStrip(_mqNorm(jobTitle));
  return _mqExpandSlash(filterTitle).some(alt=>{
    const ft=_mqStrip(_mqNorm(alt)).trim();
    if(!ft) return false;
    if(jt.includes(" "+ft+" ")) return true;
    const toks=_mqTokens(alt);
    return toks.length>0 && toks.every(tk=>jt.includes(" "+tk+" "));
  });
}
function jobMatchesOneAlert(job, a){
  const title = (job.title || "").toLowerCase();
  const comp  = (job.company || "").toLowerCase();
  const loc   = (job.location || "").toLowerCase();
  const results = [];
  if(a.roles && a.roles.length) results.push(a.roles.some(r => titleMatchesFilter(job.title, r)));
  if(a.seniority && a.seniority.length) results.push(a.seniority.some(s => { const t = String(s).toLowerCase(); return title.includes(t) || title.includes(t.split("-")[0]); }));
  if(a.companies && a.companies.length) results.push(a.companies.some(c => comp.includes(String(c).toLowerCase())));
  if(a.locations && a.locations.length) results.push(a.locations.some(l => { const ll = String(l).toLowerCase(); return loc.includes(ll) || (ll === "remote" && (job.isRemote || /remote/i.test(loc))); }));
  if(results.length === 0) return false;
  return a.matchAll ? results.every(Boolean) : results.some(Boolean);
}

export function jobMatchesAnyAlert(job, alerts){
  return asAlertArray(alerts).some(a => jobMatchesOneAlert(job, a));
}
