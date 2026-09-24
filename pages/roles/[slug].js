// /roles/[slug] — all open roles of one type across studios, with a salary
// snapshot. Server-rendered, crawlable; ranks for "<role> jobs" searches.
import Head from "next/head";
import { getRolePageData, roleSlug } from "../../lib/salary";
import { jobSlug } from "../../lib/snapshot";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://mainquestjobs.com";
const fmt = n => "$" + Math.round(n / 1000) + "k";

export async function getServerSideProps({ params }) {
  const data = await getRolePageData(params.slug);
  if (!data || !data.jobs.length) return { notFound: true };
  // lighten payload: only fields the page needs
  const jobs = data.jobs.map(j => ({ title: j.title, company: j.company, location: j.location || "", isRemote: !!j.isRemote, type: j.type || "", slug: jobSlug(j) }));
  return { props: { role: data.role, slug: params.slug, jobs, salary: data.salary } };
}

export default function RolePage({ role, slug, jobs, salary }) {
  const title = `${role} Jobs — Game Industry Careers | Main Quest`;
  const desc = `${jobs.length} open ${role} ${jobs.length === 1 ? "role" : "roles"} in the game industry${salary ? `, median ${fmt(salary.median)}` : ""}. Browse and apply on Main Quest.`;
  const ld = {
    "@context": "https://schema.org/",
    "@type": "ItemList",
    itemListElement: jobs.slice(0, 100).map((j, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}/jobs/${j.slug}`, name: `${j.title} at ${j.company}` })),
  };
  return (
    <Shell title={title} desc={desc} canonical={`${SITE}/roles/${slug}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "8px 20px 60px" }}>
        <a href="/" style={{ fontSize: 12.5, color: "rgba(201,168,76,.7)", textDecoration: "none", fontFamily: "'Cinzel',serif" }}>&larr; All roles</a>
        <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 28, fontWeight: 800, color: "#f0d080", margin: "12px 0 6px", lineHeight: 1.2 }}>{role} Jobs</h1>
        <div style={{ fontSize: 14, color: "rgba(244,237,216,.55)", marginBottom: 16 }}>{jobs.length} open {jobs.length === 1 ? "role" : "roles"} across game studios</div>

        {salary && (
          <a href={`/salaries/${slug}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "14px 18px", background: "linear-gradient(160deg,rgba(201,168,76,.1),rgba(232,97,58,.05))", border: "1px solid rgba(201,168,76,.25)", borderRadius: 12, marginBottom: 22 }}>
            <div>
              <div style={{ fontSize: 12, color: "rgba(244,237,216,.5)", textTransform: "uppercase", letterSpacing: .8, fontFamily: "'Cinzel',serif" }}>Median salary</div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 24, fontWeight: 800, color: "#f0d080" }}>{fmt(salary.median)}</div>
            </div>
            <div style={{ fontSize: 12, color: "rgba(201,168,76,.75)", textAlign: "right", fontFamily: "'Cinzel',serif" }}>{fmt(salary.p25)}–{fmt(salary.p75)}<br />See full breakdown &rarr;</div>
          </a>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {jobs.map((j, i) => (
            <a key={i} href={`/jobs/${j.slug}`} style={{ textDecoration: "none", display: "block", padding: "13px 16px", background: "rgba(201,168,76,.04)", border: "1px solid rgba(201,168,76,.12)", borderRadius: 10 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: "#f4edd8" }}>{j.title}</div>
              <div style={{ fontSize: 11.5, color: "rgba(244,237,216,.45)", marginTop: 3 }}>{[j.company, j.isRemote ? "Remote" : j.location].filter(Boolean).join(" · ")}</div>
            </a>
          ))}
        </div>

        <div style={{ marginTop: 30, paddingTop: 20, borderTop: "1px solid rgba(201,168,76,.14)", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "rgba(244,237,216,.55)", marginBottom: 14 }}>Get alerted when new {role} roles are posted — set an alert on Main Quest.</p>
          <a href="/" style={btn}>Set a {role} alert &rarr;</a>
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
