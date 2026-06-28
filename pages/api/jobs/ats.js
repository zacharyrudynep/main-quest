// pages/api/jobs/ats.js
// Universal ATS proxy — fetches jobs from public hiring-platform APIs.
// For each platform it tries one or more known public endpoint variants and
// uses whichever returns usable data. No API key or auth for the public feeds.
//
// Call it like: /api/jobs/ats?platform=greenhouse&slug=riotgames
// Returns: { jobs: [...], count: N, platform, slug, used }

export default async function handler(req, res) {
  const { platform, slug, debug } = req.query;
  if (!platform || !slug) {
    return res.status(400).json({ error: 'platform and slug required', jobs: [] });
  }

  // Ordered list of endpoint variants to try per platform.
  // Each variant: { url, method?, body?, pick } where pick(data) -> jobs array.
  const variants = buildVariants(platform, slug);
  if (!variants) {
    return res.status(400).json({ error: `Unknown platform: ${platform}`, jobs: [] });
  }

  const headers = {
    'User-Agent': 'Mozilla/5.0 (compatible; MainQuest/1.0; +https://main-quest-beta.vercel.app)',
    'Accept': 'application/json, text/plain, */*',
  };

  const attempts = [];
  // Track whether any endpoint confirmed the slug is real (HTTP 200 with a valid
  // response shape), even if it currently has zero open postings.
  let slugValid = false;
  let validVia = null;
  for (const v of variants) {
    try {
      const opts = { method: v.method || 'GET', headers: { ...headers }, signal: AbortSignal.timeout(12000) };
      if (v.body) { opts.body = JSON.stringify(v.body); opts.headers['Content-Type'] = 'application/json'; }
      const r = await fetch(v.url, opts);
      const status = r.status;
      const ct = r.headers.get('content-type') || '';
      let raw;
      if (ct.includes('application/json')) {
        raw = await r.json();
      } else {
        const txt = await r.text();
        try { raw = JSON.parse(txt); } catch { raw = { __html: txt }; }
      }
      const jobs = r.ok ? (v.pick(raw) || []) : [];
      // A 2xx response that produced a parseable jobs array (even empty) means
      // the board/slug exists. v.pick returning a real array (not null) on an OK
      // response is our signal the slug resolved.
      const picked = r.ok ? v.pick(raw) : null;
      const isValidShape = r.ok && Array.isArray(picked);
      if (isValidShape && !slugValid) { slugValid = true; validVia = v.url; }
      attempts.push({ url: v.url, status, found: jobs.length, validShape: isValidShape });
      if (jobs.length > 0) {
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=1800');
        return res.status(200).json({ jobs, count: jobs.length, platform, slug, used: v.url, slugValid: true, ...(debug ? { attempts } : {}) });
      }
    } catch (err) {
      attempts.push({ url: v.url, error: err.message.slice(0, 80) });
    }
  }

  // No jobs returned. Report whether the slug itself is valid (exists but empty)
  // versus not found at all, so the verifier can tell the difference.
  return res.status(200).json({
    jobs: [],
    count: 0,
    platform,
    slug,
    slugValid,
    ...(slugValid ? { used: validVia, note: 'Slug is valid — board exists but has no open postings right now.' } : { note: 'Slug did not resolve to a valid job board.' }),
    attempts,
  });
}

function buildVariants(platform, slug) {
  switch (platform) {
    case 'greenhouse':
      return [
        { url: `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`, pick: d => d.jobs || [] },
        { url: `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`, pick: d => d.jobs || [] },
      ];
    case 'lever':
      return [
        { url: `https://api.lever.co/v0/postings/${slug}?mode=json`, pick: d => Array.isArray(d) ? d : [] },
      ];
    case 'ashby':
      return [
        // Public REST posting API — returns all jobs in one call, no pagination.
        // includeCompensation=true adds salary data. We filter out unlisted/draft jobs
        // (isListed===false) and attach any board-level compensation to each job so the
        // normalizer can read it per-job.
        { url: `https://api.ashbyhq.com/posting-api/job-board/${slug}?includeCompensation=true`,
          pick: d => {
            const jobs = (d.jobs || []).filter(j => j.isListed !== false);
            // If compensation came back at the top level (board-wide), expose it on each
            // job under _boardCompensation as a fallback for the normalizer.
            if (d.compensation) {
              for (const j of jobs) { if (!j.compensation) j._boardCompensation = d.compensation; }
            }
            return jobs;
          } },
      ];
    case 'workable':
      return [
        // Public account widget API
        { url: `https://${slug}.workable.com/spi/v3/jobs`, pick: d => d.jobs || d.results || [] },
        { url: `https://www.workable.com/api/accounts/${slug}?details=true`, pick: d => d.jobs || d.results || [] },
        { url: `https://apply.workable.com/api/v1/widget/accounts/${slug}?details=true`, pick: d => d.jobs || [] },
      ];
    case 'smartrecruiters':
      return [
        { url: `https://api.smartrecruiters.com/v1/companies/${slug}/postings?limit=100`, pick: d => d.content || [] },
      ];
    case 'recruitee':
      return [
        { url: `https://${slug}.recruitee.com/api/offers/`, pick: d => d.offers || [] },
      ];
    case 'applytojob':
      return [
        { url: `https://${slug}.applytojob.com/api/v1/jobs`, pick: d => d.jobs || (Array.isArray(d) ? d : []) },
      ];
    case 'bamboohr':
      return [
        { url: `https://${slug}.bamboohr.com/careers/list`, pick: d => d.result || d.jobs || [] },
        { url: `https://${slug}.bamboohr.com/jobs/embed2.php?version=1.0.0`, pick: d => extractBamboo(d) },
      ];
    case 'jobvite':
      return [
        { url: `https://jobs.jobvite.com/api/v2/company/${slug}/jobs`, pick: d => d.requisitions || d.jobs || [] },
        { url: `https://app.jobvite.com/CompanyJobs/Careers.aspx?c=${slug}&mode=json`, pick: d => d.jobs || [] },
      ];
    case 'paylocity':
      return [
        { url: `https://recruiting.paylocity.com/recruiting/v2/api/jobs/${slug}`, pick: d => d.jobs || d.Jobs || (Array.isArray(d) ? d : []) },
      ];
    case 'personio':
      // Personio exposes a public XML feed per company. Some accounts are .de, some .com.
      return [
        { url: `https://${slug}.jobs.personio.de/xml?language=en`, pick: d => extractPersonio(d) },
        { url: `https://${slug}.jobs.personio.com/xml?language=en`, pick: d => extractPersonio(d) },
      ];
    default:
      return null;
  }
}

// Parse Personio's XML job feed into an array of plain job objects.
// The feed wraps each posting in a <position> element with child tags like
// <name>, <office>, <department>, <employmentType>, <jobDescriptions>, etc.
function extractPersonio(d) {
  const xml = (d && d.__html) ? d.__html : (typeof d === 'string' ? d : '');
  if (!xml || !/<position[ >]/i.test(xml)) return [];
  const jobs = [];
  const blocks = xml.match(/<position[\s\S]*?<\/position>/gi) || [];
  const tag = (block, name) => {
    const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'));
    if (!m) return '';
    return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
  };
  for (const b of blocks) {
    // Concatenate all <jobDescription><value> blocks into one description.
    const descParts = (b.match(/<value>[\s\S]*?<\/value>/gi) || [])
      .map(v => v.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<\/?value>/gi, '').trim());
    jobs.push({
      id: tag(b, 'id'),
      name: tag(b, 'name'),
      office: tag(b, 'office'),
      department: tag(b, 'department'),
      employmentType: tag(b, 'employmentType'),
      schedule: tag(b, 'schedule'),
      seniority: tag(b, 'seniority'),
      yearsOfExperience: tag(b, 'yearsOfExperience'),
      occupation: tag(b, 'occupationCategory') || tag(b, 'occupation'),
      createdAt: tag(b, 'createdAt'),
      description: descParts.join('\n\n'),
      jobUrl: tag(b, 'url'),
    });
  }
  return jobs;
}

function extractBamboo(d) {
  if (d && d.__html) {
    const m = d.__html.match(/"result"\s*:\s*(\[[\s\S]*?\])\s*[,}]/);
    if (m) { try { return JSON.parse(m[1]); } catch { return []; } }
  }
  return d.result || [];
}