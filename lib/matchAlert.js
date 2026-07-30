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

function jobMatchesOneAlert(job, a){
  const title = (job.title || "").toLowerCase();
  const comp  = (job.company || "").toLowerCase();
  const loc   = (job.location || "").toLowerCase();
  const results = [];
  if(a.roles && a.roles.length) results.push(a.roles.some(r => title.includes(String(r).toLowerCase())));
  if(a.seniority && a.seniority.length) results.push(a.seniority.some(s => { const t = String(s).toLowerCase(); return title.includes(t) || title.includes(t.split("-")[0]); }));
  if(a.companies && a.companies.length) results.push(a.companies.some(c => comp.includes(String(c).toLowerCase())));
  if(a.locations && a.locations.length) results.push(a.locations.some(l => { const ll = String(l).toLowerCase(); return loc.includes(ll) || (ll === "remote" && (job.isRemote || /remote/i.test(loc))); }));
  if(results.length === 0) return false;
  return a.matchAll ? results.every(Boolean) : results.some(Boolean);
}

export function jobMatchesAnyAlert(job, alerts){
  return asAlertArray(alerts).some(a => jobMatchesOneAlert(job, a));
}
