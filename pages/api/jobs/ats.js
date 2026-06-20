// pages/api/jobs/ats.js
// Universal ATS proxy — fetches jobs from any of 6 public hiring platforms.
// All are public JSON endpoints: no API key, no auth, no browser needed.
//
// Call it like: /api/jobs/ats?platform=greenhouse&slug=riotgames
// Returns: { jobs: [...], count: N, platform, slug }

export default async function handler(req, res) {
  const { platform, slug } = req.query;
  if (!platform || !slug) {
    return res.status(400).json({ error: 'platform and slug required', jobs: [] });
  }

  // Build the right URL for each ATS platform
  const endpoints = {
    greenhouse:      `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`,
    lever:           `https://api.lever.co/v0/postings/${slug}?mode=json`,
    ashby:           `https://api.ashbyhq.com/posting-api/job-board/${slug}?includeCompensation=true`,
    workable:        `https://apply.workable.com/api/v3/accounts/${slug}/jobs`,
    smartrecruiters: `https://api.smartrecruiters.com/v1/companies/${slug}/postings?limit=100`,
    recruitee:       `https://${slug}.recruitee.com/api/offers/`,
  };

  const url = endpoints[platform];
  if (!url) {
    return res.status(400).json({ error: `Unknown platform: ${platform}`, jobs: [] });
  }

  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'MainQuest/1.0 (job board aggregator)',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!r.ok) {
      // 404 usually means the slug is wrong / studio not on this platform
      return res.status(200).json({ jobs: [], count: 0, platform, slug, note: `ATS returned ${r.status}` });
    }

    const data = await r.json();
    const jobs = extractJobs(data, platform);

    // Cache for 1 hour — career data doesn't change that fast
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=1800');
    res.status(200).json({ jobs, count: jobs.length, platform, slug });

  } catch (err) {
    console.error(`ATS error [${platform}/${slug}]:`, err.message);
    res.status(200).json({ jobs: [], count: 0, error: err.message });
  }
}

// Each platform nests its job array differently — pull them into a flat list.
function extractJobs(data, platform) {
  switch (platform) {
    case 'greenhouse':
      return data.jobs || [];
    case 'lever':
      return Array.isArray(data) ? data : [];
    case 'ashby':
      return data.jobs || [];
    case 'workable':
      return data.results || [];
    case 'smartrecruiters':
      return data.content || [];
    case 'recruitee':
      return data.offers || [];
    default:
      return [];
  }
}