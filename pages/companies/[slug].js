// /companies/[slug] — all open roles at one studio. Server-rendered, crawlable,
// ranks for "<studio> careers / jobs". Links each role to its /jobs page.
import Head from "next/head";
import { getCompanyJobs, jobSlug, companySlug } from "../../lib/snapshot";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://mainquestjobs.com";

export async function getServerSideProps({ params }) {
  const data = await getCompanyJobs(params.slug);
  if (!data || !data.jobs.length) return { notFound: true };
  return { props: { company: data.company, jobs: data.jobs } };
}

export default function CompanyPage({ company, jobs }) {
  const locations = [...new Set(jobs.map(j => j.location).filter(Boolean))].slice(0, 4);
  const title = `Jobs at ${company} — Careers | Main Quest`;
  const desc = `${jobs.length} open ${jobs.length === 1 ? "role" : "roles"} at ${company}${locations.length ? " · " + locations.slice(0, 2).join(", ") : ""}. Browse and apply on Main Quest, the game-industry job board.`;
  const ld = {
    "@context": "https://schema.org/",
    "@type": "ItemList",
    itemListElement: jobs.slice(0, 100).map((j, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}/jobs/${jobSlug(j)}`, name: j.title })),
  };
  return (
    <Shell title={title} desc={desc} canonical={`${SITE}/companies/${companySlug(company)}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "8px 20px 60px" }}>
        <a href="/" style={{ fontSize: 12.5, color: "rgba(201,168,76,.7)", textDecoration: "none", fontFamily: "'Cinzel',serif" }}>&larr; All studios</a>
        <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 28, fontWeight: 800, color: "#f0d080", margin: "12px 0 6px", lineHeight: 1.2 }}>Jobs at {company}</h1>
        <div style={{ fontSize: 14, color: "rgba(244,237,216,.55)", marginBottom: 4 }}>{jobs.length} open {jobs.length === 1 ? "role" : "roles"}{locations.length ? " · " + locations.join(" · ") : ""}</div>
        <a href="/" style={{ ...btn, marginTop: 16, marginBottom: 26 }}>Follow {company} for alerts &rarr;</a>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {jobs.map((j, i) => (
            <a key={i} href={`/jobs/${jobSlug(j)}`} style={{ textDecoration: "none", display: "block", padding: "13px 16px", background: "rgba(201,168,76,.04)", border: "1px solid rgba(201,168,76,.12)", borderRadius: 10 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: "#f4edd8" }}>{j.title}</div>
              <div style={{ fontSize: 11.5, color: "rgba(244,237,216,.45)", marginTop: 3 }}>{[j.isRemote ? "Remote" : j.location, j.type].filter(Boolean).join(" · ")}</div>
            </a>
          ))}
        </div>

        <div style={{ marginTop: 30, paddingTop: 20, borderTop: "1px solid rgba(201,168,76,.14)", textAlign: "center" }}>
          <a href="/" style={btn}>Browse all game-industry roles &rarr;</a>
        </div>
      </div>
    </Shell>
  );
}

const btn = { background: "linear-gradient(135deg,#c9a84c,#e8613a)", color: "#0a0608", textDecoration: "none", padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 800, fontFamily: "'Cinzel',serif", display: "inline-block" };

function Shell({ title, desc, canonical, children }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        {canonical && <link rel="canonical" href={canonical} />}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Main Quest" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:image" content={`${SITE}/og-default.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ minHeight: "100vh", background: "radial-gradient(1100px 620px at 50% -12%, rgba(139,32,32,.16), transparent), #080608", color: "#f4edd8", fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif" }}>
        <header style={{ maxWidth: 760, margin: "0 auto", padding: "18px 20px" }}>
          <a href="/" style={{ fontFamily: "Georgia,serif", fontSize: 20, fontWeight: "bold", letterSpacing: 2, color: "#f0d080", textDecoration: "none" }}>MAIN QUEST</a>
        </header>
        {children}
      </div>
    </>
  );
}