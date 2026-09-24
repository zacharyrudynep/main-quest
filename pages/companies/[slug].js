// /companies/[slug] — a studio's open roles + a follow bell + contact links.
// Works for ANY studio in the directory, even those with no live postings.
import Head from "next/head";
import { useState, useEffect } from "react";
import { getCompanyPageData, jobSlug, companySlug } from "../../lib/snapshot";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://mainquestjobs.com";

export async function getServerSideProps({ params }) {
  const data = await getCompanyPageData(params.slug);
  if (!data) return { notFound: true };
  const jobs = data.jobs.map(j => ({ title: j.title, location: j.location || "", isRemote: !!j.isRemote, type: j.type || "", slug: jobSlug(j) }));
  return { props: { company: data.name, meta: data.meta || null, jobs } };
}

function applyHref(meta) {
  if (!meta) return null;
  const ri = meta.registerInterestLink;
  if (ri) return (/@/.test(ri) && !/^https?:/i.test(ri)) ? `mailto:${ri}` : ri;
  if (meta.emailApply && meta.email) return `mailto:${meta.email}`;
  if (meta.contact) return meta.contact;
  if (meta.url) return meta.url;
  return null;
}

const Bell = ({ filled }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? "#f0d080" : "none"} stroke={filled ? "#f0d080" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

function FollowBell({ company }) {
  const [state, setState] = useState("loading"); // loading | guest | on | off | busy
  useEffect(() => {
    let m = true;
    (async () => {
      try {
        const { supabase } = await import("../../lib/supabase");
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { if (m) setState("guest"); return; }
        const { data } = await supabase.from("profiles").select("data").eq("id", session.user.id).single();
        const list = ((data && data.data && data.data.notifyCompanies) || []).map(c => String(c).toLowerCase());
        if (m) setState(list.includes(company.toLowerCase()) ? "on" : "off");
      } catch (e) { if (m) setState("guest"); }
    })();
    return () => { m = false; };
  }, [company]);

  const toggle = async () => {
    if (state === "guest" || state === "loading") { window.location.href = "/"; return; }
    const prev = state; setState("busy");
    try {
      const { supabase } = await import("../../lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.href = "/"; return; }
      const { data } = await supabase.from("profiles").select("data").eq("id", session.user.id).single();
      const cur = (data && data.data) || {};
      const list = Array.isArray(cur.notifyCompanies) ? cur.notifyCompanies : [];
      const has = list.some(c => String(c).toLowerCase() === company.toLowerCase());
      const next = has ? list.filter(c => String(c).toLowerCase() !== company.toLowerCase()) : [...list, company];
      await supabase.from("profiles").upsert({ id: session.user.id, data: { ...cur, notifyCompanies: next } }, { onConflict: "id" });
      setState(has ? "off" : "on");
    } catch (e) { setState(prev); }
  };

  const active = state === "on";
  const label = state === "busy" ? "…" : state === "guest" ? "Follow" : active ? "Following" : "Follow";
  return (
    <button onClick={toggle} title={state === "guest" ? "Sign in to follow this studio" : active ? "Following — click to unfollow" : "Follow for new-role alerts"}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, background: active ? "rgba(201,168,76,.18)" : "rgba(201,168,76,.06)", border: `1px solid rgba(201,168,76,${active ? ".5" : ".25"})`, color: active ? "#f0d080" : "rgba(244,237,216,.75)", borderRadius: 9, padding: "8px 13px", cursor: "pointer", fontSize: 13, fontFamily: "'Cinzel',serif", fontWeight: 700 }}>
      <Bell filled={active} />{label}
    </button>
  );
}

const linkBtn = { display: "inline-flex", alignItems: "center", background: "rgba(201,168,76,.06)", border: "1px solid rgba(201,168,76,.22)", color: "rgba(244,237,216,.8)", textDecoration: "none", borderRadius: 9, padding: "8px 13px", fontSize: 12.5, fontFamily: "'Cinzel',serif" };
const btn = { background: "linear-gradient(135deg,#c9a84c,#e8613a)", color: "#0a0608", textDecoration: "none", padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 800, fontFamily: "'Cinzel',serif", display: "inline-block" };

export default function CompanyPage({ company, meta, jobs }) {
  const locations = [...new Set(jobs.map(j => j.location).filter(Boolean))].slice(0, 4);
  const locLine = locations.length ? locations.join(" · ") : (meta && meta.location) || "";
  const title = `Jobs at ${company} — Careers | Main Quest`;
  const desc = `${jobs.length ? `${jobs.length} open ${jobs.length === 1 ? "role" : "roles"}` : "Open applications"} at ${company}. Browse and apply on Main Quest, the game-industry job board.`;
  const ld = jobs.length ? {
    "@context": "https://schema.org/", "@type": "ItemList",
    itemListElement: jobs.slice(0, 100).map((j, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE}/jobs/${j.slug}`, name: j.title })),
  } : null;
  const openHref = applyHref(meta);

  return (
    <Shell title={title} desc={desc} canonical={`${SITE}/companies/${companySlug(company)}`}>
      {ld && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "8px 20px 60px" }}>
        <a href="/" style={{ fontSize: 12.5, color: "rgba(201,168,76,.7)", textDecoration: "none", fontFamily: "'Cinzel',serif" }}>&larr; All studios</a>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, margin: "12px 0 10px" }}>
          <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 27, fontWeight: 800, color: "#f0d080", margin: 0, lineHeight: 1.2 }}>{company}</h1>
          <FollowBell company={company} />
          {meta && meta.url && <a href={meta.url} target="_blank" rel="noopener nofollow" style={linkBtn}>Website</a>}
          {meta && meta.contact && <a href={meta.contact} target="_blank" rel="noopener nofollow" style={linkBtn}>Contact</a>}
          {meta && meta.email && <a href={`mailto:${meta.email}`} style={linkBtn}>Email</a>}
        </div>
        {locLine && <div style={{ fontSize: 13, color: "rgba(244,237,216,.5)", marginBottom: 22 }}>{jobs.length ? `${jobs.length} open ${jobs.length === 1 ? "role" : "roles"} · ` : ""}{locLine}</div>}

        {jobs.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {jobs.map((j, i) => (
              <a key={i} href={`/jobs/${j.slug}`} style={{ textDecoration: "none", display: "block", padding: "13px 16px", background: "rgba(201,168,76,.04)", border: "1px solid rgba(201,168,76,.12)", borderRadius: 10 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: "#f4edd8" }}>{j.title}</div>
                <div style={{ fontSize: 11.5, color: "rgba(244,237,216,.45)", marginTop: 3 }}>{[j.isRemote ? "Remote" : j.location, j.type].filter(Boolean).join(" · ")}</div>
              </a>
            ))}
          </div>
        ) : openHref ? (
          <a href={openHref} target="_blank" rel="noopener nofollow" style={{ textDecoration: "none", display: "block", padding: "18px 16px", background: "rgba(201,168,76,.05)", border: "1px dashed rgba(201,168,76,.3)", borderRadius: 10 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: "#f0d080" }}>Open Application</div>
            <div style={{ fontSize: 12, color: "rgba(244,237,216,.5)", marginTop: 4 }}>No live postings right now, but {company} accepts open applications — reach out directly &rarr;</div>
          </a>
        ) : (
          <div style={{ padding: "24px 16px", textAlign: "center", background: "rgba(201,168,76,.03)", border: "1px solid rgba(201,168,76,.1)", borderRadius: 10, color: "rgba(244,237,216,.5)", fontSize: 13.5 }}>
            No open roles right now. Follow {company} to be alerted when they post.
          </div>
        )}

        <div style={{ marginTop: 30, paddingTop: 20, borderTop: "1px solid rgba(201,168,76,.14)", textAlign: "center" }}>
          <a href="/" style={btn}>Browse all game-industry roles &rarr;</a>
        </div>
      </div>
    </Shell>
  );
}

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