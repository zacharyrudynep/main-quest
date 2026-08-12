import Head from "next/head";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const GOLD = "#c9a84c", G = "linear-gradient(135deg,#c9a84c,#e8613a)";

export default function Admin() {
  const [status, setStatus] = useState("loading"); // loading | denied | error | ready
  const [s, setS] = useState(null);

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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 26 }}>
            <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 22, fontWeight: 700, background: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Main Quest — Admin</div>
            <a href="/" style={{ textDecoration: "none", color: "rgba(244,237,216,.55)", fontSize: 12, fontFamily: "'Cinzel',serif" }}>← Back to board</a>
          </div>

          {status === "loading" && <Note>Loading…</Note>}
          {status === "denied" && <Note>Access denied. This page is for the site owner only. <a href="/" style={{ color: GOLD }}>Sign in</a> with the owner account first.</Note>}
          {status === "error" && <Note>Couldn't load stats. Check that the <code>events</code> table exists and <code>ADMIN_EMAIL</code> is set.</Note>}

          {status === "ready" && s && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 24 }}>
                <Kpi label="Total Users" value={s.totalUsers} />
                <Kpi label="Premium Users" value={s.premiumUsers} sub={`${s.premiumPct}% of users`} accent="#7ecfb3" />
                <Kpi label="Applications Tracked" value={s.totalApplications} />
                <Kpi label="Apply Clicks" value={s.totalClicks} accent="#e8a070" />
                <Kpi label="Shares" value={s.totalShares} accent="#e8a070" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 16, marginBottom: 16 }}>
                <Panel title="Signups (last 30 days)"><LineChart data={s.signupSeries} color="#c9a84c" /></Panel>
                <Panel title="Applications (last 30 days)"><LineChart data={s.appSeries} color="#7ecfb3" /></Panel>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 16, marginBottom: 16 }}>
                <Panel title="Most-clicked jobs"><BarList rows={s.topClicked} empty="No apply clicks recorded yet." /></Panel>
                <Panel title="Most-shared jobs"><BarList rows={s.topShared} empty="No shares recorded yet." /></Panel>
              </div>

              <Panel title="All events">
                {Object.keys(s.eventTotals || {}).length === 0
                  ? <div style={{ color: "rgba(244,237,216,.4)", fontSize: 12, fontStyle: "italic" }}>No events recorded yet.</div>
                  : <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {Object.entries(s.eventTotals).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
                      <span key={k} style={{ background: "rgba(201,168,76,.08)", border: "1px solid rgba(201,168,76,.2)", borderRadius: 20, padding: "5px 13px", fontSize: 12 }}><span style={{ color: "rgba(244,237,216,.6)" }}>{k}</span> <b style={{ color: GOLD }}>{v}</b></span>
                    ))}
                  </div>}
              </Panel>

              <div style={{ fontSize: 10.5, color: "rgba(244,237,216,.3)", marginTop: 18, lineHeight: 1.6 }}>
                Generated {new Date(s.generatedAt).toLocaleString()} · Active-user & traffic stats live in Vercel Analytics; funnels & retention in PostHog.
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
function Kpi({ label, value, sub, accent = "#c9a84c" }) {
  return (
    <div style={{ background: "rgba(16,10,22,.6)", border: "1px solid rgba(201,168,76,.16)", borderRadius: 12, padding: "16px 18px" }}>
      <div style={{ fontSize: 10.5, color: "rgba(244,237,216,.5)", textTransform: "uppercase", letterSpacing: .6, fontFamily: "'Cinzel',serif", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: accent, fontFamily: "'Cinzel',serif", lineHeight: 1 }}>{(value ?? 0).toLocaleString()}</div>
      {sub && <div style={{ fontSize: 11, color: "rgba(244,237,216,.4)", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}
function Panel({ title, children }) {
  return (
    <div style={{ background: "rgba(16,10,22,.5)", border: "1px solid rgba(201,168,76,.14)", borderRadius: 14, padding: "16px 18px" }}>
      <div style={{ fontSize: 12, color: "#f0d080", fontFamily: "'Cinzel',serif", fontWeight: 700, letterSpacing: .4, marginBottom: 14 }}>{title}</div>
      {children}
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
function BarList({ rows, empty }) {
  if (!rows || rows.length === 0) return <div style={{ color: "rgba(244,237,216,.4)", fontSize: 12, fontStyle: "italic" }}>{empty}</div>;
  const max = Math.max(1, ...rows.map(r => r.count));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {rows.map((r, i) => {
        const name = (r.label || "").split("|").slice(0, 2).join(" · ");
        return (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "rgba(244,237,216,.75)", marginBottom: 3 }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "82%" }}>{name}</span>
              <b style={{ color: "#c9a84c" }}>{r.count}</b>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: "rgba(244,237,216,.08)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(r.count / max) * 100}%`, background: "linear-gradient(90deg,#c9a84c,#e8613a)", borderRadius: 3 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}