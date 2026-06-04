import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  const { url, company } = req.query;
  
  if (!url) return res.status(400).json({ error: 'URL required' });
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MainQuestBot/1.0)'
      }
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract job listings - this varies by site structure
    // We look for common patterns across career pages
    const jobs = [];
    
    // Pattern 1: elements with "job" in their class
    $('[class*="job"],[class*="position"],[class*="opening"]').each((i, el) => {
      const title = $(el).find('h2,h3,h4,[class*="title"]').first().text().trim();
      const link = $(el).find('a').first().attr('href');
      if (title && title.length > 3 && title.length < 100) {
        jobs.push({
          title,
          url: link?.startsWith('http') ? link : `${new URL(url).origin}${link}`,
          company,
          isLive: true,
        });
      }
    });
    
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json({ jobs: jobs.slice(0, 20) }); // cap at 20
    
  } catch (error) {
    res.status(500).json({ error: error.message, jobs: [] });
  }
}