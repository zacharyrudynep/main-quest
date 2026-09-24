// /jobs/[slug] — public, server-rendered, SEO-optimized page for one posting.
// Emits schema.org JobPosting JSON-LD so Google can surface it in the Google Jobs
// widget. Resolved from the cached snapshot; if the posting has dropped out of the
// snapshot (closed) we return HTTP 410 Gone so Google de-indexes it cleanly.
import Head from "next/head";
import { findJobBySlug, jobSlug, companySlug } from "../../lib/snapshot";
import { classifyRole, roleSlug } from "../../lib/salary";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://mainquestjobs.com";

function parseSalary(s) {
  if (!s || typeof s !== "string") return null;
  const nums = [...s.matchAll(/\$?\s*([\d][\d,.]*)\s*([kKmM])?/g)].map(m => {
    let n = parseFloat(m[1].replace(/,/g, ""));
    if (!isFinite(n)) return null;
    const suf = (m[2] || "").toLowerCase();
    if (suf === "k") n *= 1000; else if (suf === "m") n *= 1000000;
    return n;
  }).filter(n => n != null);
  const annual = nums.filter(n => n >= 10000 && n <= 2000000);
  if (annual.length === 0) return null;
  const min = Math.min(...annual), max = Math.max(...annual);
  const currency = /€|eur/i.test(s) ? "EUR" : /£|gbp/i.test(s) ? "GBP" : /cad|c\$/i.test(s) ? "CAD" : "USD";
  return { min, max: max > min ? max : min, currency };
}
function mapType(t) {
  const x = String(t || "").toLowerCase();
  if (x.includes("part")) return "PART_TIME";
  if (x.includes("contract") || x.includes("freelance")) return "CONTRACTOR";
  if (x.includes("intern")) return "INTERN";
  if (x.includes("temp")) return "TEMPORARY";
  return "FULL_TIME";
}
function esc(s) { return String(s || "").replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }
function descHtml(job) {
  let h = "";
  if (job.summary) h += `<p>${esc(job.summary)}</p>`;
  if ((job.responsibilities || []).length) h += `<h3>Responsibilities</h3><ul>${job.responsibilities.map(r => `<li>${esc(r)}</li>`).join("")}</ul>`;
  if ((job.requirements || []).length) h += `<h3>Requirements</h3><ul>${job.requirements.map(r => `<li>${esc(r)}</li>`).join("")}</ul>`;
  if (!h) h = `<p>${esc(job.title)} at ${esc(job.company)}${job.location ? " — " + esc(job.location) : ""}.</p>`;
  return h;
}

export async function getServerSideProps({ params, res }) {
  const job = await findJobBySlug(params.slug);
  if (!job) { res.statusCode = 410; return { props: { job: null } }; }
  return { props: { job } };
}

export default function JobPage({ job }) {
  if (!job) {
    return (
      <Shell title="Role no longer listed — Main Quest" desc="This role is no longer available." noindex>
        <div style={{ textAlign: "center", padding: "70px 20px" }}>
          <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 24, color: "#f0d080", marginBottom: 10 }}>This role is no longer listed</h1>
          <p style={{ color: "rgba(244,237,216,.6)", marginBottom: 22 }}>It may have been filled or closed. Plenty more await.</p>
          <a href="/" style={btn}>Browse open roles &rarr;</a>
        </div>
      </Shell>
    );
  }

  const url = `${SITE}/jobs/${jobSlug(job)}`;
  const title = `${job.title} at ${job.company} — Main Quest`;
  const desc = (job.summary || `${job.experience || ""} ${job.type || ""} role at ${job.company}${job.location ? " · " + job.location : ""}. Apply via Main Quest, the game-industry job board.`).replace(/\s+/g, " ").trim().slice(0, 300);
  const sal = parseSalary(job.salary);
  const posted = job.posted ? new Date(job.posted) : new Date(Date.now() - 14 * 86400000);
  const validThrough = new Date(Date.now() + 30 * 86400000);
  const applyUrl = job.applyUrl || job.url || "/";

  const ld = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: descHtml(job),
    datePosted: (isNaN(posted) ? new Date(Date.now() - 14 * 86400000) : posted).toISOString().slice(0, 10),
    validThrough: validThrough.toISOString().slice(0, 10),
    employmentType: mapType(job.type),
    directApply: false,
    hiringOrganization: { "@type": "Organization", name: job.company },
    identifier: { "@type": "PropertyValue", name: job.company, value: jobSlug(job) },
  };
  if (job.isRemote) {
    ld.jobLocationType = "TELECOMMUTE";
    ld.applicantLocationRequirements = { "@type": "Country", name: "USA" };
  }
  if (job.location) {
    const parts = job.location.split(",").map(s => s.trim()).filter(Boolean);
    ld.jobLocation = { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: parts[0] || job.location, ...(parts[1] ? { addressRegion: parts[1] } : {}), addressCountry: parts[2] || "US" } };
  } else if (!job.isRemote) {
    ld.jobLocation = { "@type": "Place", address: { "@type": "PostalAddress", addressCountry: "US" } };
  }
  if (sal) ld.baseSalary = { "@type": "MonetaryAmount", currency: sal.currency, value: { "@type": "QuantitativeValue", minValue: sal.min, maxValue: sal.max, unitText: "YEAR" } };

  const chips = [job.location, job.isRemote ? "Remote" : null, job.type, job.experience, job.salary && job.salary !== "Salary not listed" ? job.salary : null].filter(Boolean);

  return (
    <Shell title={title} desc={desc} canonical={url}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "8px 20px 60px" }}>
        <a href="/" style={{ fontSize: 12.5, color: "rgba(201,168,76,.7)", textDecoration: "none", fontFamily: "'Cinzel',serif" }}>&larr; All game-industry roles</a>
        <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 27, fontWeight: 800, color: "#f0d080", margin: "14px 0 6px", lineHeight: 1.2 }}>{job.title}</h1>
        <div style={{ fontSize: 16, color: "#d8ceb4", marginBottom: 14 }}>{job.company}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 22 }}>
          {chips.map((c, i) => <span key={i} style={{ background: "rgba(201,168,76,.1)", border: "1px solid rgba(201,168,76,.22)", color: "rgba(244,237,216,.8)", borderRadius: 20, fontSize: 12, padding: "4px 12px", fontFamily: "'Cinzel',serif" }}>{c}</span>)}
        </div>
        <a href={applyUrl} target="_blank" rel="noopener nofollow" style={{ ...btn, display: "inline-block", marginBottom: 26 }}>Apply for this role &rarr;</a>
        <div style={{ fontSize: 14.5, color: "rgba(244,237,216,.82)", lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: descHtml(job) }} />
        {(() => { const roleName = classifyRole(job.title); return (
          <div style={{ marginTop: 28, display: "flex", flexWrap: "wrap", gap: 9 }}>
            <a href={`/companies/${companySlug(job.company)}`} style={xlink}>More roles at {job.company} &rarr;</a>
            {roleName !== "Other" && <a href={`/roles/${roleSlug(roleName)}`} style={xlink}>More {roleName} jobs &rarr;</a>}
          </div>
        ); })()}
        <div style={{ marginTop: 26, paddingTop: 22, borderTop: "1px solid rgba(201,168,76,.14)", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "rgba(244,237,216,.55)", marginBottom: 14 }}>Find more roles like this — with match scores, alerts, and AI tools — on Main Quest.</p>
          <a href="/" style={btn}>Open the job board &rarr;</a>
        </div>
      </div>
    </Shell>
  );
}

const btn = { background: "linear-gradient(135deg,#c9a84c,#e8613a)", color: "#0a0608", textDecoration: "none", padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 800, fontFamily: "'Cinzel',serif" };
const xlink = { background: "rgba(201,168,76,.08)", border: "1px solid rgba(201,168,76,.2)", color: "rgba(244,237,216,.8)", textDecoration: "none", padding: "9px 15px", borderRadius: 9, fontSize: 12.5, fontFamily: "'Cinzel',serif" };

function Shell({ title, desc, canonical, noindex, children }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={desc} />
        {noindex && <meta name="robots" content="noindex" />}
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
        <header style={{ maxWidth: 760, margin: "0 auto", padding: "18px 20px" }}>
          <a href="/" style={{ fontFamily: "Georgia,serif", fontSize: 20, fontWeight: "bold", letterSpacing: 2, color: "#f0d080", textDecoration: "none" }}>MAIN QUEST</a>
        </header>
        {children}
      </div>
    </>
  );
}
