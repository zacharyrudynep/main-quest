import Head from "next/head";
import { useState } from "react";

const ROLES = ["Game Designer","Systems Designer","Level Designer","UI/UX Designer","Narrative Designer","Combat Designer","Quest Designer","Economy Designer","Technical Designer","Software Engineer","Gameplay Programmer","Engine Programmer","Graphics Engineer","AI Programmer","Network Programmer","Backend Engineer","DevOps Engineer","Mobile Developer","Tools Programmer","Build Engineer","Concept Artist","3D Artist","2D Artist","Character Artist","Environment Artist","Technical Artist","VFX Artist","Animator","Rigging Artist","Audio Designer","Sound Designer","SFX Artist","Composer","Audio Engineer","Music Composer","Producer","Project Manager","Scrum Master","Product Manager","QA Tester","QA Analyst","QA Lead","Community Manager","Marketing Specialist","PR Manager","HR Manager","Recruiter","Finance Analyst","Business Analyst","Data Analyst","Data Scientist","IT Support","System Administrator"];
const OPEN_TO = ["Full-time","Contract","Remote","Hybrid","On-site","Relocation"];
const COUNTRIES = ["United States","Canada","United Kingdom","Ireland","Australia","New Zealand","Germany","France","Netherlands","Sweden","Finland","Denmark","Norway","Poland","Spain","Portugal","Italy","Switzerland","Austria","Belgium","Romania","Ukraine","Japan","South Korea","China","Singapore","India","Philippines","Malaysia","Indonesia","Thailand","Vietnam","Brazil","Argentina","Mexico","Chile","Colombia","South Africa","Israel","Turkey","United Arab Emirates"];

const STEPS = [
  { key: "roles", title: "What roles are you looking for?", sub: "Pick as many as you like — we'll focus the board on these." },
  { key: "openTo", title: "What are you open to?", sub: "Choose the work styles and arrangements that fit you." },
  { key: "country", title: "Where are you based?", sub: "We'll start you off with roles in your region." },
];

export default function Personalize() {
  const [step, setStep] = useState(0);
  const [roles, setRoles] = useState([]);
  const [openTo, setOpenTo] = useState([]);
  const [country, setCountry] = useState("");

  const skip = () => { try { sessionStorage.setItem("mq_session", "1"); } catch (e) {} window.location.href = "/"; };
  const finish = () => {
    try { sessionStorage.setItem("mq_personalization", JSON.stringify({ roles, openTo, country })); } catch (e) {}
    try { sessionStorage.setItem("mq_session", "1"); } catch (e) {} // keep the new user signed in for this session
    // Full-page load so the board mounts fresh, restores the session (auto-login), and applies the starter filter.
    window.location.href = "/";
  };
  const toggleOpen = (o) => setOpenTo(v => v.includes(o) ? v.filter(x => x !== o) : [...v, o]);

  const inp = { background: "rgba(201,168,76,.06)", border: "1px solid rgba(201,168,76,.25)", color: "#f4edd8", colorScheme: "dark", borderRadius: 10, padding: "13px 15px", fontSize: 14, fontFamily: "inherit", width: "100%", boxSizing: "border-box", outline: "none", cursor: "pointer" };
  const s = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <>
      <Head>
        <title>Main Quest — Personalize Your Account</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Cinzel+Decorative:wght@700&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        @keyframes qfade{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .qstep{animation:qfade .45s cubic-bezier(.2,.7,.2,1) both}
        .qchip{transition:transform .15s, box-shadow .15s}
        .qchip:hover{transform:translateY(-1px)}
        .qopt{transition:transform .15s, background .15s, border-color .15s, box-shadow .2s}
        .qopt:hover{transform:translateY(-2px)}
        .qnav{transition:transform .15s, box-shadow .2s, background .2s, color .2s}
        .qnav:hover{transform:translateY(-2px)}
        .qnav:active{transform:translateY(0)}
      `}</style>

      <div style={{ minHeight: "100vh", background: "radial-gradient(1100px 620px at 50% -12%, rgba(139,32,32,.16), transparent), #080608", color: "#f4edd8", fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "34px 20px 48px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ filter: "drop-shadow(0 0 16px rgba(201,168,76,.55))", display: "flex" }}><SwordShield s={30} c="#c9a84c" /></div>
          <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 22, fontWeight: 700, background: "linear-gradient(135deg,#c9a84c,#e8613a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Main Quest</div>
        </div>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: "rgba(201,168,76,.7)", letterSpacing: 4, textTransform: "uppercase", marginBottom: 4 }}>Account Personalization</div>

        {/* Step dots */}
        <div style={{ display: "flex", gap: 7, marginBottom: 40 }}>
          {STEPS.map((_, i) => <div key={i} style={{ width: i === step ? 22 : 7, height: 7, borderRadius: 4, background: i === step ? "linear-gradient(90deg,#c9a84c,#f0d080)" : i < step ? "rgba(201,168,76,.5)" : "rgba(244,237,216,.12)", transition: "all .3s" }} />)}
        </div>

        {/* Question (fades in per step) */}
        <div style={{ flex: 1, width: "100%", maxWidth: 620, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div key={step} className="qstep" style={{ textAlign: "center" }}>
            <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(24px, 5vw, 38px)", fontWeight: 700, color: "#f4edd8", lineHeight: 1.2, margin: "0 0 12px", letterSpacing: .3 }}>{s.title}</h1>
            <p style={{ fontSize: 14, color: "rgba(244,237,216,.5)", margin: "0 auto 34px", maxWidth: 440, lineHeight: 1.5 }}>{s.sub}</p>

            {/* Step body */}
            {s.key === "roles" && (
              <div>
                <select value="" onChange={e => { const v = e.target.value; if (v && !roles.includes(v)) setRoles([...roles, v]); }} style={{ ...inp, maxWidth: 420, margin: "0 auto", display: "block" }}>
                  <option value="" style={{ background: "#140d14" }}>＋ Add a target role…</option>
                  {ROLES.filter(r => !roles.includes(r)).map(r => <option key={r} value={r} style={{ background: "#140d14" }}>{r}</option>)}
                </select>
                {roles.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 20, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
                  {roles.map(r => <span key={r} className="qchip" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(201,168,76,.16)", border: "1px solid rgba(201,168,76,.4)", borderRadius: 18, padding: "6px 12px", fontSize: 13, color: "#f0d080", fontFamily: "'Cinzel',serif" }}>{r}<span onClick={() => setRoles(roles.filter(x => x !== r))} style={{ cursor: "pointer", color: "rgba(232,97,58,.9)", fontSize: 13, lineHeight: 1 }}>✕</span></span>)}
                </div>}
              </div>
            )}

            {s.key === "openTo" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", maxWidth: 480, margin: "0 auto" }}>
                {OPEN_TO.map(o => { const on = openTo.includes(o); return <button key={o} className="qopt" onClick={() => toggleOpen(o)} style={{ background: on ? "linear-gradient(135deg,rgba(201,168,76,.28),rgba(240,208,128,.18))" : "rgba(244,237,216,.04)", border: `1px solid ${on ? "rgba(201,168,76,.6)" : "rgba(244,237,216,.12)"}`, color: on ? "#f0d080" : "rgba(244,237,216,.6)", cursor: "pointer", borderRadius: 22, fontSize: 14, padding: "11px 24px", fontFamily: "'Cinzel',serif", fontWeight: 600, boxShadow: on ? "0 4px 18px rgba(201,168,76,.25)" : "none" }}>{o}</button>; })}
              </div>
            )}

            {s.key === "country" && (
              <select value={country} onChange={e => setCountry(e.target.value)} style={{ ...inp, maxWidth: 420, margin: "0 auto", display: "block", textAlign: "center", textAlignLast: "center" }}>
                <option value="" style={{ background: "#140d14" }}>Select your country…</option>
                {COUNTRIES.map(c => <option key={c} value={c} style={{ background: "#140d14" }}>{c}</option>)}
              </select>
            )}
          </div>
        </div>

        {/* Nav */}
        <div style={{ width: "100%", maxWidth: 420, marginTop: 36 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <button className="qnav" onClick={step === 0 ? skip : () => setStep(step - 1)} style={{ background: "rgba(244,237,216,.05)", border: "1px solid rgba(201,168,76,.18)", color: "rgba(244,237,216,.6)", cursor: "pointer", borderRadius: 11, padding: "13px 26px", fontSize: 13, fontFamily: "'Cinzel',serif", fontWeight: 600, letterSpacing: .5 }}>{step === 0 ? "Skip" : "‹ Back"}</button>
            <button className="qnav" onClick={last ? finish : () => setStep(step + 1)} style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080)", border: "none", color: "#0a0608", cursor: "pointer", borderRadius: 11, padding: "13px 30px", fontSize: 13, fontFamily: "'Cinzel',serif", fontWeight: 800, letterSpacing: .5, boxShadow: "0 6px 22px rgba(201,168,76,.3)" }}>{last ? "Enter Main Quest →" : "Next →"}</button>
          </div>
          <p style={{ textAlign: "center", fontSize: 11, color: "rgba(244,237,216,.38)", marginTop: 14, lineHeight: 1.5 }}>You can change any of these anytime in your profile settings.</p>
        </div>
      </div>
    </>
  );
}

function SwordShield({ s = 34, c = "#c9a84c" }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <g transform="rotate(34 12 11)"><path d="M12 2.2 L13.25 5.2 V12 H10.75 V5.2 Z" /><path d="M12 5.7 V11.4" stroke={c} strokeWidth="0.7" opacity="0.65" /><path d="M9.4 13.2 H14.6" /><path d="M12 13.2 V18" /><circle cx="12" cy="19.3" r="1.1" /></g>
      <g transform="rotate(-34 12 11)"><path d="M12 2.2 L13.25 5.2 V12 H10.75 V5.2 Z" /><path d="M12 5.7 V11.4" stroke={c} strokeWidth="0.7" opacity="0.65" /><path d="M9.4 13.2 H14.6" /><path d="M12 13.2 V18" /><circle cx="12" cy="19.3" r="1.1" /></g>
    </svg>
  );
}