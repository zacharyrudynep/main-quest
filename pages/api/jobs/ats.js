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
      attempts.push({ url: v.url, status, found: jobs.length });
      if (jobs.length > 0) {
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=1800');
        return res.status(200).json({ jobs, count: jobs.length, platform, slug, used: v.url, ...(debug ? { attempts } : {}) });
      }
    } catch (err) {
      attempts.push({ url: v.url, error: err.message.slice(0, 80) });
    }
  }

  // Nothing returned jobs
  return res.status(200).json({ jobs: [], count: 0, platform, slug, attempts });
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
    default:
      return null;
  }
}

function extractBamboo(d) {
  if (d && d.__html) {
    const m = d.__html.match(/"result"\s*:\s*(\[[\s\S]*?\])\s*[,}]/);
    if (m) { try { return JSON.parse(m[1]); } catch { return []; } }
  }
  return d.result || [];
}