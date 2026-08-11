import Head from "next/head";
import { decodeJob } from "../../lib/shareJob";

export async function getServerSideProps({ params, req }) {
  const job = decodeJob(params.key);
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0];
  const host = req.headers.host || "main-quest-beta.vercel.app";
  const base = `${proto}://${host}`;
  return { props: { job, base, shareUrl: `${base}/j/${params.key}` } };
}

export default function SharedJob({ job, base, shareUrl }) {
  const title = job ? `${job.title} at ${job.company} — Main Quest` : "Job — Main Quest";
  const desc = job
    ? (job.summary || `${job.experience || ""} ${job.type || ""} role at ${job.company}${job.location ? " · " + job.location : ""}. Apply via Main Quest, the game-industry job board.`).trim()
    : "This shared role is no longer available.";
  const ogImage = `${base}/og-default.png`;
  const applyUrl = job && job.applyUrl;

  const chip = (t, c = {}) => (
    <span style={{ background: "rgba(201,168,76,.1)", border: "1px solid rgba(201,168,76,.22)", color: "rgba(244,237,216,.8)", borderRadius: 20, fontSize: 12, padding: "4px 12px", fontFamily: "'Cinzel',serif", ...c }}>{t}</span>
  );

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Main Quest" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={desc} />
        <meta name="twitter:image" content={ogImage} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Cinzel+Decorative:wght@700&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ minHeight: "100vh", background: "radial-gradient(1100px 620px at 50% -12%, rgba(139,32,32,.16), transparent), #080608", color: "#f4edd8", fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif" }}>
        {/* Header */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", maxWidth: 820, margin: "0 auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <span style={{ filter: "drop-shadow(0 0 14px rgba(201,168,76,.5))", display: "flex" }}><SwordShield s={26} /></span>
            <span style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 18, fontWeight: 700, background: "linear-gradient(135deg,#c9a84c,#e8613a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Main Quest</span>
          </a>
          <div style={{ display: "flex", gap: 8 }}>
            <a href="/" style={{ textDecoration: "none", background: "rgba(201,168,76,.08)", border: "1px solid rgba(201,168,76,.25)", color: "#f0d080", borderRadius: 9, padding: "8px 16px", fontSize: 12, fontFamily: "'Cinzel',serif", fontWeight: 600 }}>Sign In</a>
            <a href="/join" style={{ textDecoration: "none", background: "linear-gradient(135deg,#c9a84c,#f0d080)", color: "#0a0608", borderRadius: 9, padding: "8px 18px", fontSize: 12, fontFamily: "'Cinzel',serif", fontWeight: 800 }}>Join</a>
          </div>
        </header>

        <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 60px" }}>
          {!job ? (
            <div style={{ textAlign: "center", padding: "70px 20px" }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 22, color: "#f0d080", marginBottom: 10 }}>This role isn't available</div>
              <p style={{ color: "rgba(244,237,216,.55)", lineHeight: 1.6, maxWidth: 420, margin: "0 auto 24px" }}>The shared link may be broken or the posting has closed. Explore thousands of current game-industry roles on Main Quest.</p>
              <a href="/" style={{ textDecoration: "none", background: "linear-gradient(135deg,#c9a84c,#f0d080)", color: "#0a0608", borderRadius: 10, padding: "12px 26px", fontSize: 13, fontFamily: "'Cinzel',serif", fontWeight: 800 }}>Browse Jobs →</a>
            </div>
          ) : (
            <>
              <div style={{ background: "rgba(16,10,22,.6)", border: "1px solid rgba(201,168,76,.22)", borderRadius: 16, padding: "26px 26px 28px", boxShadow: "0 24px 60px rgba(0,0,0,.5)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#c9a84c", fontFamily: "'Cinzel',serif", letterSpacing: .6, textTransform: "uppercase", marginBottom: 8 }}>{job.company}</div>
                <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(22px,4vw,30px)", fontWeight: 700, color: "#f4edd8", margin: "0 0 16px", lineHeight: 1.25 }}>{job.title}</h1>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 20 }}>
                  {job.location && chip(job.location)}
                  {job.type && chip(job.type)}
                  {job.experience && chip(job.experience)}
                  {job.isRemote && chip("Remote OK", { background: "rgba(126,207,179,.08)", border: "1px solid rgba(126,207,179,.2)", color: "#7ecfb3" })}
                  {job.isHybrid && chip("Hybrid", { background: "rgba(126,207,179,.08)", border: "1px solid rgba(126,207,179,.2)", color: "#7ecfb3" })}
                  {job.salary && job.salary !== "Salary not listed" && chip(job.salary, { background: "rgba(232,97,58,.08)", border: "1px solid rgba(232,97,58,.2)", color: "#e8b070" })}
                  {job.isVolunteer && chip("Volunteer", { background: "rgba(126,207,179,.12)", border: "1px solid rgba(126,207,179,.3)", color: "#7ecfb3" })}
                </div>
                {job.summary && <p style={{ fontSize: 15, color: "rgba(244,237,216,.7)", lineHeight: 1.65, margin: "0 0 24px" }}>{job.summary}</p>}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {applyUrl ? (
                    <a href={applyUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#c9a84c,#e8613a)", color: "#0a0608", borderRadius: 10, padding: "13px 30px", fontSize: 13, fontWeight: 800, fontFamily: "'Cinzel',serif", letterSpacing: .5 }}>View &amp; Apply →</a>
                  ) : (
                    <a href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,#c9a84c,#e8613a)", color: "#0a0608", borderRadius: 10, padding: "13px 30px", fontSize: 13, fontWeight: 800, fontFamily: "'Cinzel',serif", letterSpacing: .5 }}>Find on Main Quest →</a>
                  )}
                </div>
              </div>

              <div style={{ textAlign: "center", marginTop: 34, paddingTop: 26, borderTop: "1px solid rgba(201,168,76,.12)" }}>
                <p style={{ fontSize: 14, color: "rgba(244,237,216,.55)", margin: "0 0 16px", lineHeight: 1.6 }}>Main Quest aggregates game-studio jobs worldwide, with match scoring, job alerts, and application tools.</p>
                <a href="/" style={{ textDecoration: "none", color: "#f0d080", fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 13, letterSpacing: .5 }}>Explore all game industry jobs →</a>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}

function SwordShield({ s = 26, c = "#c9a84c" }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <g transform="rotate(34 12 11)"><path d="M12 2.2 L13.25 5.2 V12 H10.75 V5.2 Z" /><path d="M9.4 13.2 H14.6" /><path d="M12 13.2 V18" /><circle cx="12" cy="19.3" r="1.1" /></g>
      <g transform="rotate(-34 12 11)"><path d="M12 2.2 L13.25 5.2 V12 H10.75 V5.2 Z" /><path d="M9.4 13.2 H14.6" /><path d="M12 13.2 V18" /><circle cx="12" cy="19.3" r="1.1" /></g>
    </svg>
  );
}