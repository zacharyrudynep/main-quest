// /salaries — game-industry salary overview. Server-rendered from the live
// snapshot so it's crawlable; links to a per-role page for each role.
import Head from "next/head";
import { getSalaryStats, roleSlug } from "../../lib/salary";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://mainquestjobs.com";
const fmt = n => "$" + Math.round(n / 1000) + "k";

export async function getServerSideProps() {
  let stats = { roles: {}, sampleSize: 0 };
  try { stats = await getSalaryStats(); } catch (e) {}
  const rows = Object.entries(stats.roles)
    .map(([role, s]) => ({ role, slug: roleSlug(role), median: s.all.median, p25: s.all.p25, p75: s.all.p75, count: s.all.count }))
    .sort((a, b) => b.count - a.count);
  return { props: { rows, sampleSize: stats.sampleSize } };
}

export default function Salaries({ rows, sampleSize }) {
  const title = "Game Industry Salaries — Real Data | Main Quest";
  const desc = `Median salaries for ${rows.length} game-industry roles, from ${sampleSize.toLocaleString()} live job postings with disclosed pay. Programmer, designer, artist, producer and QA compensation.`;
  return (
    <Shell title={title} desc={desc} canonical={`${SITE}/salaries`}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "8px 20px 60px" }}>
        <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 28, fontWeight: 800, color: "#f0d080", margin: "10px 0 8px" }}>Game Industry Salaries</h1>
        <p style={{ color: "rgba(244,237,216,.6)", fontSize: 14, lineHeight: 1.6, marginBottom: 6 }}>
          Median annual pay by role, computed from <strong style={{ color: "#d8ceb4" }}>{sampleSize.toLocaleString()}</strong> live postings that disclose salary (USD). Updated continuously as new roles are posted.
        </p>
        <p style={{ color: "rgba(244,237,216,.4)", fontSize: 12, marginBottom: 24 }}>Range shown is the 25th–75th percentile. Click a role for a full breakdown by level and region.</p>

        {rows.length === 0 ? (
          <p style={{ color: "rgba(244,237,216,.5)" }}>Not enough disclosed-salary data yet — check back soon.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map(r => (
              <a key={r.slug} href={`/salaries/${r.slug}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "14px 16px", background: "rgba(201,168,76,.04)", border: "1px solid rgba(201,168,76,.12)", borderRadius: 11 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#f4edd8" }}>{r.role}</div>
                  <div style={{ fontSize: 11.5, color: "rgba(244,237,216,.4)", marginTop: 2 }}>{r.count} postings</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 18, fontWeight: 800, color: "#f0d080" }}>{fmt(r.median)}</div>
                  <div style={{ fontSize: 11.5, color: "rgba(244,237,216,.45)" }}>{fmt(r.p25)}–{fmt(r.p75)}</div>
                </div>
              </a>
            ))}
          </div>
        )}

        <div style={{ marginTop: 30, paddingTop: 20, borderTop: "1px solid rgba(201,168,76,.14)", textAlign: "center" }}>
          <a href="/" style={btn}>Browse open game-industry roles &rarr;</a>
        </div>
      </div>
    </Shell>
  );
}

export const btn = { background: "linear-gradient(135deg,#c9a84c,#e8613a)", color: "#0a0608", textDecoration: "none", padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 800, fontFamily: "'Cinzel',serif", display: "inline-block" };

export function Shell({ title, desc, canonical, children }) {
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
        {canonical && <meta property="og:url" content={canonical} />}
        <meta property="og:image" content={`${SITE}/og-default.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ minHeight: "100vh", background: "radial-gradient(1100px 620px at 50% -12%, rgba(139,32,32,.16), transparent), #080608", color: "#f4edd8", fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif" }}>
        <header style={{ maxWidth: 820, margin: "0 auto", padding: "18px 20px" }}>
          <a href="/" style={{ fontFamily: "Georgia,serif", fontSize: 20, fontWeight: "bold", letterSpacing: 2, color: "#f0d080", textDecoration: "none" }}>MAIN QUEST</a>
        </header>
        {children}
      </div>
    </>
  );
}
