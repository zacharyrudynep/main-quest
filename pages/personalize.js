import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

const PLUS_M = 3.99, PLUS_Y = 39.99, PREM_M = 7.99, PREM_Y = 79.99, LIFETIME = 189.99;
const PCT_OFF_PLUS = Math.round((1 - PLUS_Y / (PLUS_M * 12)) * 100);
const PCT_OFF_PREM = Math.round((1 - PREM_Y / (PREM_M * 12)) * 100);
const FEATURES = {
  basic: ["Full job board access", "Apply & track applications", "Match score on every listing", "Follow up to 5 studios"],
  plus: ["Everything in Basic", "Full match breakdown", "Email autofill templates", "Targeted alerts", "Follow up to 15 studios"],
  premium: ["Everything in Plus", "AI resume tailoring", "AI interview prep", "AI email generation", "40 AI uses / month"],
};

const ROLES = ["Game Designer","Systems Designer","Level Designer","UI/UX Designer","Narrative Designer","Combat Designer","Quest Designer","Economy Designer","Technical Designer","Software Engineer","Gameplay Programmer","Engine Programmer","Graphics Engineer","AI Programmer","Network Programmer","Backend Engineer","DevOps Engineer","Mobile Developer","Tools Programmer","Build Engineer","Concept Artist","3D Artist","2D Artist","Character Artist","Environment Artist","Technical Artist","VFX Artist","Animator","Rigging Artist","Audio Designer","Sound Designer","SFX Artist","Composer","Audio Engineer","Music Composer","Producer","Project Manager","Scrum Master","Product Manager","QA Tester","QA Analyst","QA Lead","Community Manager","Marketing Specialist","PR Manager","HR Manager","Recruiter","Finance Analyst","Business Analyst","Data Analyst","Data Scientist","IT Support","System Administrator"];
const OPEN_TO = ["Full-time","Contract","Remote","Hybrid","On-site","Relocation"];
const COUNTRIES = ["United States","Canada","United Kingdom","Ireland","Australia","New Zealand","Germany","France","Netherlands","Sweden","Finland","Denmark","Norway","Poland","Spain","Portugal","Italy","Switzerland","Austria","Belgium","Romania","Ukraine","Japan","South Korea","China","Singapore","India","Philippines","Malaysia","Indonesia","Thailand","Vietnam","Brazil","Argentina","Mexico","Chile","Colombia","South Africa","Israel","Turkey","United Arab Emirates"];

const SEGMENTS = [
  { v: "student", label: "Student", sub: "Currently enrolled" },
  { v: "grad", label: "Post Grad", sub: "Recently graduated / breaking in" },
  { v: "veteran", label: "Industry Veteran", sub: "Already working in the industry" },
];
const HEARD = [
  { v: "linkedin", label: "LinkedIn" },
  { v: "google", label: "Google / Search" },
  { v: "word_of_mouth", label: "Word of mouth" },
  { v: "school", label: "School / University" },
  { v: "other", label: "Other" },
];

const PROGRESS = { segment: 12, student: 30, tier: 30, heard: 50, roles: 68, openTo: 84, country: 96 };

export default function Personalize() {
  const router = useRouter();
  const [view, setView] = useState("segment"); // segment|student|tier|heard|roles|openTo|country
  const [uid, setUid] = useState(null);
  const [userEmail, setUserEmail] = useState("");

  const [segment, setSegment] = useState(null);
  const [heard, setHeard] = useState(null);
  const [heardOther, setHeardOther] = useState("");
  const [roles, setRoles] = useState([]);
  const [openTo, setOpenTo] = useState([]);
  const [country, setCountry] = useState("");

  // student code sub-flow
  const [scodeStep, setScodeStep] = useState("ask"); // ask|code|email|otp|done
  const [code, setCode] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [scodeErr, setScodeErr] = useState("");
  const [scodeBusy, setScodeBusy] = useState(false);
  const [granted, setGranted] = useState(false); // premium granted (code or paid)

  // tier
  const [tier, setTier] = useState(null); // basic|plus|premium
  const [plusCycle, setPlusCycle] = useState("yearly");
  const [premCycle, setPremCycle] = useState("yearly");
  const [tierErr, setTierErr] = useState("");
  const [tierBusy, setTierBusy] = useState(false);

  async function getToken() {
    const { data } = await supabase.auth.getSession();
    return data && data.session && data.session.access_token;
  }
  async function writeProfileMerge(fields) {
    try {
      const { data: s } = await supabase.auth.getSession();
      const id = s && s.session && s.session.user && s.session.user.id;
      if (!id) return;
      const { data: cur } = await supabase.from("profiles").select("data").eq("id", id).single();
      const d = (cur && cur.data && typeof cur.data === "object") ? cur.data : {};
      await supabase.from("profiles").update({ data: { ...d, ...fields } }).eq("id", id);
    } catch (e) {}
  }

  // Load session + handle the return trip from Stripe.
  useEffect(() => {
    if (!router.isReady) return;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data && data.session;
      if (session && session.user) { setUid(session.user.id); setUserEmail(session.user.email || ""); }
      const { checkout, session_id } = router.query;
      if (checkout === "success") {
        try { const w = JSON.parse(sessionStorage.getItem("mq_wizard") || "null"); if (w && w.segment) setSegment(w.segment); } catch (e) {}
        if (session_id && session && session.user) {
          try { await fetch("/api/stripe/finalize", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: session_id, userId: session.user.id }) }); } catch (e) {}
        }
        setGranted(true);
        setView("heard");
        router.replace("/personalize", undefined, { shallow: true });
      } else if (checkout === "cancel") {
        try { const w = JSON.parse(sessionStorage.getItem("mq_wizard") || "null"); if (w && w.segment) setSegment(w.segment); } catch (e) {}
        setView("tier");
        router.replace("/personalize", undefined, { shallow: true });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  const goBoard = () => {
    try { sessionStorage.setItem("mq_personalization", JSON.stringify({ roles, openTo, country })); } catch (e) {}
    try { sessionStorage.setItem("mq_session", "1"); } catch (e) {}
    window.location.href = "/";
  };
  const finish = async () => {
    await writeProfileMerge({ segment, heardAbout: heard, heardAboutOther: heard === "other" ? heardOther.trim() : "" });
    goBoard();
  };

  // ── Phase A transitions ──
  const afterSegment = async () => {
    await writeProfileMerge({ segment });
    if (segment === "student") { setScodeStep("ask"); setView("student"); }
    else setView("tier");
  };
  const studentSkip = () => setView("tier");

  async function validateCode() {
    setScodeErr(""); setScodeBusy(true);
    try {
      const r = await fetch("/api/student/validate-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: code.trim() }) });
      const j = await r.json();
      if (j.valid) setScodeStep("email");
      else setScodeErr(j.reason || "That code isn't valid.");
    } catch (e) { setScodeErr("Couldn't check that code — try again."); }
    finally { setScodeBusy(false); }
  }
  async function sendOtp() {
    setScodeErr(""); setScodeBusy(true);
    try {
      const token = await getToken();
      const r = await fetch("/api/student/send-otp", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ email: schoolEmail.trim() }) });
      const j = await r.json();
      if (r.ok) setScodeStep("otp");
      else setScodeErr(j.error || "Couldn't send a code to that email.");
    } catch (e) { setScodeErr("Couldn't send a code — try again."); }
    finally { setScodeBusy(false); }
  }
  async function redeem() {
    setScodeErr(""); setScodeBusy(true);
    try {
      const token = await getToken();
      const r = await fetch("/api/student/redeem", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ email: schoolEmail.trim(), otp: otp.trim(), code: code.trim() }) });
      const j = await r.json();
      if (r.ok) { setGranted(true); setScodeStep("done"); }
      else setScodeErr(j.error || "Couldn't verify that code.");
    } catch (e) { setScodeErr("Something went wrong — try again."); }
    finally { setScodeBusy(false); }
  }

  async function goCheckout() {
    setTierErr("");
    if (tier === "basic") { setView("heard"); return; }
    if (!tier) { setTierErr("Choose a plan to continue."); return; }
    setTierBusy(true);
    const cyc = tier === "plus" ? plusCycle : premCycle;
    await writeProfileMerge({ segment });
    try { sessionStorage.setItem("mq_wizard", JSON.stringify({ segment })); } catch (e) {}
    try {
      const r = await fetch("/api/stripe/wizard-checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: userEmail, plan: tier, cycle: cyc, userId: uid }) });
      const j = await r.json();
      if (j.url) { window.location.href = j.url; return; }
      setTierErr(j.error || "Couldn't start checkout.");
    } catch (e) { setTierErr("Couldn't start checkout — try again."); }
    setTierBusy(false);
  }

  const inp = { background: "rgba(201,168,76,.06)", border: "1px solid rgba(201,168,76,.25)", color: "#f4edd8", colorScheme: "dark", borderRadius: 10, padding: "13px 15px", fontSize: 14, fontFamily: "inherit", width: "100%", boxSizing: "border-box", outline: "none" };
  const navBtn = (label, onClick, primary, disabled) => (
    <button className="qnav" disabled={disabled} onClick={onClick} style={{ background: primary ? "linear-gradient(135deg,#c9a84c,#f0d080)" : "rgba(244,237,216,.05)", border: primary ? "none" : "1px solid rgba(201,168,76,.18)", color: primary ? "#0a0608" : "rgba(244,237,216,.6)", cursor: disabled ? "default" : "pointer", borderRadius: 11, padding: primary ? "13px 30px" : "13px 26px", fontSize: 13, fontFamily: "'Cinzel',serif", fontWeight: primary ? 800 : 600, letterSpacing: .5, boxShadow: primary ? "0 6px 22px rgba(201,168,76,.3)" : "none", opacity: disabled ? .5 : 1 }}>{label}</button>
  );

  const pct = PROGRESS[view] || 10;

  return (
    <>
      <Head>
        <title>Main Quest — Set Up Your Account</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Cinzel+Decorative:wght@700&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        @keyframes qfade{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .qstep{animation:qfade .4s cubic-bezier(.2,.7,.2,1) both}
        .qopt{transition:transform .15s, background .15s, border-color .15s, box-shadow .2s}
        .qopt:hover{transform:translateY(-2px)}
        .qnav{transition:transform .15s, box-shadow .2s}
        .qnav:hover{transform:translateY(-2px)}
        .qnav:active{transform:translateY(0)}
        .qgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;align-items:stretch;max-width:880px;margin:0 auto;}
        @media(max-width:820px){.qgrid{grid-template-columns:1fr;gap:16px;max-width:420px;}}
        .qcard{position:relative;background:#0e0a12;border:1px solid rgba(201,168,76,.18);border-radius:16px;padding:24px 18px;cursor:pointer;transition:transform .2s,border-color .2s,box-shadow .3s;display:flex;flex-direction:column;text-align:center;}
        .qcard:hover{transform:translateY(-4px);}
        .qprem{background:linear-gradient(165deg,rgba(201,168,76,.1),rgba(16,10,22,.9));border-color:rgba(201,168,76,.36);}
        .qglow{background:linear-gradient(160deg,rgba(232,140,58,.16),rgba(16,10,22,.92));border-color:rgba(240,160,80,.5);box-shadow:0 0 30px rgba(232,120,58,.22);}
        .qcard.qsel{border-color:#c9a84c;box-shadow:inset 0 0 42px rgba(201,168,76,.16),0 0 24px rgba(201,168,76,.32);}
        .qbadge{position:absolute;top:-10px;left:50%;transform:translateX(-50%);font-family:'Cinzel',serif;font-size:9px;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:3px 12px;border-radius:20px;white-space:nowrap;z-index:2;}
      `}</style>

      <div style={{ minHeight: "100vh", background: "radial-gradient(1100px 620px at 50% -12%, rgba(139,32,32,.16), transparent), #080608", color: "#f4edd8", fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "34px 20px 48px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ filter: "drop-shadow(0 0 16px rgba(201,168,76,.55))", display: "flex" }}><SwordShield s={30} c="#c9a84c" /></div>
          <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 22, fontWeight: 700, background: "linear-gradient(135deg,#c9a84c,#e8613a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Main Quest</div>
        </div>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: "rgba(201,168,76,.7)", letterSpacing: 4, textTransform: "uppercase", marginBottom: 20 }}>Set Up Your Account</div>

        {/* Progress bar */}
        <div style={{ width: "100%", maxWidth: 420, height: 6, borderRadius: 4, background: "rgba(244,237,216,.08)", overflow: "hidden", marginBottom: 40 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#c9a84c,#f0d080)", borderRadius: 4, transition: "width .4s" }} />
        </div>

        <div style={{ flex: 1, width: "100%", maxWidth: 640, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div key={view + scodeStep} className="qstep" style={{ textAlign: "center" }}>

            {/* ── SEGMENT ── */}
            {view === "segment" && (
              <>
                <H>Which best describes you?</H>
                <Sub>This helps us tailor Main Quest to where you are in your journey.</Sub>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 420, margin: "0 auto" }}>
                  {SEGMENTS.map(sg => { const on = segment === sg.v; return (
                    <button key={sg.v} className="qopt" onClick={() => setSegment(sg.v)} style={{ textAlign: "left", background: on ? "linear-gradient(135deg,rgba(201,168,76,.28),rgba(240,208,128,.14))" : "rgba(244,237,216,.04)", border: `1px solid ${on ? "rgba(201,168,76,.6)" : "rgba(244,237,216,.12)"}`, color: on ? "#f0d080" : "rgba(244,237,216,.75)", cursor: "pointer", borderRadius: 14, padding: "16px 18px", fontFamily: "'Cinzel',serif", boxShadow: on ? "0 4px 18px rgba(201,168,76,.22)" : "none" }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{sg.label}</div>
                      <div style={{ fontSize: 12, color: "rgba(244,237,216,.5)", marginTop: 2, fontFamily: "system-ui,sans-serif" }}>{sg.sub}</div>
                    </button>
                  ); })}
                </div>
                <Nav left={null} right={navBtn("Next →", afterSegment, true, !segment)} />
              </>
            )}

            {/* ── STUDENT CODE ── */}
            {view === "student" && (
              <>
                <H>Student free trial</H>
                <Sub>Have a Breaking In student code? Redeem it for <b style={{ color: "#f0d080" }}>30 days of Premium, free</b>. You can also do this later in Settings.</Sub>

                {scodeStep === "ask" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 380, margin: "0 auto" }}>
                    <button className="qopt" onClick={() => setScodeStep("code")} style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080)", border: "none", color: "#0a0608", cursor: "pointer", borderRadius: 12, padding: "15px", fontSize: 14, fontWeight: 800, fontFamily: "'Cinzel',serif", boxShadow: "0 6px 22px rgba(201,168,76,.3)" }}>I have a code</button>
                    <button className="qopt" onClick={studentSkip} style={{ background: "rgba(244,237,216,.05)", border: "1px solid rgba(201,168,76,.18)", color: "rgba(244,237,216,.6)", cursor: "pointer", borderRadius: 12, padding: "13px", fontSize: 13, fontFamily: "'Cinzel',serif", fontWeight: 600 }}>Skip for now</button>
                  </div>
                )}

                {scodeStep === "code" && (
                  <div style={{ maxWidth: 360, margin: "0 auto" }}>
                    <input style={{ ...inp, textAlign: "center", letterSpacing: 1 }} value={code} onChange={e => setCode(e.target.value)} placeholder="Enter your student code" />
                    <button onClick={validateCode} disabled={!code.trim() || scodeBusy} style={{ ...primaryStyle, marginTop: 12, opacity: (!code.trim() || scodeBusy) ? .6 : 1 }}>{scodeBusy ? "Checking…" : "Continue →"}</button>
                  </div>
                )}

                {scodeStep === "email" && (
                  <div style={{ maxWidth: 400, margin: "0 auto" }}>
                    <div style={{ fontSize: 12.5, color: "rgba(244,237,216,.6)", lineHeight: 1.6, marginBottom: 14, background: "rgba(201,168,76,.06)", border: "1px solid rgba(201,168,76,.2)", borderRadius: 10, padding: "12px 14px" }}>
                      Enter your <b style={{ color: "#f0d080" }}>school email</b> to confirm you're a student. We'll send a 6-digit code.<br /><b style={{ color: "#f0d080" }}>This only verifies eligibility — it is NOT your login.</b> Your account stays on the email you signed up with.
                    </div>
                    <input style={{ ...inp, textAlign: "center" }} value={schoolEmail} onChange={e => setSchoolEmail(e.target.value)} placeholder="you@university.edu" type="email" />
                    <button onClick={sendOtp} disabled={!schoolEmail.trim() || scodeBusy} style={{ ...primaryStyle, marginTop: 12, opacity: (!schoolEmail.trim() || scodeBusy) ? .6 : 1 }}>{scodeBusy ? "Sending…" : "Send code →"}</button>
                    <div style={{ fontSize: 10.5, color: "rgba(244,237,216,.4)", marginTop: 10, lineHeight: 1.5 }}>Must be a standard university email (.edu, .ac.uk, .edu.au, etc.). Trouble? <a href="/support" style={{ color: "#c9a84c" }}>Contact support</a> and we'll verify you quickly.</div>
                  </div>
                )}

                {scodeStep === "otp" && (
                  <div style={{ maxWidth: 340, margin: "0 auto" }}>
                    <div style={{ fontSize: 12.5, color: "rgba(244,237,216,.6)", marginBottom: 14 }}>We sent a 6-digit code to <b style={{ color: "#f0d080" }}>{schoolEmail}</b>.</div>
                    <input style={{ ...inp, textAlign: "center", letterSpacing: 8, fontSize: 22, fontFamily: "'Cinzel',serif" }} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="______" inputMode="numeric" />
                    <button onClick={redeem} disabled={otp.length < 6 || scodeBusy} style={{ ...primaryStyle, marginTop: 12, opacity: (otp.length < 6 || scodeBusy) ? .6 : 1 }}>{scodeBusy ? "Verifying…" : "Verify & unlock Premium →"}</button>
                    <button onClick={() => { setScodeStep("email"); setOtp(""); setScodeErr(""); }} style={{ background: "none", border: "none", color: "rgba(201,168,76,.7)", cursor: "pointer", fontSize: 11, fontFamily: "'Cinzel',serif", marginTop: 12 }}>Use a different email</button>
                  </div>
                )}

                {scodeStep === "done" && (
                  <div style={{ maxWidth: 380, margin: "0 auto" }}>
                    <div style={{ fontSize: 46, marginBottom: 8 }}>🎉</div>
                    <div style={{ fontFamily: "'Cinzel',serif", fontSize: 18, color: "#f0d080", marginBottom: 6 }}>Premium unlocked for 30 days!</div>
                    <div style={{ fontSize: 13, color: "rgba(244,237,216,.6)", lineHeight: 1.6 }}>All Premium features are now active on your account. After 30 days you'll move to Basic — no charge, no card needed.</div>
                    <button onClick={() => setView("heard")} style={{ ...primaryStyle, marginTop: 18 }}>Continue →</button>
                  </div>
                )}

                {scodeErr && <div style={{ color: "#e8a070", fontSize: 12, marginTop: 14, lineHeight: 1.5, maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>{scodeErr}</div>}
                {scodeStep !== "done" && <Nav left={navBtn("‹ Back", () => { if (scodeStep === "ask") setView("segment"); else { setScodeStep("ask"); setScodeErr(""); } })} right={null} />}
              </>
            )}

            {/* ── TIER ── */}
            {view === "tier" && (
              <>
                <H>Choose your path</H>
                <Sub>Pick a plan to continue. You can upgrade or change this anytime.</Sub>
                <div className="qgrid">
                  <TierCard tone="basic" name="Basic" price={0} unit=" free" note="No credit card" on={tier === "basic"} onPick={() => setTier("basic")} feats={FEATURES.basic} />
                  <TierCard tone="plus" name="Plus" price={plusCycle === "yearly" ? PLUS_Y : PLUS_M} unit={plusCycle === "yearly" ? "/yr" : "/mo"} note={plusCycle === "yearly" ? `Save ${PCT_OFF_PLUS}% vs monthly` : "Billed monthly"} on={tier === "plus"} onPick={() => setTier("plus")} cycle={<CycleToggle opts={["monthly", "yearly"]} val={plusCycle} set={setPlusCycle} />} feats={FEATURES.plus} />
                  <TierCard tone="premium" name="Premium" badge="Most Popular" price={premCycle === "lifetime" ? LIFETIME : premCycle === "yearly" ? PREM_Y : PREM_M} unit={premCycle === "lifetime" ? " once" : premCycle === "yearly" ? "/yr" : "/mo"} note={premCycle === "lifetime" ? "Pay once — yours forever" : premCycle === "yearly" ? `Save ${PCT_OFF_PREM}% vs monthly` : "Billed monthly"} on={tier === "premium"} onPick={() => setTier("premium")} cycle={<CycleToggle opts={["monthly", "yearly", "lifetime"]} val={premCycle} set={setPremCycle} />} feats={FEATURES.premium} />
                </div>
                {tierErr && <div style={{ color: "#e8a070", fontSize: 12, marginTop: 14 }}>{tierErr}</div>}
                <Nav left={navBtn("‹ Back", () => setView("segment"))} right={navBtn(tier === "basic" ? "Continue →" : tier ? "Continue to Payment →" : "Select a plan", goCheckout, true, !tier || tierBusy)} />
              </>
            )}

            {/* ── HEARD ── */}
            {view === "heard" && (
              <>
                <H>How did you hear about us?</H>
                <Sub>Totally optional — it just helps us know where to focus.</Sub>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", maxWidth: 480, margin: "0 auto" }}>
                  {HEARD.map(h => { const on = heard === h.v; return (
                    <button key={h.v} className="qopt" onClick={() => setHeard(h.v)} style={{ background: on ? "linear-gradient(135deg,rgba(201,168,76,.28),rgba(240,208,128,.18))" : "rgba(244,237,216,.04)", border: `1px solid ${on ? "rgba(201,168,76,.6)" : "rgba(244,237,216,.12)"}`, color: on ? "#f0d080" : "rgba(244,237,216,.6)", cursor: "pointer", borderRadius: 22, fontSize: 14, padding: "11px 22px", fontFamily: "'Cinzel',serif", fontWeight: 600 }}>{h.label}</button>
                  ); })}
                </div>
                {heard === "other" && <input style={{ ...inp, maxWidth: 400, margin: "18px auto 0", display: "block", textAlign: "center" }} value={heardOther} onChange={e => setHeardOther(e.target.value)} placeholder="Where did you hear about us?" />}
                <Nav left={null} right={navBtn("Next →", () => setView("roles"), true, !heard || (heard === "other" && !heardOther.trim()))} />
              </>
            )}

            {/* ── ROLES ── */}
            {view === "roles" && (
              <>
                <H>What roles are you looking for?</H>
                <Sub>Pick as many as you like — we'll focus the board on these.</Sub>
                <select value="" onChange={e => { const v = e.target.value; if (v && !roles.includes(v)) setRoles([...roles, v]); }} style={{ ...inp, maxWidth: 420, margin: "0 auto", display: "block", cursor: "pointer" }}>
                  <option value="" style={{ background: "#140d14" }}>＋ Add a target role…</option>
                  {ROLES.filter(r => !roles.includes(r)).map(r => <option key={r} value={r} style={{ background: "#140d14" }}>{r}</option>)}
                </select>
                {roles.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 20, maxWidth: 520, margin: "20px auto 0" }}>
                  {roles.map(r => <span key={r} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(201,168,76,.16)", border: "1px solid rgba(201,168,76,.4)", borderRadius: 18, padding: "6px 12px", fontSize: 13, color: "#f0d080", fontFamily: "'Cinzel',serif" }}>{r}<span onClick={() => setRoles(roles.filter(x => x !== r))} style={{ cursor: "pointer", color: "rgba(232,97,58,.9)", fontSize: 13, lineHeight: 1 }}>✕</span></span>)}
                </div>}
                <Nav left={navBtn("‹ Back", () => setView("heard"))} right={navBtn("Next →", () => setView("openTo"), true)} />
                <SkipRest onClick={finish} />
              </>
            )}

            {/* ── OPEN TO ── */}
            {view === "openTo" && (
              <>
                <H>What are you open to?</H>
                <Sub>Choose the work styles and arrangements that fit you.</Sub>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", maxWidth: 480, margin: "0 auto" }}>
                  {OPEN_TO.map(o => { const on = openTo.includes(o); return <button key={o} className="qopt" onClick={() => setOpenTo(v => v.includes(o) ? v.filter(x => x !== o) : [...v, o])} style={{ background: on ? "linear-gradient(135deg,rgba(201,168,76,.28),rgba(240,208,128,.18))" : "rgba(244,237,216,.04)", border: `1px solid ${on ? "rgba(201,168,76,.6)" : "rgba(244,237,216,.12)"}`, color: on ? "#f0d080" : "rgba(244,237,216,.6)", cursor: "pointer", borderRadius: 22, fontSize: 14, padding: "11px 24px", fontFamily: "'Cinzel',serif", fontWeight: 600 }}>{o}</button>; })}
                </div>
                <Nav left={navBtn("‹ Back", () => setView("roles"))} right={navBtn("Next →", () => setView("country"), true)} />
                <SkipRest onClick={finish} />
              </>
            )}

            {/* ── COUNTRY ── */}
            {view === "country" && (
              <>
                <H>Where are you based?</H>
                <Sub>We'll start you off with roles in your region.</Sub>
                <select value={country} onChange={e => setCountry(e.target.value)} style={{ ...inp, maxWidth: 420, margin: "0 auto", display: "block", textAlign: "center", textAlignLast: "center", cursor: "pointer" }}>
                  <option value="" style={{ background: "#140d14" }}>Select your country…</option>
                  {COUNTRIES.map(c => <option key={c} value={c} style={{ background: "#140d14" }}>{c}</option>)}
                </select>
                <Nav left={navBtn("‹ Back", () => setView("openTo"))} right={navBtn("Enter Main Quest →", finish, true)} />
              </>
            )}
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: "rgba(244,237,216,.38)", marginTop: 20, lineHeight: 1.5 }}>You can change any of these anytime in your profile settings.</p>
      </div>
    </>
  );
}

const primaryStyle = { width: "100%", border: "none", borderRadius: 11, padding: 14, fontSize: 14, fontWeight: 800, fontFamily: "'Cinzel',serif", letterSpacing: .5, background: "linear-gradient(135deg,#c9a84c,#f0d080)", color: "#0a0608", cursor: "pointer", boxShadow: "0 6px 22px rgba(201,168,76,.3)" };

function H({ children }) { return <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: "clamp(22px, 5vw, 34px)", fontWeight: 700, color: "#f4edd8", lineHeight: 1.2, margin: "0 0 12px", letterSpacing: .3 }}>{children}</h1>; }
function Sub({ children }) { return <p style={{ fontSize: 14, color: "rgba(244,237,216,.5)", margin: "0 auto 30px", maxWidth: 460, lineHeight: 1.55 }}>{children}</p>; }
function SkipRest({ onClick }) {
  return <div style={{ textAlign: "center", marginTop: 12 }}><button onClick={onClick} style={{ background: "none", border: "none", color: "rgba(201,168,76,.6)", cursor: "pointer", fontSize: 11.5, fontFamily: "'Cinzel',serif", textDecoration: "underline" }}>Skip the rest →</button></div>;
}
function Nav({ left, right }) {
  return (
    <div style={{ width: "100%", maxWidth: 420, margin: "36px auto 0", display: "flex", justifyContent: "space-between", gap: 12 }}>
      {left || <span />}{right || <span />}
    </div>
  );
}

function TierCard({ tone, name, price, unit, note, badge, on, onPick, feats, cycle }) {
  const accent = tone === "premium" ? "#f7d98a" : tone === "plus" ? "#f0d080" : "rgba(244,237,216,.75)";
  const cls = "qcard" + (tone === "plus" ? " qprem" : "") + (tone === "premium" ? " qprem qglow" : "") + (on ? " qsel" : "");
  return (
    <div className={cls} onClick={onPick}>
      {badge && <div className="qbadge" style={{ background: "linear-gradient(135deg,#f0d080,#e8613a)", color: "#1a0e06", boxShadow: "0 4px 16px rgba(232,120,58,.5)" }}>{badge}</div>}
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: 14, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 800, color: accent }}>{name}</div>
      <div style={{ margin: "10px 0 2px" }}>
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: 40, fontWeight: 800, color: accent }}>{typeof price === "number" ? "$" + price : price}</span>
        <span style={{ fontSize: 13, color: "rgba(244,237,216,.45)", fontWeight: 600 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 10.5, color: tone === "basic" ? "rgba(244,237,216,.4)" : "#7ecfb3", minHeight: 14, marginBottom: 14, fontWeight: 600 }}>{note || ""}</div>
      {cycle && <div onClick={e => e.stopPropagation()} style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>{cycle}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1, textAlign: "left" }}>
        {feats.map((f, i) => <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "rgba(244,237,216,.72)", lineHeight: 1.4 }}><span style={{ color: accent, flexShrink: 0, marginTop: 1 }}>✦</span>{f}</div>)}
      </div>
      <div style={{ marginTop: 18, fontSize: 11, fontFamily: "'Cinzel',serif", letterSpacing: .5, color: on ? "#0a0608" : "rgba(244,237,216,.5)", background: on ? "linear-gradient(135deg,#c9a84c,#f0d080)" : "rgba(201,168,76,.06)", border: `1px solid ${on ? "transparent" : "rgba(201,168,76,.2)"}`, borderRadius: 9, padding: "10px", fontWeight: 700 }}>{on ? "✓ Selected" : "Select"}</div>
    </div>
  );
}

function CycleToggle({ opts, val, set }) {
  return (
    <div style={{ display: "inline-flex", background: "rgba(10,7,8,.5)", border: "1px solid rgba(201,168,76,.25)", borderRadius: 12, padding: 2, flexWrap: "wrap" }}>
      {opts.map(o => <button key={o} type="button" onClick={() => set(o)} style={{ background: val === o ? "linear-gradient(135deg,#c9a84c,#f0d080)" : "transparent", color: val === o ? "#0a0608" : "rgba(244,237,216,.65)", border: "none", borderRadius: 10, padding: "5px 11px", fontSize: 10, fontWeight: 700, fontFamily: "'Cinzel',serif", cursor: "pointer", textTransform: "capitalize" }}>{o}</button>)}
    </div>
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