// lib/normalize.js — server+client ATS job normalizer, extracted verbatim from
// pages/index.js so the client, the /api/jobs/ats route, and the snapshot cron all
// produce IDENTICAL job objects. No browser APIs are used (verified).

const US_STATE_ABBR={alabama:"AL",alaska:"AK",arizona:"AZ",arkansas:"AR",california:"CA",colorado:"CO",connecticut:"CT",delaware:"DE",florida:"FL",georgia:"GA",hawaii:"HI",idaho:"ID",illinois:"IL",indiana:"IN",iowa:"IA",kansas:"KS",kentucky:"KY",louisiana:"LA",maine:"ME",maryland:"MD",massachusetts:"MA",michigan:"MI",minnesota:"MN",mississippi:"MS",missouri:"MO",montana:"MT",nebraska:"NE",nevada:"NV","new hampshire":"NH","new jersey":"NJ","new mexico":"NM","new york":"NY","north carolina":"NC","north dakota":"ND",ohio:"OH",oklahoma:"OK",oregon:"OR",pennsylvania:"PA","rhode island":"RI","south carolina":"SC","south dakota":"SD",tennessee:"TN",texas:"TX",utah:"UT",vermont:"VT",virginia:"VA",washington:"WA","west virginia":"WV",wisconsin:"WI",wyoming:"WY","district of columbia":"DC",ontario:"ON",quebec:"QC","british columbia":"BC",alberta:"AB",manitoba:"MB",saskatchewan:"SK","nova scotia":"NS","new brunswick":"NB","newfoundland and labrador":"NL","prince edward island":"PE"};

const fmt=v=>{ if(v==null) return ""; const n=Number(v); if(!isFinite(n)) return ""; return n>=1000?`$${Math.round(n/1000)}K`:`$${n}`; };

function ashbySalary(comp){
  if(!comp) return "";
  // 1. Cleanest: the scrapeable salary summary, e.g. "$81K - $87K"
  if(comp.scrapeableCompensationSalarySummary) return comp.scrapeableCompensationSalarySummary;
  // 2. Look for a Salary component inside the tiers or summary components.
  const pools=[];
  if(Array.isArray(comp.summaryComponents)) pools.push(comp.summaryComponents);
  if(Array.isArray(comp.compensationTiers)) for(const t of comp.compensationTiers){ if(Array.isArray(t.components)) pools.push(t.components); }
  for(const pool of pools){
    const sal=pool.find(c=>c && c.compensationType==="Salary" && (c.minValue||c.maxValue));
    if(sal){
      const fmt=v=>{ if(v==null) return ""; const n=Number(v); if(!isFinite(n)) return ""; return n>=1000?`$${Math.round(n/1000)}K`:`$${n}`; };
      const lo=fmt(sal.minValue), hi=fmt(sal.maxValue);
      if(lo&&hi&&lo!==hi) return `${lo} \u2013 ${hi}`;
      if(lo||hi) return lo||hi;
    }
  }
  // 3. Fall back to the tier summary if it mentions a dollar figure.
  if(comp.compensationTierSummary && /\$/.test(comp.compensationTierSummary)) return comp.compensationTierSummary;
  return "";
}

function parseWorkdayPosted(txt){
  const s=(txt||"").toLowerCase();
  if(!s) return Date.now();
  if(/today|just posted/.test(s)) return Date.now();
  if(/yesterday/.test(s)) return Date.now()-86400000;
  const m=s.match(/(\d+)\+?\s*day/);
  if(m) return Date.now()-parseInt(m[1],10)*86400000;
  const mo=s.match(/(\d+)\+?\s*month/);
  if(mo) return Date.now()-parseInt(mo[1],10)*30*86400000;
  return Date.now();
}

function locationLabel(loc){
  const raw=(loc||"").trim();
  if(!raw) return "Other";
  if(/remote|distributed|anywhere|work from home|wfh/i.test(raw)) return "Remote";
  // Split on commas; keep city + state-ish, drop country.
  const parts=raw.split(/[,\u2022\/|]+/).map(s=>s.trim()).filter(Boolean);
  if(!parts.length) return "Other";
  const dropCountry=/^(usa|u\.s\.a?\.?|united states|canada|remote)$/i;
  const kept=parts.filter(p=>!dropCountry.test(p));
  const use=kept.length?kept:parts;
  let city=use[0]||"";
  let region=use[1]||"";
  // Normalize a full state name to its abbreviation.
  const regAbbr=US_STATE_ABBR[region.toLowerCase()];
  if(regAbbr) region=regAbbr;
  else if(region.length>2){ const c=US_STATE_ABBR[region.toLowerCase()]; if(c) region=c; }
  // If city itself is a full state name with no region, just show the state.
  if(!region && US_STATE_ABBR[city.toLowerCase()]) return city;
  const out=[city,region].filter(Boolean).join(", ");
  return out||"Other";
}

function parseJobSections(html,plainText){
  const out={summary:"",responsibilities:[],requirements:[]};
  if(!html&&!plainText)return out;
  // Decode HTML entities first (some ATS double-encode their HTML)
  if(html)html=html.replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&#x27;/g,"'").replace(/&apos;/g,"'").replace(/&amp;/g,"&").replace(/&nbsp;/g," ").replace(/&mdash;/g,"\u2014").replace(/&ndash;/g,"\u2013").replace(/&rsquo;/g,"’").replace(/&hellip;/g,"\u2026").replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(+n));
  // Pull <li> items grouped by the nearest preceding heading
  const liItems=[];
  if(html){
    // Split on headings to find section context
    const sections=html.split(/<(?:h[1-6]|strong|b)[^>]*>/i);
    for(const sec of sections){
      const headMatch=sec.slice(0,80).replace(/<[^>]+>/g," ").toLowerCase();
      const lis=[...sec.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(m=>m[1].replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim()).filter(t=>t.length>3&&t.length<300);
      if(lis.length){
        const isReq=/require|qualif|you have|you'll need|skills|experience|must have|looking for/i.test(headMatch);
        const isResp=/responsib|what you|you will|role|duties|day.to.day|about the/i.test(headMatch);
        for(const li of lis){
          if(isReq)out.requirements.push(li);
          else if(isResp)out.responsibilities.push(li);
          else liItems.push(li);
        }
      }
    }
  }
  // If nothing was categorized but we have loose <li>, use keyword heuristics
  if(out.responsibilities.length===0&&out.requirements.length===0&&liItems.length===0&&html){
    const allLis=[...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(m=>m[1].replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim()).filter(t=>t.length>3&&t.length<300);
    allLis.forEach(li=>{
      if(/\b(year|experience|degree|proficien|knowledge of|familiar|expert|strong|ability to|bachelor|skill)\b/i.test(li))out.requirements.push(li);
      else out.responsibilities.push(li);
    });
  } else {
    // distribute uncategorized list items into responsibilities by default
    liItems.forEach(li=>out.responsibilities.push(li));
  }
  // Cap list lengths
  out.responsibilities=out.responsibilities.slice(0,8);
  out.requirements=out.requirements.slice(0,8);
  // Summary = first meaningful paragraph of plain text
  if(plainText){
    const firstPara=plainText.split(/(?<=[.!?])\s+/).slice(0,3).join(" ");
    out.summary=firstPara.slice(0,240);
  }
  return out;
}

export function normalizeATSJob(raw, platform, company, stateKey, slug) {
  const decodeEntities = h => (h||"")
    .replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&#x27;/g,"'").replace(/&apos;/g,"'")
    .replace(/&amp;/g,"&").replace(/&nbsp;/g," ").replace(/&mdash;/g,"\u2014").replace(/&ndash;/g,"\u2013").replace(/&rsquo;/g,"’").replace(/&lsquo;/g,"\u2018").replace(/&ldquo;/g,"\u201c").replace(/&rdquo;/g,"\u201d").replace(/&hellip;/g,"\u2026").replace(/&#(\d+);/g,(_,n)=>String.fromCharCode(+n));
  const stripHtml = h => decodeEntities(h||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
  const guessExp = t => { const tl=(t||"").toLowerCase(); if(/director|head of|vp/.test(tl))return"Director"; if(/principal/.test(tl))return"Principal"; if(/\blead\b/.test(tl))return"Lead"; if(/senior|sr\./.test(tl))return"Senior"; if(/junior|jr\.|entry|\bintern\b|internship|\bco-?op\b/.test(tl))return"Entry Level"; return"Mid Level"; };
  let title="", url="", body="", loc="", updated=Date.now(), salary="Salary not listed", rawHtml="";

  if(platform==="greenhouse"){
    title=raw.title||""; url=raw.absolute_url||company.url; rawHtml=raw.content||""; body=stripHtml(rawHtml);
    loc=raw.location?.name||""; updated=new Date(raw.updated_at||raw.first_published_at||Date.now()).getTime();
    // Greenhouse pay-transparency ranges, when present.
    if(Array.isArray(raw.pay_input_ranges)&&raw.pay_input_ranges.length){
      const pr=raw.pay_input_ranges[0];
      const fmt=v=>{const n=Number(v);return isFinite(n)?(n>=1000?`$${Math.round(n/1000)}K`:`$${n}`):"";};
      const lo=fmt(pr.min_cents/100),hi=fmt(pr.max_cents/100);
      if(lo&&hi&&lo!==hi) salary=`${lo} \u2013 ${hi}`; else if(lo||hi) salary=lo||hi;
    }
  } else if(platform==="lever"){
    title=raw.text||""; url=raw.hostedUrl||raw.applyUrl||company.url; rawHtml=raw.description||raw.descriptionPlain||""; body=stripHtml(raw.descriptionPlain||raw.description||"");
    loc=raw.categories?.location||""; updated=raw.createdAt||Date.now();
  } else if(platform==="ashby"){
    title=raw.title||""; url=raw.jobUrl||raw.applyUrl||company.url; rawHtml=raw.descriptionHtml||raw.descriptionPlain||""; body=stripHtml(rawHtml)||raw.descriptionPlain||"";
    loc=raw.location||[raw.address?.postalAddress?.addressLocality,raw.address?.postalAddress?.addressRegion].filter(Boolean).join(", ")||"";
    updated=new Date(raw.publishedAt||Date.now()).getTime();
    salary=ashbySalary(raw.compensation)||ashbySalary(raw._boardCompensation)||salary;
  } else if(platform==="workable"){
    title=raw.title||""; url=raw.url||raw.application_url||company.url; rawHtml=raw.description||""; body=stripHtml(rawHtml);
    loc=raw.location?.location_str||raw.city||""; updated=new Date(raw.published_on||Date.now()).getTime();
  } else if(platform==="smartrecruiters"){
    title=raw.name||"";
    // Correct public posting URL: jobs.smartrecruiters.com/{companyIdentifier}/{postingId}
    const srCompany=raw.company?.identifier||"";
    url=(raw.id&&srCompany&&`https://jobs.smartrecruiters.com/${srCompany}/${raw.id}`)||raw.applyUrl||raw.jobAdUrl||company.url;
    rawHtml=raw.jobAd?.sections?.jobDescription?.text||""; body=stripHtml(rawHtml);
    // SmartRecruiters region can be a 2-letter code (CA) or full name (California).
    loc=[raw.location?.city,raw.location?.region].filter(Boolean).join(", "); updated=new Date(raw.releasedDate||Date.now()).getTime();
  } else if(platform==="recruitee"){
    title=raw.title||""; url=raw.careers_url||raw.url||company.url; rawHtml=raw.description||""; body=stripHtml(rawHtml);
    loc=raw.location||raw.city||""; updated=new Date(raw.published_at||Date.now()).getTime();
  } else if(platform==="applytojob"){
    title=raw.title||raw.name||""; url=raw.board_url||raw.apply_url||company.url; rawHtml=raw.description||""; body=stripHtml(rawHtml);
    loc=[raw.city,raw.state].filter(Boolean).join(", ")||raw.location||""; updated=new Date(raw.original_open_date||raw.created_at||Date.now()).getTime();
    if(raw.minimum_salary&&raw.maximum_salary) salary=`$${raw.minimum_salary} \u2013 $${raw.maximum_salary}`;
  } else if(platform==="bamboohr"){
    title=raw.jobOpeningName||raw.title||""; url=(raw.id&&slug)?`https://${slug}.bamboohr.com/careers/${raw.id}`:company.url; rawHtml=raw.description||""; body=stripHtml(rawHtml);
    loc=raw.location?(typeof raw.location==="string"?raw.location:[raw.location.city,raw.location.state].filter(Boolean).join(", ")):""; updated=new Date(raw.datePosted||Date.now()).getTime();
  } else if(platform==="paylocity"){
    title=raw.title||raw.jobTitle||raw.name||""; url=raw.url||raw.applyUrl||company.url; rawHtml=raw.description||raw.jobDescription||""; body=stripHtml(rawHtml);
    loc=[raw.city,raw.state].filter(Boolean).join(", ")||raw.location||""; updated=new Date(raw.postedDate||raw.datePosted||Date.now()).getTime();
  } else if(platform==="jobvite"){
    title=raw.title||raw.jobTitle||""; url=raw.detailUrl||raw.applyUrl||raw.url||company.url; rawHtml=raw.description||raw.jobDescription||""; body=stripHtml(rawHtml);
    loc=raw.location||[raw.city,raw.state].filter(Boolean).join(", ")||""; updated=new Date(raw.date||raw.postedDate||Date.now()).getTime();
  } else if(platform==="personio"){
    title=raw.name||""; url=raw.jobUrl||((slug&&raw.id)?`https://${slug}.jobs.personio.com/job/${raw.id}`:company.url); rawHtml=raw.description||""; body=stripHtml(rawHtml);
    loc=raw.office||""; updated=new Date(raw.createdAt||Date.now()).getTime();
  } else if(platform==="rippling"){
    title=raw.name||raw.title||"";
    // Public apply URL from the listing; fall back to the company page.
    url=raw.url||raw.jobUrl||raw.applyUrl||company.url;
    // Rippling listings don't include descriptions; body stays empty (details
    // require a per-job call we skip). workLocation is a rich object.
    rawHtml=raw.description||"";
    body=stripHtml(rawHtml);
    const wl=raw.workLocation||raw.location||{};
    loc=(typeof wl==="string"?wl:(wl.label||wl.name||[wl.city,wl.state,wl.country].filter(Boolean).join(", ")))||"";
    updated=new Date(raw.createdAt||raw.postedAt||raw.updatedAt||Date.now()).getTime();
  } else if(platform==="breezy"){
    title=raw.name||raw.title||"";
    // Public posting URL — Breezy provides `url` on each posting.
    url=raw.url||raw.careersUrl||((slug&&(raw.friendly_id||raw._id))?`https://${slug}.breezy.hr/p/${raw.friendly_id||raw._id}`:company.url);
    rawHtml=raw.description||""; body=stripHtml(rawHtml);
    // Location can be a string or an object {name,city,state,country}.
    const bl=raw.location||{};
    loc=(typeof bl==="string"?bl:(bl.name||[bl.city,bl.state,bl.country_name||bl.country].filter(Boolean).join(", ")))||"";
    updated=new Date(raw.published_date||raw.creation_date||raw.updated_date||Date.now()).getTime();
  } else if(platform==="workday"){
    title=raw.title||"";
    // Full apply URL: the CXS host + the posting's externalPath (which already
    // includes the site segment). __wdHost is attached by the proxy.
    const host=raw.__wdHost||"";
    const path=raw.externalPath||"";
    url=raw.externalUrl||((host&&path)?`${host}${path}`:(company.url||""));
    // Listings don't include descriptions (they need a per-job call we skip);
    // body stays empty. Location comes as locationsText, e.g. "Cedar Falls, IA"
    // or "2 Locations" for multi-site postings.
    rawHtml=""; body="";
    loc=raw.locationsText||"";
    // postedOn is relative text ("Posted 5 Days Ago" / "Posted Today"); parse it.
    updated=parseWorkdayPosted(raw.postedOn);
  }

  const daysAgo=Math.floor((Date.now()-updated)/86400000);
  let isRemote=/remote|distributed|anywhere/i.test(title+" "+loc+" "+body.slice(0,200)); let isHybrid=false;
  // Structured employment type / remote flag when the ATS provides them (Ashby does).
  let jobType="Full-time";
  if(platform==="ashby"){
    if(raw.isRemote===true||raw.workplaceType==="Remote") isRemote=true;
    const et={FullTime:"Full-time",PartTime:"Part-time",Intern:"Internship",Contract:"Contract",Temporary:"Temporary"}[raw.employmentType];
    if(et) jobType=et;
  }
  if(platform==="personio"){
    const et={full_time:"Full-time","full-time":"Full-time",part_time:"Part-time","part-time":"Part-time",intern:"Internship",trainee:"Internship",temporary:"Temporary",contract:"Contract"}[(raw.employmentType||"").toLowerCase()];
    if(et) jobType=et;
  }
  if(platform==="rippling"){
    const wl=raw.workLocation||{};
    const wt=(wl.workplaceType||raw.workplaceType||"").toLowerCase();
    if(wt==="remote") isRemote=true;
    else if(wt==="hybrid") isHybrid=true;
    const et={FULL_TIME:"Full-time",PART_TIME:"Part-time",INTERN:"Internship",CONTRACT:"Contract",TEMPORARY:"Temporary"}[(raw.employmentType||"").toUpperCase()];
    if(et) jobType=et;
  }
  if(platform==="breezy"){
    // Breezy `type` is an object like {id:"full_time",name:"Full-Time"}.
    const tn=((raw.type&&(raw.type.name||raw.type.id))||"").toLowerCase();
    const et={"full-time":"Full-time","full_time":"Full-time","part-time":"Part-time","part_time":"Part-time","contract":"Contract","contractor":"Contract","internship":"Internship","intern":"Internship","temporary":"Temporary","seasonal":"Temporary","volunteer":"Volunteer"}[tn];
    if(et) jobType=et;
    // Workplace/remote flags: `remote` boolean or location.is_remote, or category.
    const bl=raw.location||{};
    if(raw.remote===true||bl.is_remote===true||/remote/i.test(bl.name||"")) isRemote=true;
    if(/hybrid/i.test(bl.name||"")) isHybrid=true;
  }
  // Greenhouse/Lever/Workable/SmartRecruiters/Recruitee/etc. expose employment
  // type in assorted fields; check the common ones generically so Contract,
  // Part-time, Temporary and Internship get tagged (not just defaulted to Full-time).
  const typeMap={
    "full-time":"Full-time","full time":"Full-time","fulltime":"Full-time","full_time":"Full-time","permanent":"Full-time","regular":"Full-time",
    "part-time":"Part-time","part time":"Part-time","parttime":"Part-time","part_time":"Part-time",
    "contract":"Contract","contractor":"Contract","contract-to-hire":"Contract","fixed-term":"Contract","fixed term":"Contract","fixed_term":"Contract","freelance":"Contract","consultant":"Contract","b2b":"Contract",
    "temporary":"Temporary","temp":"Temporary","seasonal":"Temporary",
    "internship":"Internship","intern":"Internship","co-op":"Internship","coop":"Internship","apprentice":"Internship","apprenticeship":"Internship","working student":"Internship","trainee":"Internship",
    "volunteer":"Volunteer",
  };
  const mapType=(v)=>{ if(!v) return null; const k=String(v).toLowerCase().trim(); if(typeMap[k]) return typeMap[k]; for(const key in typeMap){ if(k.includes(key)) return typeMap[key]; } return null; };
  // Look through the fields different ATSes commonly use for employment type.
  const typeCandidates=[
    raw.employmentType, raw.employment_type, raw.type, raw.jobType, raw.job_type,
    raw.commitment, raw.contractType, raw.contract_type, raw.workType, raw.work_type,
    raw.category, raw.EmploymentType, raw.employmentIndicator,
    raw.type&&raw.type.name, raw.type&&raw.type.id,
    raw.categories&&raw.categories.commitment,
    raw.metadata&&Array.isArray(raw.metadata)&&(raw.metadata.find(m=>/employ|type|commit|contract/i.test(m.name||""))||{}).value,
    ...(Array.isArray(raw.custom_fields)?raw.custom_fields.filter(f=>/employ|type|commit|contract/i.test(f.name||f.title||"")).map(f=>f.value):[]),
    raw.custom_fields&&raw.custom_fields.employment_type,
  ];
  for(const cand of typeCandidates){ const t=mapType(cand); if(t){ jobType=t; break; } }

  // Title/location keyword fallback — catches types the ATS didn't put in a
  // field. We check title + location (reliable), and only scan the body for the
  // less ambiguous terms to avoid false hits like "employment contract" in a
  // full-time posting.
  const titleLoc=(title+" "+loc);
  if(/\bintern(ship)?\b|\bco-?op\b|\bapprentice/i.test(title)) jobType="Internship";
  else if(/\bpart[- ]?time\b/i.test(titleLoc)) jobType="Part-time";
  else if(/\b(contract|contractor|freelance|fixed[- ]term|contract[- ]to[- ]hire)\b/i.test(titleLoc)) jobType="Contract";
  else if(/\b(temporary|seasonal)\b/i.test(titleLoc)) jobType="Temporary";
  // Hybrid detection from location/workplace info.
  if(/\bhybrid\b/i.test(loc)||/\bhybrid\b/i.test(body.slice(0,300))) isHybrid=true;
  // try to find a salary range in the body if not provided
  if(salary==="Salary not listed"){
    const sm=body.match(/\$(\d[\d,]+)\s*[-\u2013]+\s*\$(\d[\d,]+)/);
    if(sm) salary=`$${parseInt(sm[1].replace(/,/g,"")).toLocaleString()} \u2013 $${parseInt(sm[2].replace(/,/g,"")).toLocaleString()}`;
  }
  const parsed=parseJobSections(rawHtml,body);
  return {
    id:`ats-${platform}-${company.name}-${raw.id||raw.shortcode||raw.uuid||title.replace(/\s+/g,"")}`,
    title, company:company.name, url, applyUrl:url, state:stateKey,
    posted:new Date(updated), postedStr:new Date(updated).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),
    daysAgo, isNew:daysAgo<3, isRemote, isHybrid, type:jobType, salary, email:company.email,
    experience:guessExp(title), isVolunteer:false, isLive:true,
    summary:(parsed.summary||body.slice(0,240)).trim()+((parsed.summary||body).length>240?"\u2026":""),
    fullDescription:body.slice(0,2000),
    responsibilities:parsed.responsibilities, requirements:parsed.requirements, location:loc, locationLabel:locationLabel(loc),
  };
}