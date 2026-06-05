// pages/api/jobs/scrape.js
// Scrapes career pages for job listings.
// Uses Browserless (full JS rendering) if BROWSERLESS_TOKEN is set.
// Falls back to direct fetch for simple static pages if no token.
// Get a free Browserless token at browserless.io

export default async function handler(req, res) {
  const { url, company } = req.query;
  if (!url || !company) {
    return res.status(400).json({ error: 'url and company required', jobs: [] });
  }

  try {
    let html = '';
    const token = process.env.BROWSERLESS_TOKEN;

    if (token) {
      // Full JS rendering via Browserless
      const blRes = await fetch(
        `https://chrome.browserless.io/content?token=${token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url,
            waitFor: 3000,
            rejectResourceTypes: ['image', 'font', 'media'],
            gotoOptions: { waitUntil: 'networkidle2', timeout: 15000 },
          }),
          signal: AbortSignal.timeout(20000),
        }
      );
      if (blRes.ok) {
        html = await blRes.text();
      }
    }

    // Fallback: direct fetch (works for static pages, not JS-rendered ones)
    if (!html) {
      const directRes = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MainQuestBot/1.0)' },
        signal: AbortSignal.timeout(10000),
      });
      if (directRes.ok) html = await directRes.text();
    }

    if (!html) {
      return res.status(200).json({ jobs: [], source: 'failed', note: 'Could not fetch page' });
    }

    const jobs = extractJobs(html, company, url);
    res.setHeader('Cache-Control', 's-maxage=7200, stale-while-revalidate=3600');
    res.status(200).json({ jobs, count: jobs.length, source: token ? 'browserless' : 'direct' });

  } catch (err) {
    console.error(`Scrape error [${company}]:`, err.message);
    res.status(200).json({ jobs: [], error: err.message });
  }
}

function extractJobs(html, company, baseUrl) {
  const jobs = [];
  const seen = new Set();

  // Clean noise
  const clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '');

  let origin = '';
  try { origin = new URL(baseUrl).origin; } catch {}

  // Extract all anchor tags
  const linkRe = /<a[^>]+href="([^"#][^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = linkRe.exec(clean)) !== null) {
    const rawHref = (match[1] || '').trim();
    const rawText = (match[2] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    if (!rawHref || !rawText || rawText.length < 4 || rawText.length > 150) continue;

    const key = rawText.toLowerCase();
    if (seen.has(key)) continue;

    // Must look like a job title
    if (!/engineer|design(er)?|artist|programmer|producer|manager|director|analyst|developer|coordinator|lead|senior|junior|intern|qa|tester|writer|animator|ui|ux|technical|creative|marketing|community|scientist|researcher|strategist|specialist|architect|generalist|support|recruiter|server|client|gameplay|narrative|audio|sound|environment|character|concept|visual|principal|associate|content|product|project|data|operations/i.test(rawText)) continue;

    // Skip nav/utility links
    if (/^(home|about|contact|privacy|terms|login|sign in|sign up|apply here|view all|see all|learn more|read more|back|next|previous|menu|search|jobs|careers|openings|positions|opportunities|work with us|join us|our team|cookie|accept)$/i.test(rawText.trim())) continue;

    // Build absolute URL
    let fullUrl = rawHref;
    if (rawHref.startsWith('//')) fullUrl = 'https:' + rawHref;
    else if (rawHref.startsWith('/')) fullUrl = origin + rawHref;
    else if (!rawHref.startsWith('http')) continue;

    seen.add(key);
    jobs.push({
      title: rawText,
      url: fullUrl,
      applyUrl: fullUrl,
      isLive: true,
      isScraped: true,
      salary: 'See posting',
      type: /intern(ship)?|co-op|part.time|contract|freelance/i.test(rawText) ? 'Contract' : 'Full-time',
      isRemote: /remote/i.test(rawText),
      experience: guessExp(rawText),
      summary: `Live posting scraped from ${company}. Click "View Careers" for the full description.`,
      responsibilities: [],
      requirements: [],
    });

    if (jobs.length >= 30) break;
  }

  return jobs;
}

function guessExp(t) {
  t = t.toLowerCase();
  if (/\b(director|head of|vp|vice president)\b/.test(t)) return 'Director';
  if (/\bprincipal\b/.test(t)) return 'Principal';
  if (/\blead\b/.test(t)) return 'Lead';
  if (/\b(senior|sr\.)\b/.test(t)) return 'Senior';
  if (/\b(junior|jr\.|intern(ship)?|entry)\b/.test(t)) return 'Entry Level';
  if (/\bstaff\b/.test(t)) return 'Senior';
  return 'Mid Level';
}