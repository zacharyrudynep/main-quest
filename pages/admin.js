import Head from "next/head";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const GOLD = "#c9a84c", G = "linear-gradient(135deg,#c9a84c,#e8613a)";
const TABS = [["overview", "Overview"], ["jobs", "Jobs & Search"], ["applications", "Applications"], ["users", "Users"], ["engagement", "Engagement"], ["revenue", "Premium & Revenue"]];
const COUNTRY_NAMES = { US:"United States", GB:"United Kingdom", CA:"Canada", DE:"Germany", FR:"France", NL:"Netherlands", SE:"Sweden", FI:"Finland", NO:"Norway", DK:"Denmark", PL:"Poland", ES:"Spain", IT:"Italy", IE:"Ireland", PT:"Portugal", BE:"Belgium", CH:"Switzerland", AT:"Austria", CZ:"Czechia", RO:"Romania", UA:"Ukraine", RU:"Russia", TR:"Turkey", JP:"Japan", KR:"South Korea", CN:"China", IN:"India", SG:"Singapore", PH:"Philippines", ID:"Indonesia", MY:"Malaysia", TH:"Thailand", VN:"Vietnam", AU:"Australia", NZ:"New Zealand", BR:"Brazil", MX:"Mexico", AR:"Argentina", CL:"Chile", CO:"Colombia", ZA:"South Africa", NG:"Nigeria", EG:"Egypt", KE:"Kenya", IL:"Israel", AE:"UAE", SA:"Saudi Arabia", PK:"Pakistan", BD:"Bangladesh", HK:"Hong Kong", TW:"Taiwan", GR:"Greece", HU:"Hungary", BG:"Bulgaria", HR:"Croatia", RS:"Serbia", SK:"Slovakia", SI:"Slovenia", LT:"Lithuania", LV:"Latvia", EE:"Estonia", IS:"Iceland", LU:"Luxembourg" };
function countryLabel(code) {
  const cc = String(code || "").toUpperCase();
  const flag = /^[A-Z]{2}$/.test(cc) ? cc.replace(/./g, (ch) => String.fromCodePoint(127397 + ch.charCodeAt(0))) : "";
  return `${flag} ${COUNTRY_NAMES[cc] || cc}`.trim();
}


export default function Admin() {
  const [status, setStatus] = useState("loading");
  const [s, setS] = useState(null);
  const [tab, setTab] = useState("overview");
  const [rev, setRev] = useState(null);
  const [revStatus, setRevStatus] = useState("idle");
  const [eng, setEng] = useState(null);
  const [engStatus, setEngStatus] = useState("idle");
  const [usersData, setUsersData] = useState(null);
  const [usersStatus, setUsersStatus] = useState("idle");
  const [uq, setUq] = useState("");
  const [selUser, setSelUser] = useState(null);

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
    if (tab !== "users" || usersStatus !== "idle") return;
    setUsersStatus("loading");
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data && data.session && data.session.access_token;
        const r = await fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } });
        if (!r.ok) { setUsersStatus("error"); return; }
        setUsersData(await r.json());
        setUsersStatus("ready");
      } catch (e) { setUsersStatus("error"); }
    })();
  }, [tab, usersStatus]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const token = data && data.session && data.session.access_token;
      if (!token) { setStatus("login"); return; }
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
      <div style={{ minHeight: "100vh", overflowX: "hidden", maxWidth: "100%", background: "radial-gradient(1100px 620px at 50% -12%, rgba(139,32,32,.14), transparent), #080608", color: "#f4edd8", fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif", padding: "28px 20px 60px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 22, fontWeight: 700, background: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Main Quest — Admin</div>
            <a href="/" style={{ textDecoration: "none", color: "rgba(244,237,216,.55)", fontSize: 12, fontFamily: "'Cinzel',serif" }}>← Back to board</a>
          </div>

          {status === "loading" && <Note>Loading…</Note>}
          {status === "login" && <AdminLogin />}
          {status === "denied" && <Note>You’re signed in, but this dashboard is for the owner account only. <a href="/" style={{ color: GOLD }}>Back to the board</a>.</Note>}
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
                    ["Active Users", s.activeUsers, null, null, "Accounts that currently exist — drops when someone deletes their account."], ["Lifetime Users", s.lifetimeUsers, "never decreases", "#e8a070", "The most accounts you’ve ever had. Tracks Active Users but never drops when someone deletes their account."], ["Premium", s.premiumUsers, `${s.premiumPct}% of users`, "#7ecfb3"],
                    ["Applications", s.totalApplications], ["Saves", s.totalSaves, null, "#e8a070"],
                    ["Job Views", s.totalViews, null, "#e8a070"], ["Apply Clicks", s.totalClicks, null, "#e8a070"], ["Shares", s.totalShares, null, "#e8a070"],
                  ]} />
                  <TwoCol>
                    <Panel title="Signups"><LineChart series={s.signupSeries} color="#c9a84c" /></Panel>
                    <Panel title="Applications"><LineChart series={s.appSeries} color="#7ecfb3" /></Panel>
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
                    <Panel title="Applications"><LineChart series={s.appSeries} color="#7ecfb3" /></Panel>
                  </TwoCol>
                  <Panel title="Premium vs Free — outcome rates"><TierCompare a={s.outcomeByTier.premium} b={s.outcomeByTier.free} /></Panel>
                  <div style={{ marginTop: 16 }}><Panel title="Most-applied companies"><BarList rows={s.topAppliedCompanies} empty="No applications yet." plain /></Panel></div>
                </>
              )}

              {tab === "users" && (
                <>
                  <Kpis items={[
                    ["Active Users", s.activeUsers, null, null, "Accounts that currently exist — drops when someone deletes their account."], ["Lifetime Users", s.lifetimeUsers, "never decreases", "#e8a070", "The most accounts you’ve ever had. Tracks Active Users but never drops when someone deletes their account."], ["Free", s.freeUsers], ["Premium", s.premiumUsers, `${s.premiumPct}% of users`, "#7ecfb3"],
                    ["Resumes Uploaded", s.resumesUploaded], ["Complete Profiles", s.completeProfiles],
                  ]} />
                  <Panel title="Signups"><LineChart series={s.signupSeries} color="#c9a84c" /></Panel>
                  <UserDirectory data={usersData} status={usersStatus} q={uq} setQ={setUq} sel={selUser} setSel={setSelUser} />
                </>
              )}

              {tab === "engagement" && (
                <>
                  {engStatus === "loading" && <Note>Computing engagement…</Note>}
                  {engStatus === "error" && <Note>Couldn't load engagement data.</Note>}
                  {engStatus === "ready" && eng && (
                    <>
                      <Kpis items={[
                        ["DAU (today)", eng.dau, null, null, "Daily Active Users — unique visitors on the site today."],
                        ["Avg DAU", eng.avgDau, null, null, "Average Daily Active Users across the last 30 days."],
                        ["WAU", eng.wau, null, null, "Weekly Active Users — unique visitors in the last 7 days."],
                        ["MAU", eng.mau, null, null, "Monthly Active Users — unique visitors in the last 30 days."],
                        ["Stickiness", `${eng.stickiness}%`, "DAU / MAU", "#7ecfb3", "How habitually people return: average DAU ÷ MAU. Higher means a larger share of your monthly users show up on a typical day."],
                        ["Sessions / Visitor", eng.sessionsPerVisitor, null, null, "Average number of separate visit-days per unique visitor. Higher = people coming back repeatedly."],
                        ["Avg Session", `${eng.avgSessionMin}m`, null, null, "Rough average minutes between a visitor’s first and last action within a day."],
                        ["Signed-in (30d)", eng.signedInVisitors, null, "#c9a84c", "Distinct signed-in visitors in the last 30 days."],
                        ["Guest (30d)", eng.guestVisitors, null, "#7f8fa0", "Distinct visitors in the last 30 days who were not signed in."],
                        ["Viewed landing (30d)", eng.landingVisitors, null, "#7ecfb3", "Distinct visitors who saw the landing page in the last 30 days."],
                        ["Viewed board (30d)", eng.boardVisitors, null, "#c9a84c", "Distinct visitors who reached the job board in the last 30 days."],
                      ]} />
                      <Panel title="Active visitors"><LineChart series={eng.dauSeries} color="#7ecfb3" /></Panel>
                      <Panel title="Signed-in vs guest visitors"><VisitorChart series={eng.visitorSplit} /></Panel>
                      <Panel title="Landing page vs job board"><VisitorChart series={eng.pageSplit} keys={["landing","board"]} labels={["Landing page","Job board"]} colors={["#7ecfb3","#c9a84c"]} /></Panel>
                      <Panel title="Visitors by country"><BarList rows={(eng.topCountries||[]).map((c)=>({label:countryLabel(c.country),count:c.count}))} empty="No location data yet — new visits will populate this once the Cloudflare country header is flowing." plain /></Panel>
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
                Generated {new Date(s.generatedAt).toLocaleString()} · all computed natively from your Supabase data. Traffic via PostHog; engagement computed from your own Supabase events.
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

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const inp = { width: "100%", boxSizing: "border-box", background: "rgba(201,168,76,.06)", border: "1px solid rgba(201,168,76,.22)", color: "#f4edd8", colorScheme: "dark", borderRadius: 9, padding: "11px 13px", fontSize: 14, outline: "none" };
  const submit = async () => {
    setErr(""); setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) { setErr("Invalid email or password."); setBusy(false); return; }
      window.location.reload();
    } catch (e) { setErr("Something went wrong."); setBusy(false); }
  };
  return (
    <div style={{ maxWidth: 360, margin: "50px auto", background: "rgba(16,10,22,.6)", border: "1px solid rgba(201,168,76,.2)", borderRadius: 14, padding: "26px 24px" }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 16, color: "#f0d080", fontWeight: 800, marginBottom: 6, textAlign: "center" }}>Owner Sign-In</div>
      <p style={{ fontSize: 12, color: "rgba(244,237,216,.5)", textAlign: "center", marginBottom: 18, lineHeight: 1.5 }}>Sign in with the owner account to view the dashboard.</p>
      <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" onKeyDown={e => e.key === "Enter" && submit()} />
      <input style={{ ...inp, marginTop: 10 }} type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Password" onKeyDown={e => e.key === "Enter" && submit()} />
      {err && <div style={{ fontSize: 11.5, color: "#e07060", marginTop: 10 }}>{err}</div>}
      <button onClick={submit} disabled={busy} style={{ width: "100%", marginTop: 14, background: G, border: "none", color: "#0a0608", borderRadius: 10, padding: "12px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Cinzel',serif", opacity: busy ? .7 : 1 }}>{busy ? "Signing in…" : "Sign In"}</button>
    </div>
  );
}
function TwoCol({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 16, marginBottom: 16 }}>{children}</div>;
}
function KpiBox({ label, value, sub, accent, tip }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative", background: "rgba(16,10,22,.6)", border: "1px solid rgba(201,168,76,.16)", borderRadius: 12, padding: "16px 18px" }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <div style={{ fontSize: 10.5, color: "rgba(244,237,216,.5)", textTransform: "uppercase", letterSpacing: .6, fontFamily: "'Cinzel',serif", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
        {label}{tip && <span style={{ fontSize: 11, opacity: .55, cursor: "help", border: "1px solid rgba(244,237,216,.3)", borderRadius: "50%", width: 13, height: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>i</span>}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: accent || "#c9a84c", fontFamily: "'Cinzel',serif", lineHeight: 1 }}>{(value ?? 0).toLocaleString()}</div>
      {sub && <div style={{ fontSize: 11, color: "rgba(244,237,216,.4)", marginTop: 6 }}>{sub}</div>}
      {tip && show && (
        <div style={{ position: "absolute", bottom: "100%", left: 10, right: 10, marginBottom: 6, background: "#140e0a", border: "1px solid rgba(201,168,76,.4)", borderRadius: 8, padding: "8px 11px", fontSize: 11, color: "rgba(244,237,216,.88)", lineHeight: 1.45, zIndex: 10, boxShadow: "0 8px 24px rgba(0,0,0,.55)" }}>{tip}</div>
      )}
    </div>
  );
}
function Kpis({ items }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
      {items.map((it, i) => <KpiBox key={i} label={it[0]} value={it[1]} sub={it[2]} accent={it[3]} tip={it[4]} />)}
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
function LineChart({ data, series, color = "#c9a84c", money }) {
  // Accepts a plain array (data) OR a ranged object (series = {weekly,monthly,annually,lifetime}).
  const ranged = series && typeof series === "object" && !Array.isArray(series);
  const [range, setRange] = useState("monthly");
  const pts0 = ranged ? (series[range] || series.monthly || []) : (data || []);
  const [hi, setHi] = useState(null);
  const W = 460, H = 150, pad = 6;
  const vals = pts0.map(d => d.count);
  const max = Math.max(1, ...vals);
  const n = pts0.length || 1;
  const x = (i) => pad + (i / (n - 1 || 1)) * (W - pad * 2);
  const y = (v) => H - pad - (v / max) * (H - pad * 2 - 14);
  const pts = pts0.map((d, i) => `${x(i)},${y(d.count)}`).join(" ");
  const area = `${pad},${H - pad} ${pts} ${x(n - 1)},${H - pad}`;
  const fmt = (v) => money ? `$${(v || 0).toLocaleString()}` : (v || 0).toLocaleString();
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const rx = ((e.clientX - r.left) / r.width) * W;
    let idx = Math.round(((rx - pad) / (W - pad * 2)) * (n - 1));
    idx = Math.max(0, Math.min(n - 1, idx));
    setHi({ idx, mx: e.clientX - r.left });
  };
  const tabs = [["weekly", "1W"], ["monthly", "1M"], ["annually", "1Y"], ["lifetime", "All"]];
  const p = hi && pts0[hi.idx];
  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "relative" }} onMouseMove={onMove} onMouseLeave={() => setHi(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
          <polygon points={area} fill={color} opacity="0.08" />
          <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          <text x={pad} y={12} fill="rgba(244,237,216,.4)" fontSize="10">max {fmt(max)}</text>
          <text x={pad} y={H - 1} fill="rgba(244,237,216,.35)" fontSize="9">{pts0[0] && (pts0[0].date || "").slice(5)}</text>
          <text x={W - pad} y={H - 1} fill="rgba(244,237,216,.35)" fontSize="9" textAnchor="end">{pts0[n - 1] && (pts0[n - 1].date || "").slice(5)}</text>
          {p && <line x1={x(hi.idx)} y1={pad} x2={x(hi.idx)} y2={H - pad} stroke="rgba(244,237,216,.2)" strokeWidth="1" />}
          {p && <circle cx={x(hi.idx)} cy={y(p.count)} r="3.5" fill={color} stroke="#0a0608" strokeWidth="1.5" />}
        </svg>
        {p && (
          <div style={{ position: "absolute", left: `${Math.min(Math.max((x(hi.idx) / W) * 100, 8), 92)}%`, top: 0, transform: "translateX(-50%)", pointerEvents: "none", background: "#140e0a", border: "1px solid rgba(201,168,76,.4)", borderRadius: 8, padding: "5px 10px", fontSize: 11.5, color: "#f4edd8", whiteSpace: "nowrap", boxShadow: "0 6px 20px rgba(0,0,0,.55)", zIndex: 5 }}>
            <div style={{ color: "rgba(244,237,216,.5)", fontSize: 10 }}>{p.date}</div>
            <div style={{ fontWeight: 800, color }}>{fmt(p.count)}</div>
          </div>
        )}
      </div>
      {ranged && (
        <div style={{ display: "flex", gap: 4, marginTop: 8, justifyContent: "center" }}>
          {tabs.map(([k, lbl]) => (
            <button key={k} onClick={() => { setRange(k); setHi(null); }} style={{ background: range === k ? "rgba(201,168,76,.2)" : "transparent", border: "1px solid rgba(201,168,76,.2)", color: range === k ? "#f0d080" : "rgba(244,237,216,.5)", borderRadius: 7, padding: "3px 12px", fontSize: 11, cursor: "pointer", fontFamily: "'Cinzel',serif", fontWeight: range === k ? 700 : 400 }}>{lbl}</button>
          ))}
        </div>
      )}
    </div>
  );
}
function VisitorChart({ series, keys, labels, colors }) {
  const K = keys || ["authed", "guest"]; const L = labels || ["Signed-in", "Guest"]; const C = colors || ["#c9a84c", "#7f8fa0"];
  const [range, setRange] = useState("monthly");
  const pts0 = (series && series[range]) || (series && series.monthly) || [];
  const [hi, setHi] = useState(null);
  const W = 460, H = 150, pad = 6;
  const max = Math.max(1, ...pts0.map(d => Math.max(d[K[0]] || 0, d[K[1]] || 0)));
  const n = pts0.length || 1;
  const x = (i) => pad + (i / (n - 1 || 1)) * (W - pad * 2);
  const y = (v) => H - pad - (v / max) * (H - pad * 2 - 14);
  const line = (key) => pts0.map((d, i) => `${x(i)},${y(d[key] || 0)}`).join(" ");
  const onMove = (e) => { const r = e.currentTarget.getBoundingClientRect(); const rx = ((e.clientX - r.left) / r.width) * W; let idx = Math.round(((rx - pad) / (W - pad * 2)) * (n - 1)); idx = Math.max(0, Math.min(n - 1, idx)); setHi({ idx }); };
  const p = hi && pts0[hi.idx];
  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 6, fontSize: 11, fontFamily: "'Cinzel',serif" }}>
        <span style={{ color: C[0] }}>&#9679; {L[0]}</span><span style={{ color: C[1] }}>&#9679; {L[1]}</span>
      </div>
      <div style={{ position: "relative" }} onMouseMove={onMove} onMouseLeave={() => setHi(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
          <polyline points={line(K[1])} fill="none" stroke={C[1]} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          <polyline points={line(K[0])} fill="none" stroke={C[0]} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          <text x={pad} y={12} fill="rgba(244,237,216,.4)" fontSize="10">max {max}</text>
          {p && <line x1={x(hi.idx)} y1={pad} x2={x(hi.idx)} y2={H - pad} stroke="rgba(244,237,216,.2)" strokeWidth="1" />}
          {p && <circle cx={x(hi.idx)} cy={y(p[K[0]] || 0)} r="3.5" fill={C[0]} stroke="#0a0608" strokeWidth="1.5" />}
          {p && <circle cx={x(hi.idx)} cy={y(p[K[1]] || 0)} r="3.5" fill={C[1]} stroke="#0a0608" strokeWidth="1.5" />}
        </svg>
        {p && (
          <div style={{ position: "absolute", left: `${Math.min(Math.max((x(hi.idx) / W) * 100, 8), 92)}%`, top: 0, transform: "translateX(-50%)", pointerEvents: "none", background: "#140e0a", border: "1px solid rgba(201,168,76,.4)", borderRadius: 8, padding: "6px 10px", fontSize: 11, color: "#f4edd8", whiteSpace: "nowrap", zIndex: 5, boxShadow: "0 6px 20px rgba(0,0,0,.55)" }}>
            <div style={{ color: "rgba(244,237,216,.5)", fontSize: 10 }}>{p.date}</div>
            <div style={{ color: C[0] }}>{L[0]}: {p[K[0]] || 0}</div>
            <div style={{ color: C[1] }}>{L[1]}: {p[K[1]] || 0}</div>
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 4, marginTop: 8, justifyContent: "center" }}>
        {[["weekly", "1W"], ["monthly", "1M"], ["annually", "1Y"], ["lifetime", "All"]].map(([k, lbl]) => (
          <button key={k} onClick={() => { setRange(k); setHi(null); }} style={{ background: range === k ? "rgba(201,168,76,.2)" : "transparent", border: "1px solid rgba(201,168,76,.2)", color: range === k ? "#f0d080" : "rgba(244,237,216,.5)", borderRadius: 7, padding: "3px 12px", fontSize: 11, cursor: "pointer", fontFamily: "'Cinzel',serif", fontWeight: range === k ? 700 : 400 }}>{lbl}</button>
        ))}
      </div>
    </div>
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

function tierBadge(tier) {
  const t = String(tier || "basic").toLowerCase();
  const map = { premium: ["#e8a070", "rgba(232,160,112,.15)", "rgba(232,160,112,.4)"], plus: ["#7ecfb3", "rgba(126,207,179,.15)", "rgba(126,207,179,.4)"] };
  const [c, bg, bd] = map[t] || ["rgba(244,237,216,.6)", "rgba(244,237,216,.06)", "rgba(244,237,216,.18)"];
  return <span style={{ color: c, background: bg, border: `1px solid ${bd}`, borderRadius: 20, fontSize: 9, fontWeight: 800, padding: "2px 8px", textTransform: "uppercase", letterSpacing: .6, fontFamily: "'Cinzel',serif" }}>{t}</span>;
}
function fmtDate(d) { if (!d) return "—"; try { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); } catch { return "—"; } }

function Field({ label, value }) {
  if (value == null || value === "") return null;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 9.5, color: "rgba(201,168,76,.6)", textTransform: "uppercase", letterSpacing: .7, fontFamily: "'Cinzel',serif", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 12.5, color: "#f4edd8", lineHeight: 1.5, wordBreak: "break-word" }}>{value}</div>
    </div>
  );
}

function UserDetail({ u, onBack }) {
  const L = u.links || {};
  const links = Object.entries(L).filter(([, v]) => v);
  const asList = (x) => Array.isArray(x) ? x.filter(Boolean) : (x ? String(x).split(/[,;]+/).map(s => s.trim()).filter(Boolean) : []);
  const alertArr = Array.isArray(u.jobAlerts) ? u.jobAlerts : (u.jobAlerts && typeof u.jobAlerts === "object" ? [u.jobAlerts] : []);
  const alerts = alertArr.filter(a => a && [a.roles, a.seniority, a.locations, a.companies].some(x => asList(x).length));
  return (
    <div style={{ background: "rgba(16,10,22,.55)", border: "1px solid rgba(201,168,76,.18)", borderRadius: 12, padding: 18 }}>
      <button onClick={onBack} style={{ background: "rgba(201,168,76,.08)", border: "1px solid rgba(201,168,76,.22)", color: "#f0d080", cursor: "pointer", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontFamily: "'Cinzel',serif", fontWeight: 700, marginBottom: 14 }}>← All users</button>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: 18, fontWeight: 700, color: "#f4edd8" }}>{u.name || "(no name)"}</span>
        {tierBadge(u.tier)}
        {u.emailVerified ? <span style={{ color: "#7ecfb3", fontSize: 10, fontWeight: 700 }}>✓ Verified</span> : <span style={{ color: "#e07060", fontSize: 10, fontWeight: 700 }}>✗ Unverified</span>}
      </div>
      <div style={{ fontSize: 12.5, color: "rgba(244,237,216,.65)", marginBottom: 2 }}>{u.email || "—"}</div>
      <div style={{ fontSize: 11, color: "rgba(244,237,216,.4)", marginBottom: 16 }}>Joined {fmtDate(u.created)} · Last seen {fmtDate(u.lastSignIn)} · {u.appliedCount} application{u.appliedCount === 1 ? "" : "s"} · ID {u.id}</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
        <Field label="Target Role" value={u.role} />
        <Field label="Experience" value={u.experience} />
        <Field label="Location" value={[u.location, u.country].filter(Boolean).join(" · ")} />
        <Field label="Target Salary" value={u.targetSalary} />
        <Field label="Education" value={u.education} />
        <Field label="Open To" value={(u.openTo || []).join(", ")} />
      </div>
      <Field label="Skills" value={u.skills} />
      <Field label="Bio" value={u.bio} />
      <Field label="Achievements" value={u.achievements} />

      {links.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 9.5, color: "rgba(201,168,76,.6)", textTransform: "uppercase", letterSpacing: .7, fontFamily: "'Cinzel',serif", marginBottom: 4 }}>Links</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {links.map(([k, v]) => <a key={k} href={v} target="_blank" rel="noreferrer" style={{ fontSize: 11.5, color: "#7ecfb3", background: "rgba(126,207,179,.07)", border: "1px solid rgba(126,207,179,.2)", borderRadius: 6, padding: "3px 9px", textDecoration: "none" }}>{k}</a>)}
          </div>
        </div>
      )}

      {(u.workBlocks || []).some(b => b && (b.company || b.role || b.description)) && (
        <div style={{ marginTop: 6, marginBottom: 10 }}>
          <div style={{ fontSize: 9.5, color: "rgba(201,168,76,.6)", textTransform: "uppercase", letterSpacing: .7, fontFamily: "'Cinzel',serif", marginBottom: 6 }}>Work History</div>
          {u.workBlocks.map((b, i) => (b && (b.company || b.role || b.description || b.project)) ? (
            <div key={i} style={{ borderLeft: "2px solid rgba(201,168,76,.2)", paddingLeft: 10, marginBottom: 8 }}>
              <div style={{ fontSize: 12.5, color: "#f4edd8", fontWeight: 600 }}>{[b.role, b.company].filter(Boolean).join(" · ") || b.project || "Role"}</div>
              {(b.project || b.timeframe) && <div style={{ fontSize: 10.5, color: "rgba(244,237,216,.45)" }}>{[b.project, b.timeframe].filter(Boolean).join(" · ")}</div>}
              {b.description && <div style={{ fontSize: 11.5, color: "rgba(244,237,216,.7)", marginTop: 2, whiteSpace: "pre-wrap" }}>{b.description}</div>}
              {b.achievements && <div style={{ fontSize: 11.5, color: "rgba(126,207,179,.75)", marginTop: 2, whiteSpace: "pre-wrap" }}>{b.achievements}</div>}
            </div>
          ) : null)}
        </div>
      )}
      {!(u.workBlocks || []).length && u.workHistory && <Field label="Work History" value={<span style={{ whiteSpace: "pre-wrap" }}>{u.workHistory}</span>} />}

      {alerts && alerts.length > 0 && (
        <Field label="Job Alerts" value={alerts.map((a, i) => {
          const parts = [asList(a.roles).join(", "), asList(a.seniority).join(", "), asList(a.locations).join(", "), asList(a.companies).join(", ")].filter(Boolean);
          return <div key={i} style={{ fontSize: 11.5 }}>• {parts.join(" / ") || "any"}{a.matchAll ? " (match all)" : ""}</div>;
        })} />
      )}
      {(u.notifyCompanies || []).length > 0 && <Field label={`Followed Studios (${u.notifyCompanies.length})`} value={u.notifyCompanies.join(", ")} />}

      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 9.5, color: "rgba(201,168,76,.6)", textTransform: "uppercase", letterSpacing: .7, fontFamily: "'Cinzel',serif", marginBottom: 4 }}>Résumé {u.resumeFileName ? `· ${u.resumeFileName}` : ""}</div>
        {u.resumeText
          ? <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 11.5, color: "rgba(244,237,216,.78)", background: "rgba(10,6,14,.5)", border: "1px solid rgba(201,168,76,.12)", borderRadius: 8, padding: 12, maxHeight: 420, overflow: "auto", fontFamily: "ui-monospace,Menlo,Consolas,monospace", lineHeight: 1.5, margin: 0 }}>{u.resumeText}</pre>
          : <div style={{ fontSize: 12, color: "rgba(244,237,216,.4)", fontStyle: "italic" }}>No résumé on file.</div>}
      </div>
    </div>
  );
}

function UserDirectory({ data, status, q, setQ, sel, setSel }) {
  if (status === "loading" || status === "idle") return <Panel title="Users"><div style={{ color: "rgba(244,237,216,.5)", fontSize: 13 }}>Loading users…</div></Panel>;
  if (status === "error") return <Panel title="Users"><div style={{ color: "#e07060", fontSize: 13 }}>Couldn’t load users.</div></Panel>;
  const all = (data && data.users) || [];
  const selU = sel ? all.find(u => u.id === sel) : null;
  if (selU) return <Panel title="User detail"><UserDetail u={selU} onBack={() => setSel(null)} /></Panel>;
  const needle = q.trim().toLowerCase();
  const rows = needle
    ? all.filter(u => [u.name, u.email, u.role, u.skills, u.location].some(f => String(f || "").toLowerCase().includes(needle)))
    : all;
  return (
    <Panel title={`All users (${all.length})`}>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, email, role, skills…"
        style={{ width: "100%", boxSizing: "border-box", background: "rgba(201,168,76,.06)", border: "1px solid rgba(201,168,76,.22)", color: "#f4edd8", borderRadius: 9, padding: "9px 12px", fontSize: 12.5, outline: "none", marginBottom: 12 }} />
      {rows.length === 0 ? <div style={{ color: "rgba(244,237,216,.4)", fontSize: 12, fontStyle: "italic" }}>No matches.</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 560, overflow: "auto" }}>
          {rows.map(u => (
            <div key={u.id} onClick={() => setSel(u.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, cursor: "pointer", borderBottom: "1px solid rgba(201,168,76,.06)" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(201,168,76,.06)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, color: "#f4edd8", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.name || "(no name)"} {!u.emailVerified && <span title="Email unverified" style={{ color: "#e07060", fontSize: 10 }}>✗</span>}</div>
                <div style={{ fontSize: 11, color: "rgba(244,237,216,.45)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.email}{u.role ? ` · ${u.role}` : ""}</div>
              </div>
              <span style={{ fontSize: 10.5, color: "rgba(244,237,216,.4)", whiteSpace: "nowrap" }}>{u.appliedCount > 0 ? `${u.appliedCount} app${u.appliedCount === 1 ? "" : "s"}` : ""}</span>
              {tierBadge(u.tier)}
              <span style={{ fontSize: 10.5, color: "rgba(244,237,216,.35)", whiteSpace: "nowrap", minWidth: 62, textAlign: "right" }}>{fmtDate(u.created)}</span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}