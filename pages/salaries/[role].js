// /salaries/[role] — full salary breakdown for one role (overall + by level +
// by region), server-rendered and crawlable. Ranks for "<role> salary" searches.
import Head from "next/head";
import { getSalaryStats, roleSlug } from "../../lib/salary";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://mainquestjobs.com";
const fmt = n => "$" + Math.round(n / 1000) + "k";

export async function getServerSideProps({ params }) {
  let stats = { roles: {} };
  try { stats = await getSalaryStats(); } catch (e) {}
  let role = null, data = null;
  for (const [r, s] of Object.entries(stats.roles)) {
    if (roleSlug(r) === params.role) { role = r; data = s; break; }
  }
  if (!role) return { notFound: true };
  return { props: { role, data } };
}

function StatRow({ label, s }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "12px 14px", background: "rgba(201,168,76,.04)", border: "1px solid rgba(201,168,76,.1)", borderRadius: 10 }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#f4edd8" }}>{label}</div>
        <div style={{ fontSize: 11, color: "rgba(244,237,216,.4)", marginTop: 2 }}>{s.count} postings</div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 16, fontWeight: 800, color: "#f0d080" }}>{fmt(s.median)}</div>
        <div style={{ fontSize: 11, color: "rgba(244,237,216,.45)" }}>{fmt(s.p25)}–{fmt(s.p75)}</div>
      </div>
    </div>
  );
}

export default function RoleSalary({ role, data }) {
  const title = `${role} Salary — Game Industry Pay | Main Quest`;
  const desc = `${role} salaries in the game industry: median ${fmt(data.all.median)} (${fmt(data.all.p25)}–${fmt(data.all.p75)}), from ${data.all.count} live postings. Breakdown by seniority and region.`;
  const levelOrder = ["Junior / Entry", "Mid", "Senior", "Lead / Manager", "Principal / Director"];
  const levels = Object.entries(data.byLevel).sort((a, b) => levelOrder.indexOf(a[0]) - levelOrder.indexOf(b[0]));
  const regions = Object.entries(data.byRegion).sort((a, b) => b[1].count - a[1].count);

  const ld = {
    "@context": "https://schema.org/", "@type": "Dataset",
    name: `${role} salaries in the game industry`,
    description: desc,
    creator: { "@type": "Organization", name: "Main Quest" },
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`${SITE}/salaries/${roleSlug(role)}`} />
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      </Head>
      <div style={{ minHeight: "100vh", background: "radial-gradient(1100px 620px at 50% -12%, rgba(139,32,32,.16), transparent), #080608", color: "#f4edd8", fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif" }}>
        <header style={{ maxWidth: 720, margin: "0 auto", padding: "18px 20px" }}>
          <a href="/" style={{ fontFamily: "Georgia,serif", fontSize: 20, fontWeight: "bold", letterSpacing: 2, color: "#f0d080", textDecoration: "none" }}>MAIN QUEST</a>
        </header>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "8px 20px 60px" }}>
          <a href="/salaries" style={{ fontSize: 12.5, color: "rgba(201,168,76,.7)", textDecoration: "none", fontFamily: "'Cinzel',serif" }}>&larr; All salaries</a>
          <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 27, fontWeight: 800, color: "#f0d080", margin: "12px 0 14px", lineHeight: 1.2 }}>{role} Salary</h1>

          <div style={{ background: "linear-gradient(160deg,rgba(201,168,76,.1),rgba(232,97,58,.06))", border: "1px solid rgba(201,168,76,.25)", borderRadius: 14, padding: "20px 22px", marginBottom: 24, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "rgba(244,237,216,.5)", textTransform: "uppercase", letterSpacing: 1, fontFamily: "'Cinzel',serif" }}>Median</div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 40, fontWeight: 800, color: "#f0d080", lineHeight: 1.1, margin: "4px 0" }}>{fmt(data.all.median)}</div>
            <div style={{ fontSize: 14, color: "rgba(244,237,216,.6)" }}>Typical range {fmt(data.all.p25)}–{fmt(data.all.p75)} · {data.all.count} postings</div>
          </div>

          {levels.length > 0 && <>
            <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 15, color: "#c9a84c", margin: "0 0 10px" }}>By seniority</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 24 }}>{levels.map(([lv, s]) => <StatRow key={lv} label={lv} s={s} />)}</div>
          </>}

          {regions.length > 0 && <>
            <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 15, color: "#c9a84c", margin: "0 0 10px" }}>By region</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 24 }}>{regions.map(([rg, s]) => <StatRow key={rg} label={rg} s={s} />)}</div>
          </>}

          <p style={{ fontSize: 11.5, color: "rgba(244,237,216,.38)", lineHeight: 1.55, marginBottom: 24 }}>
            Figures are medians of disclosed base-salary ranges (USD) from live {role} postings on Main Quest, using each posting's range midpoint. Only buckets with enough postings are shown. Salaries not disclosed by the employer are excluded.
          </p>

          <div style={{ textAlign: "center", paddingTop: 6 }}>
            <a href="/" style={btn}>See open {role} roles &rarr;</a>
          </div>
        </div>
      </div>
    </>
  );
}

const btn = { background: "linear-gradient(135deg,#c9a84c,#e8613a)", color: "#0a0608", textDecoration: "none", padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 800, fontFamily: "'Cinzel',serif", display: "inline-block" };
