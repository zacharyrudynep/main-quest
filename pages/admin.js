import Head from "next/head";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const GOLD = "#c9a84c", G = "linear-gradient(135deg,#c9a84c,#e8613a)";
const TABS = [["overview", "Overview"], ["jobs", "Jobs & Search"], ["applications", "Applications"], ["users", "Users"], ["engagement", "Engagement"], ["revenue", "Premium & Revenue"]];

export default function Admin() {
  const [status, setStatus] = useState("loading");
  const [s, setS] = useState(null);
  const [tab, setTab] = useState("overview");
  const [rev, setRev] = useState(null);
  const [revStatus, setRevStatus] = useState("idle");
  const [eng, setEng] = useState(null);
  const [engStatus, setEngStatus] = useState("idle");

  useEffect(() => {
    if (tab !== "engagement" || engStatus !== "idle") return;
    setEngStatus("loading");
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data && data.session && data.session.access_token;
        const r = await fetch("/api/admin/engagement", { headers: { Authorization: `Bearer ${token}` } });
        if (!r.ok) { setEngStatus("error"); return; }
        setEng(await r.json());
        setEngStatus("ready");
      } catch (e) { setEngStatus("error"); }
    })();
  }, [tab, engStatus]); // idle | loading | ready | error

  useEffect(() => {
    if (tab !== "revenue" || revStatus !== "idle") return;
    setRevStatus("loading");
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data && data.session && data.session.access_token;
        const r = await fetch("/api/admin/revenue", { headers: { Authorization: `Bearer ${token}` } });
        if (!r.ok) { setRevStatus("error"); return; }
        setRev(await r.json());
        setRevStatus("ready");
      } catch (e) { setRevStatus("error"); }
    })();
  }, [tab, revStatus]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const token = data && data.session && data.session.access_token;
      if (!token) { setStatus("denied"); return; }
      try {
        const r = await fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } });
        if (r.status === 401 || r.status === 403) { setStatus("denied"); return; }
        if (!r.ok) { setStatus("error"); return; }
        setS(await r.json());
        setStatus("ready");
      } catch (e) { setStatus("error"); }
    })();
  }, []);

  return (
    <>
      <Head>
        <title>Main Quest — Admin</title>
        <meta name="robots" content="noindex" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Cinzel+Decorative:wght@700&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ minHeight: "100vh", background: "radial-gradient(1100px 620px at 50% -12%, rgba(139,32,32,.14), transparent), #080608", color: "#f4edd8", fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif", padding: "28px 20px 60px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 22, fontWeight: 700, background: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Main Quest — Admin</div>
            <a href="/" style={{ textDecoration: "none", color: "rgba(244,237,216,.55)", fontSize: 12, fontFamily: "'Cinzel',serif" }}>← Back to board</a>
          </div>

          {status === "loading" && <Note>Loading…</Note>}
          {status === "denied" && <Note>Access denied. This page is for the site owner only. <a href="/" style={{ color: GOLD }}>Sign in</a> with the owner account first.</Note>}
          {status === "error" && <Note>Couldn't load stats. Check that the <code>events</code> / <code>saved_jobs</code> tables exist and <code>ADMIN_EMAIL</code> is set.</Note>}

          {status === "ready" && s && (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
                {TABS.map(([id, label]) => (
                  <button key={id} onClick={() => setTab(id)} style={{ background: tab === id ? "rgba(201,168,76,.16)" : "rgba(201,168,76,.05)", border: `1px solid ${tab === id ? "rgba(201,168,76,.45)" : "rgba(201,168,76,.14)"}`, color: tab === id ? "#f0d080" : "rgba(244,237,216,.55)", cursor: "pointer", borderRadius: 20, fontSize: 12, padding: "7px 16px", fontFamily: "'Cinzel',serif", fontWeight: 600, letterSpacing: .4 }}>{label}</button>
                ))}
              </div>

              {tab === "overview" && (
                <>
                  <Kpis items={[
                    ["Total Users", s.totalUsers], ["Premium", s.premiumUsers, `${s.premiumPct}% of users`, "#7ecfb3"],
                    ["Applications", s.totalApplications], ["Saves", s.totalSaves, null, "#e8a070"],
                    ["Job Views", s.totalViews, null, "#e8a070"], ["Apply Clicks", s.totalClicks, null, "#e8a070"], ["Shares", s.totalShares, null, "#e8a070"],
                  ]} />
                  <TwoCol>
                    <Panel title="Signups (last 30 days)"><LineChart data={s.signupSeries} color="#c9a84c" /></Panel>
                    <Panel title="Applications (last 30 days)"><LineChart data={s.appSeries} color="#7ecfb3" /></Panel>
                  </TwoCol>
                  <TwoCol>
                    <Panel title="Share methods"><BarList rows={s.shareMethods} empty="No shares yet." plain /></Panel>
                    <Panel title="All events"><Events e={s.eventTotals} /></Panel>
                  </TwoCol>
                </>
              )}

              {tab === "jobs" && (
                <>
                  <Kpis items={[["Job Views", s.totalViews, null, "#e8a070"], ["Apply Clicks", s.totalClicks, null, "#e8a070"], ["Saves", s.totalSaves, null, "#e8a070"], ["Shares", s.totalShares, null, "#e8a070"], ["Searches", s.totalSearches]]} />
                  <Panel title="⚠ Searches that returned nothing — jobs users want that you don't have" accent>
                    <BarList rows={s.zeroResultSearches} empty="No zero-result searches recorded yet." color="linear-gradient(90deg,#e8613a,#c0703a)" />
                  </Panel>
                  <TwoCol>
                    <Panel title="Top searches"><BarList rows={s.topSearches} empty="No searches yet." plain /></Panel>
                    <Panel title="Most-applied companies"><BarList rows={s.topAppliedCompanies} empty="No applications yet." plain /></Panel>
                  </TwoCol>
                  <TwoCol>
                    <Panel title="Most-viewed jobs"><BarList rows={s.topViewed} empty="No job views yet." /></Panel>
                    <Panel title="Most-clicked jobs"><BarList rows={s.topClicked} empty="No apply clicks yet." /></Panel>
                  </TwoCol>
                  <TwoCol>
                    <Panel title="Most-saved jobs"><BarList rows={s.topSaved} empty="No saved jobs yet." /></Panel>
                    <Panel title="Most-shared jobs"><BarList rows={s.topShared} empty="No shares yet." /></Panel>
                  </TwoCol>
                </>
              )}

              {tab === "applications" && (
                <>
                  <Kpis items={[
                    ["Applications", s.totalApplications],
                    ["Response Rate", `${s.responseRate}%`, null, "#7ecfb3"],
                    ["Interview Rate", `${s.interviewRate}%`, null, "#7ecfb3"],
                    ["Offer Rate", `${s.offerRate}%`, null, "#7ecfb3"],
                  ]} />
                  <TwoCol>
                    <Panel title="Application status distribution"><BarList rows={s.statusDist} empty="No applications yet." plain /></Panel>
                    <Panel title="Applications (last 30 days)"><LineChart data={s.appSeries} color="#7ecfb3" /></Panel>
                  </TwoCol>
                  <Panel title="Premium vs Free — outcome rates"><TierCompare a={s.outcomeByTier.premium} b={s.outcomeByTier.free} /></Panel>
                  <div style={{ marginTop: 16 }}><Panel title="Most-applied companies"><BarList rows={s.topAppliedCompanies} empty="No applications yet." plain /></Panel></div>
                </>
              )}

              {tab === "users" && (
                <>
                  <Kpis items={[
                    ["Total Users", s.totalUsers], ["Free", s.freeUsers], ["Premium", s.premiumUsers, `${s.premiumPct}% of users`, "#7ecfb3"],
                    ["Resumes Uploaded", s.resumesUploaded], ["Complete Profiles", s.completeProfiles],
                  ]} />
                  <Panel title="Signups (last 30 days)"><LineChart data={s.signupSeries} color="#c9a84c" /></Panel>
                </>
              )}

              {tab === "engagement" && (
                <>
                  {engStatus === "loading" && <Note>Computing engagement…</Note>}
                  {engStatus === "error" && <Note>Couldn't load engagement data.</Note>}
                  {engStatus === "ready" && eng && (
                    <>
                      <Kpis items={[
                        ["DAU (today)", eng.dau], ["Avg DAU", eng.avgDau], ["WAU", eng.wau], ["MAU", eng.mau],
                        ["Stickiness", `${eng.stickiness}%`, "DAU / MAU", "#7ecfb3"],
                        ["Sessions / Visitor", eng.sessionsPerVisitor], ["Avg Session", `${eng.avgSessionMin}m`],
                      ]} />
                      <Panel title="Daily active visitors (last 30 days)"><LineChart data={eng.dauSeries} color="#7ecfb3" /></Panel>
                      <TwoCol>
                        <Panel title="New vs returning (last 30 days)">
                          <NRChart data={eng.newReturning} />
                          <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 11 }}><span style={{ color: "#c9a84c" }}>■ New</span><span style={{ color: "#7ecfb3" }}>■ Returning</span></div>
                        </Panel>
                        <Panel title="Retention — % active N days after first visit"><BarList rows={eng.retention} empty="Not enough history yet." plain /></Panel>
                      </TwoCol>
                    </>
                  )}
                </>
              )}

              {tab === "revenue" && (
                <>
                  {revStatus === "loading" && <Note>Loading revenue from Stripe…</Note>}
                  {revStatus === "error" && <Note>Couldn't load Stripe data. Make sure the <code>stripe</code> package is installed and <code>STRIPE_SECRET_KEY</code> is set.</Note>}
                  {revStatus === "ready" && rev && !rev.configured && <Note>Stripe isn't configured — set <code>STRIPE_SECRET_KEY</code> to see revenue here.</Note>}
                  {revStatus === "ready" && rev && rev.configured && (
                    <>
                      <Kpis items={[
                        ["MRR", `$${rev.mrr.toLocaleString()}`], ["ARR", `$${rev.arr.toLocaleString()}`],
                        ["Active Subs", rev.activeSubs, null, "#7ecfb3"], ["Total Revenue", `$${rev.totalRevenue.toLocaleString()}`],
                        ["Revenue (30d)", `$${rev.revenue30.toLocaleString()}`], ["Lifetime Sales", rev.lifetimeCount],
                        ["Churn (30d)", `${rev.churnPct}%`, `${rev.canceledSubs30} cancelled`, "#e8a070"],
                      ]} money />
                      <Panel title="Revenue (last 30 days)"><LineChart data={rev.revenueSeries} color="#7ecfb3" money /></Panel>
                      <TwoCol>
                        <Panel title="Plan mix"><BarList rows={rev.planCounts} empty="No active subscriptions." plain /></Panel>
                        <Panel title="Subscriptions (last 30 days)"><Events e={{ "new": rev.newSubs30, "cancelled": rev.canceledSubs30 }} /></Panel>
                      </TwoCol>
                    </>
                  )}
                </>
              )}

              <div style={{ fontSize: 10.5, color: "rgba(244,237,216,.3)", marginTop: 18, lineHeight: 1.6 }}>
                Generated {new Date(s.generatedAt).toLocaleString()} · all computed natively from your Supabase data. Traffic & active users: Vercel Analytics.
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Note({ children }) {
  return <div style={{ background: "rgba(16,10,22,.6)", border: "1px solid rgba(201,168,76,.2)", borderRadius: 12, padding: "20px 22px", fontSize: 13, color: "rgba(244,237,216,.7)", lineHeight: 1.6 }}>{children}</div>;
}
function TwoCol({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 16, marginBottom: 16 }}>{children}</div>;
}
function Kpis({ items }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
      {items.map(([label, value, sub, accent], i) => (
        <div key={i} style={{ background: "rgba(16,10,22,.6)", border: "1px solid rgba(201,168,76,.16)", borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ fontSize: 10.5, color: "rgba(244,237,216,.5)", textTransform: "uppercase", letterSpacing: .6, fontFamily: "'Cinzel',serif", marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: accent || "#c9a84c", fontFamily: "'Cinzel',serif", lineHeight: 1 }}>{(value ?? 0).toLocaleString()}</div>
          {sub && <div style={{ fontSize: 11, color: "rgba(244,237,216,.4)", marginTop: 6 }}>{sub}</div>}
        </div>
      ))}
    </div>
  );
}
function Panel({ title, children, accent }) {
  return (
    <div style={{ background: "rgba(16,10,22,.5)", border: `1px solid ${accent ? "rgba(232,97,58,.3)" : "rgba(201,168,76,.14)"}`, borderRadius: 14, padding: "16px 18px", marginBottom: accent ? 16 : 0 }}>
      <div style={{ fontSize: 12, color: accent ? "#e8a070" : "#f0d080", fontFamily: "'Cinzel',serif", fontWeight: 700, letterSpacing: .4, marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  );
}
function TierCompare({ a, b }) {
  const metric = (label, pRate, fRate) => (
    <div style={{ marginBottom: 13 }}>
      <div style={{ fontSize: 11, color: "rgba(244,237,216,.6)", marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, marginBottom: 3 }}><span style={{ color: "#7ecfb3" }}>Premium</span><b style={{ color: "#7ecfb3" }}>{pRate}%</b></div>
          <div style={{ height: 5, borderRadius: 3, background: "rgba(244,237,216,.08)", overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.min(100, pRate)}%`, background: "#7ecfb3", borderRadius: 3 }} /></div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, marginBottom: 3 }}><span style={{ color: "rgba(244,237,216,.6)" }}>Free</span><b style={{ color: "#c9a84c" }}>{fRate}%</b></div>
          <div style={{ height: 5, borderRadius: 3, background: "rgba(244,237,216,.08)", overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.min(100, fRate)}%`, background: "#c9a84c", borderRadius: 3 }} /></div>
        </div>
      </div>
    </div>
  );
  return (
    <div>
      <div style={{ fontSize: 10.5, color: "rgba(244,237,216,.4)", marginBottom: 14 }}>Premium: {a.total} apps · Free: {b.total} apps</div>
      {metric("Response rate", a.responseRate, b.responseRate)}
      {metric("Interview rate", a.interviewRate, b.interviewRate)}
      {metric("Offer rate", a.offerRate, b.offerRate)}
    </div>
  );
}
function NRChart({ data }) {
  const W = 460, H = 150, pad = 6;
  const max = Math.max(1, ...data.map(d => d.new + d.returning));
  const bw = (W - pad * 2) / (data.length || 1);
  const scale = (H - pad * 2 - 14);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      {data.map((d, i) => {
        const x = pad + i * bw;
        const rh = (d.returning / max) * scale;
        const nh = (d.new / max) * scale;
        return (
          <g key={i}>
            <rect x={x + 0.5} y={H - pad - rh} width={Math.max(0.5, bw - 1)} height={rh} fill="#7ecfb3" opacity="0.85" />
            <rect x={x + 0.5} y={H - pad - rh - nh} width={Math.max(0.5, bw - 1)} height={nh} fill="#c9a84c" opacity="0.85" />
          </g>
        );
      })}
      <text x={pad} y={12} fill="rgba(244,237,216,.4)" fontSize="10">max {max}/day</text>
    </svg>
  );
}
function Events({ e }) {
  const keys = Object.keys(e || {});
  if (keys.length === 0) return <div style={{ color: "rgba(244,237,216,.4)", fontSize: 12, fontStyle: "italic" }}>No events recorded yet.</div>;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {Object.entries(e).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
        <span key={k} style={{ background: "rgba(201,168,76,.08)", border: "1px solid rgba(201,168,76,.2)", borderRadius: 20, padding: "5px 13px", fontSize: 12 }}><span style={{ color: "rgba(244,237,216,.6)" }}>{k}</span> <b style={{ color: GOLD }}>{v}</b></span>
      ))}
    </div>
  );
}
function LineChart({ data, color = "#c9a84c" }) {
  const W = 460, H = 150, pad = 6;
  const vals = (data || []).map(d => d.count);
  const max = Math.max(1, ...vals);
  const n = data.length || 1;
  const x = (i) => pad + (i / (n - 1 || 1)) * (W - pad * 2);
  const y = (v) => H - pad - (v / max) * (H - pad * 2 - 14);
  const pts = (data || []).map((d, i) => `${x(i)},${y(d.count)}`).join(" ");
  const area = `${pad},${H - pad} ${pts} ${x(n - 1)},${H - pad}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <polygon points={area} fill={color} opacity="0.08" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <text x={pad} y={12} fill="rgba(244,237,216,.4)" fontSize="10">max {max}</text>
      <text x={pad} y={H - 1} fill="rgba(244,237,216,.35)" fontSize="9">{data[0] && data[0].date.slice(5)}</text>
      <text x={W - pad} y={H - 1} fill="rgba(244,237,216,.35)" fontSize="9" textAnchor="end">{data[n - 1] && data[n - 1].date.slice(5)}</text>
    </svg>
  );
}
function BarList({ rows, empty, color = "linear-gradient(90deg,#c9a84c,#e8613a)", plain }) {
  if (!rows || rows.length === 0) return <div style={{ color: "rgba(244,237,216,.4)", fontSize: 12, fontStyle: "italic" }}>{empty}</div>;
  const max = Math.max(1, ...rows.map(r => r.count));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {rows.map((r, i) => {
        const name = plain ? r.label : (r.label || "").split("|").slice(0, 2).join(" · ");
        return (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "rgba(244,237,216,.75)", marginBottom: 3 }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "82%" }}>{name}</span>
              <b style={{ color: "#c9a84c" }}>{r.count}</b>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: "rgba(244,237,216,.08)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(r.count / max) * 100}%`, background: color, borderRadius: 3 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}