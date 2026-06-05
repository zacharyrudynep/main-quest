// pages/api/jobs/scrape.js
// Scrapes a career page via Browserless (full JS rendering) and extracts job listings.
// Get a free token at browserless.io — add BROWSERLESS_TOKEN to Vercel env vars.

export default async function handler(req, res) {
  const { url, company } = req.query;

  if (!url || !company) {
    return res.status(400).json({ error: 'url and company are required', jobs: [] });
  }

  const token = process.env.BROWSERLESS_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'Missing BROWSERLESS_TOKEN env var', jobs: [] });
  }

  try {
    // Ask Browserless to fully render the page (runs real Chrome)
    const response = await fetch(
      `https://chrome.browserless.io/content?token=${token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          waitFor: 3000,                                    // wait 3s for JS to render jobs
          rejectResourceTypes: ['image', 'font', 'media'],  // skip heavy assets, faster
          gotoOptions: { waitUntil: 'networkidle2' },       // wait for XHR calls to finish
        }),
        signal: AbortSignal.timeout(20000), // 20s timeout
      }
    );

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return res.status(response.status).json({
        error: `Browserless error ${response.status}: ${errText.slice(0, 200)}`,
        jobs: [],
      });
    }

    const html = await response.text();
    const jobs = extractJobs(html, company, url);

    // Cache 2 hours — career pages don't update that fast
    res.setHeader('Cache-Control', 's-maxage=7200, stale-while-revalidate=3600');
    res.status(200).json({ jobs, count: jobs.length, source: 'browserless' });

  } catch (err) {
    console.error(`Scrape error for ${company}:`, err.message);
    res.status(500).json({ error: err.message, jobs: [] });
  }
}

// ── JOB EXTRACTION ────────────────────────────────────────────────────────────
// Heuristic link extractor — finds links that look like individual job postings.
// Works on the majority of career pages; may need tuning for unusual layouts.

function extractJobs(html, company, baseUrl) {
  const jobs = [];
  const seen = new Set();

  // Remove scripts, styles, nav, footer — they add noise
  const clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '');

  // Extract all anchor tags
  const linkRe = /<a[^>]+href="([^"#][^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = linkRe.exec(clean)) !== null) {
    const rawHref = match[1]?.trim();
    const rawInner = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    if (!rawHref || !rawInner) continue;
    if (rawInner.length < 4 || rawInner.length > 120) continue;

    const key = rawInner.toLowerCase();
    if (seen.has(key)) continue;

    // Must look like a job title
    const isJobTitle = /engineer|design(er)?|artist|programmer|producer|manager|director|analyst|developer|coordinator|lead|senior|junior|intern|qa|tester|writer|animator|ui|ux|technical|creative|marketing|community|scientist|researcher|strategist|specialist|architect|generalist|support|recruiter|finance|hr |legal|operations|server|client|gameplay|narrative|audio|sound|environment|character|concept|visual|principal|associate|staff|content|brand|data|machine learning|product|project/i.test(rawInner);

    if (!isJobTitle) continue;

    // Skip obvious nav/utility links
    const isNav = /^(home|about|contact|privacy|terms|login|sign in|sign up|apply here|view all|see all|learn more|read more|back|next|previous|menu|search|filter|sort|load more|show more|careers|jobs|openings|positions|opportunities|work with us|join us|our team)$/i.test(rawInner.trim());
    if (isNav) continue;

    // Build absolute URL
    let fullUrl = rawHref;
    if (rawHref.startsWith('//')) {
      fullUrl = 'https:' + rawHref;
    } else if (rawHref.startsWith('/')) {
      try {
        const base = new URL(baseUrl);
        fullUrl = `${base.origin}${rawHref}`;
      } catch { continue; }
    } else if (!rawHref.startsWith('http')) {
      continue; // skip relative paths like "jobs/123" without leading slash
    }

    seen.add(key);
    jobs.push({
      title: rawInner,
      url: fullUrl,
      applyUrl: fullUrl,
      isLive: true,
      isScraped: true,
      salary: 'See posting',
      type: guessType(rawInner),
      isRemote: /remote/i.test(rawInner),
      experience: guessExp(rawInner),
      summary: `Live posting from ${company}. Click "View Careers" to see full description and apply.`,
      responsibilities: [],
      requirements: [],
    });

    if (jobs.length >= 30) break; // cap at 30 per company
  }

  return jobs;
}

function guessExp(title) {
  const t = title.toLowerCase();
  if (/\b(director|head of|vp|vice president)\b/.test(t)) return 'Director';
  if (/\bprincipal\b/.test(t)) return 'Principal';
  if (/\blead\b/.test(t)) return 'Lead';
  if (/\b(senior|sr\.)\b/.test(t)) return 'Senior';
  if (/\b(junior|jr\.|intern(ship)?|entry)\b/.test(t)) return 'Entry Level';
  if (/\bstaff\b/.test(t)) return 'Senior';
  if (/\bassociate\b/.test(t)) return 'Mid Level';
  return 'Mid Level';
}

function guessType(title) {
  if (/\b(intern(ship)?|co-op|coop)\b/i.test(title)) return 'Internship';
  if (/\b(contract|freelance|temporary|part.time)\b/i.test(title)) return 'Contract';
  return 'Full-time';
}