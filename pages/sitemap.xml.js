// /sitemap.xml — lists the home page + every open job page so Google discovers
// and crawls them. Regenerated per request from the cached snapshot (cheap, since
// the snapshot itself is cached in memory), lightly HTTP-cached for an hour.
import { allJobEntries } from "../lib/snapshot";
import { getSalaryStats, roleSlug } from "../lib/salary";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://mainquestjobs.com";

function xmlEsc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]));
}

export async function getServerSideProps({ res }) {
  let jobs = [];
  try { jobs = await allJobEntries(); } catch (e) { jobs = []; }
  let salary = [];
  try {
    const stats = await getSalaryStats();
    salary = [
      { loc: `${SITE}/salaries`, changefreq: "weekly", priority: "0.8" },
      ...Object.keys(stats.roles).map(r => ({ loc: `${SITE}/salaries/${roleSlug(r)}`, changefreq: "weekly", priority: "0.7" })),
    ];
  } catch (e) { salary = []; }
  const urls = [
    { loc: `${SITE}/`, changefreq: "hourly", priority: "1.0" },
    ...salary,
    ...jobs.map(j => ({ loc: `${SITE}/jobs/${j.slug}`, changefreq: "daily", priority: "0.7" })),
  ];
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(u => `  <url><loc>${xmlEsc(u.loc)}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join("\n") +
    `\n</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.write(xml);
  res.end();
  return { props: {} };
}

export default function SiteMap() { return null; }
