// pages/verify.js
// ATS auto-detect tool. Visit /verify in your app.
// Type a studio slug, it tests all 6 ATS platforms and tells you which one works.
import { useState } from "react";
import Head from "next/head";

const PLATFORMS = ["greenhouse", "lever", "ashby", "workable", "smartrecruiters", "recruitee", "applytojob", "bamboohr", "paylocity"];

export default function Verify() {
  const [slug, setSlug] = useState("");
  const [studioName, setStudioName] = useState("");
  const [results, setResults] = useState(null);
  const [testing, setTesting] = useState(false);

  const runTest = async () => {
    if (!slug.trim()) return;
    setTesting(true);
    setResults(null);
    const found = [];
    for (const platform of PLATFORMS) {
      try {
        const r = await fetch(`/api/jobs/ats?platform=${platform}&slug=${encodeURIComponent(slug.trim())}`);
        const data = await r.json();
        found.push({ platform, count: data.count || 0, ok: (data.count || 0) > 0 });
      } catch {
        found.push({ platform, count: 0, ok: false });
      }
    }
    setResults(found);
    setTesting(false);
  };

  const working = results?.filter(r => r.ok) || [];
  const G = "linear-gradient(135deg,#c9a84c,#e8613a)";

  return <>
    <Head><title>ATS Verify Tool — Main Quest</title></Head>
    <div style={{ minHeight: "100vh", background: "#080608", color: "#f4edd8", fontFamily: "system-ui, sans-serif", padding: "40px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, marginBottom: 8, background: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ATS Verification Tool</h1>
        <p style={{ color: "rgba(244,237,216,.6)", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          Type a studio's slug below and click Test. This checks all 6 hiring platforms and tells you which one the studio uses, plus how many live jobs it has. Once you find a match, add it to <code style={{ background: "rgba(201,168,76,.12)", padding: "2px 6px", borderRadius: 4 }}>ATS_STUDIOS</code> in pages/index.js.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
          <div>
            <label style={{ fontSize: 12, color: "rgba(201,168,76,.8)", display: "block", marginBottom: 4 }}>Studio Name (for your reference)</label>
            <input value={studioName} onChange={e => setStudioName(e.target.value)} placeholder="e.g. Naughty Dog"
              style={{ width: "100%", padding: "10px 12px", background: "rgba(201,168,76,.06)", border: "1px solid rgba(201,168,76,.2)", borderRadius: 8, color: "#f4edd8", fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "rgba(201,168,76,.8)", display: "block", marginBottom: 4 }}>Slug to test (usually company name, lowercase, no spaces)</label>
            <input value={slug} onChange={e => setSlug(e.target.value)} onKeyDown={e => e.key === "Enter" && runTest()} placeholder="e.g. naughtydog"
              style={{ width: "100%", padding: "10px 12px", background: "rgba(201,168,76,.06)", border: "1px solid rgba(201,168,76,.2)", borderRadius: 8, color: "#f4edd8", fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <button onClick={runTest} disabled={testing || !slug.trim()}
            style={{ background: G, border: "none", color: "#0a0608", padding: "12px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: testing ? "default" : "pointer", opacity: testing ? .6 : 1 }}>
            {testing ? "Testing all 6 platforms…" : "Test All Platforms"}
          </button>
        </div>

        {results && (
          <div style={{ background: "rgba(16,10,22,.6)", border: "1px solid rgba(201,168,76,.15)", borderRadius: 12, padding: 20 }}>
            {working.length > 0 ? (
              <div style={{ marginBottom: 16, padding: 14, background: "rgba(126,207,179,.1)", border: "1px solid rgba(126,207,179,.3)", borderRadius: 8 }}>
                <div style={{ color: "#7ecfb3", fontWeight: 700, marginBottom: 8 }}>✓ Match found!</div>
                {working.map(w => (
                  <div key={w.platform} style={{ fontSize: 13, marginBottom: 6 }}>
                    <strong>{w.platform}</strong> — {w.count} live jobs.<br />
                    <span style={{ color: "rgba(244,237,216,.6)" }}>Add this line to ATS_STUDIOS:</span>
                    <pre style={{ background: "rgba(0,0,0,.4)", padding: "8px 10px", borderRadius: 6, marginTop: 4, fontSize: 12, overflow: "auto" }}>
{`  "${studioName || "Studio Name"}": { platform:"${w.platform}", slug:"${slug.trim()}" },`}
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: "#e07060", marginBottom: 16, padding: 14, background: "rgba(192,50,26,.08)", border: "1px solid rgba(192,50,26,.25)", borderRadius: 8 }}>
                No platform returned jobs for slug "<strong>{slug}</strong>". Try a different slug — check the studio's careers page URL for the right one, or they may use an ATS we don't support yet.
              </div>
            )}
            <div style={{ fontSize: 12, color: "rgba(244,237,216,.45)" }}>
              <div style={{ marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Full results:</div>
              {results.map(r => (
                <div key={r.platform} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid rgba(201,168,76,.06)" }}>
                  <span>{r.ok ? "✓" : "✗"} {r.platform}</span>
                  <span>{r.count} jobs</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 30, padding: 16, background: "rgba(201,168,76,.04)", border: "1px solid rgba(201,168,76,.1)", borderRadius: 10, fontSize: 13, lineHeight: 1.7, color: "rgba(244,237,216,.6)" }}>
          <strong style={{ color: "#c9a84c" }}>How to find a slug:</strong> Open the studio's careers page and look at the URL.
          <ul style={{ marginTop: 8, paddingLeft: 18 }}>
            <li><code>boards.greenhouse.io/<strong>SLUG</strong></code></li>
            <li><code>jobs.lever.co/<strong>SLUG</strong></code></li>
            <li><code>jobs.ashbyhq.com/<strong>SLUG</strong></code></li>
            <li><code>apply.workable.com/<strong>SLUG</strong></code></li>
            <li><code>careers.smartrecruiters.com/<strong>SLUG</strong></code></li>
            <li><code><strong>SLUG</strong>.recruitee.com</code></li>
          </ul>
          If a studio's careers page doesn't use any of these (e.g. it's a custom site or Workday), it won't work with this system.
        </div>
      </div>
    </div>
  </>;
}