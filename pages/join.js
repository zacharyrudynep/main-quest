import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

const TOS_VERSION = "2026-06-20";
const PLUS_M = 3.99, PLUS_Y = 39.99, PREM_M = 7.99, PREM_Y = 79.99, LIFETIME = 189.99;
const PCT_OFF = Math.round((1 - PREM_Y / (PREM_M * 12)) * 100);

const FEATURES = {
  basic: [
    "Full access to the entire job board",
    "Apply to any listing",
    "Track all your applications",
    "Follow up to 5 companies for alerts",
    "Job match score on every listing",
  ],
  plus: [
    "Everything in Basic",
    "Full match score breakdown",
    "Email autofill templates",
    "Targeted alerts by role, location, company & seniority",
    "Follow up to 15 companies",
  ],
  premium: [
    "Everything in Plus",
    "AI resume tailoring",
    "AI email autofill & template generation",
    "AI company interview prep",
    "40 AI uses / month + unlimited company alerts",
  ],
};

export default function Join() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [selected, setSelected] = useState(null); // "basic" | "plus" | "premium"
  const [plusCycle, setPlusCycle] = useState("yearly"); // "monthly" | "yearly"
  const [premCycle, setPremCycle] = useState("yearly"); // "monthly" | "yearly" | "lifetime"
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [finishing, setFinishing] = useState(false); // completing after paid checkout

  // Handle the return trip from Stripe Checkout.
  useEffect(() => {
    if (!router.isReady) return;
    const { checkout, session_id } = router.query;
    if (checkout === "success") {
      completePaidSignup(session_id);
    } else if (checkout === "cancel") {
      // Restore what they had typed so they can pick again (or choose Free).
      try {
        const pend = JSON.parse(sessionStorage.getItem("mq_pending_signup") || "null");
        if (pend) {
          setName(pend.name || "");
          setEmail(pend.email || "");
          setPass(pend.password || "");
          setAgreed(true);
          setSelected(pend.plan || "premium");
          if (pend.cycle === "yearly") { setPlusCycle("yearly"); setPremCycle("yearly"); }
          if (pend.cycle === "monthly") { setPlusCycle("monthly"); setPremCycle("monthly"); }
          if (pend.cycle === "lifetime") setPremCycle("lifetime");
        }
      } catch (e) {}
      router.replace("/join", undefined, { shallow: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  async function completePaidSignup(sessionId) {
    let pend = null;
    try { pend = JSON.parse(sessionStorage.getItem("mq_pending_signup") || "null"); } catch (e) {}
    if (!pend || !sessionId) { router.replace("/"); return; }
    setFinishing(true);
    try {
      // Create the account now that payment succeeded.
      let uid = null;
      const { data, error } = await supabase.auth.signUp({ email: pend.email, password: pend.password });
      if (error && /already registered|already exists/i.test(error.message)) {
        // Account already made (e.g. a page refresh) — sign in instead.
        const { data: si, error: se } = await supabase.auth.signInWithPassword({ email: pend.email, password: pend.password });
        if (se) throw new Error(se.message);
        uid = si.user.id;
      } else if (error) {
        throw new Error(error.message);
      } else {
        uid = data.user.id;
        try { await supabase.from("profiles").insert({ id: uid, name: pend.name, data: { tosVersion: TOS_VERSION } }); } catch (e) {}
      }
      // Verify payment + grant Premium.
      await fetch("/api/stripe/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, userId: uid }),
      });
      sessionStorage.removeItem("mq_pending_signup");
      try { sessionStorage.setItem("mq_session", "1"); } catch (e) {} // keep the new user signed in
      // Full-page load so the board mounts fresh and picks up the new session — auto-logged-in.
      window.location.href = "/personalize";
    } catch (e) {
      setErr("We couldn't finish setting up your account: " + e.message + ". Your payment went through — please contact support.");
      setFinishing(false);
    }
  }

  const validForm = name.trim() && /\S+@\S+\.\S+/.test(email) && pass.length >= 6 && agreed;
  const canProceed = validForm && selected;

  async function proceed() {
    setErr("");
    if (!name.trim()) return setErr("Enter your name.");
    if (!/\S+@\S+\.\S+/.test(email)) return setErr("Enter a valid email.");
    if (pass.length < 6) return setErr("Password must be at least 6 characters.");
    if (!agreed) return setErr("Please agree to the Terms and Privacy Policy.");
    if (!selected) return setErr("Choose a plan to continue.");
    setBusy(true);
    try {
      if (selected === "basic") {
        const { data, error } = await supabase.auth.signUp({ email, password: pass });
        if (error) { setErr(error.message); setBusy(false); return; }
        await supabase.from("profiles").insert({ id: data.user.id, name, data: { tosVersion: TOS_VERSION } });
        try { sessionStorage.setItem("mq_session", "1"); } catch (e) {} // keep the new user signed in
        router.push("/personalize");
        return;
      }
      // Paid: stash credentials for the return trip, then go to Stripe.
      const cyc = selected === "plus" ? plusCycle : selected === "premium" ? premCycle : "monthly";
      try { sessionStorage.setItem("mq_pending_signup", JSON.stringify({ name, email, password: pass, plan: selected, cycle: cyc })); } catch (e) {}
      const r = await fetch("/api/stripe/join-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan: selected, cycle: cyc }),
      });
      const j = await r.json();
      if (j.url) { window.location.href = j.url; return; }
      setErr(j.error || "Could not start checkout.");
      setBusy(false);
    } catch (e) {
      setErr("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  const plusPrice = plusCycle === "yearly" ? PLUS_Y : PLUS_M;
  const plusUnit = plusCycle === "yearly" ? "/yr" : "/mo";
  const premPrice = premCycle === "lifetime" ? LIFETIME : (premCycle === "yearly" ? PREM_Y : PREM_M);
  const premUnit = premCycle === "lifetime" ? " once" : (premCycle === "yearly" ? "/yr" : "/mo");
  const proceedLabel = selected === "basic" ? "Enter Main Quest →" : selected ? "Continue to Payment →" : "Select a plan";
  const inp = { background: "rgba(201,168,76,.06)", border: "1px solid rgba(201,168,76,.2)", color: "#f4edd8", colorScheme: "dark", borderRadius: 9, padding: "12px 14px", fontSize: 13, fontFamily: "inherit", width: "100%", boxSizing: "border-box", outline: "none" };

  return (
    <>
      <Head>
        <title>Main Quest — Create Your Account</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Cinzel+Decorative:wght@700&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        .qgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;align-items:start;}
        @media(max-width:860px){.qgrid{grid-template-columns:1fr;gap:24px;}}
        .qcard{position:relative;background:#0e0a12;border:1px solid rgba(201,168,76,.18);border-radius:16px;padding:24px 20px;cursor:pointer;transition:transform .2s,border-color .2s,box-shadow .3s;display:flex;flex-direction:column;}
        .qcard:hover{transform:translateY(-5px);}
        @property --qa{syntax:"<angle>";inherits:false;initial-value:0deg;}
        .qcard::before{content:"";position:absolute;inset:0;border-radius:16px;padding:2px;background:conic-gradient(from var(--qa),transparent 0deg,#c9a84c 55deg,#f0d080 110deg,transparent 185deg,transparent 360deg);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;opacity:0;transition:opacity .3s;pointer-events:none;}
        .qcard:hover::before{opacity:1;animation:qspin 2.4s linear infinite;}
        @keyframes qspin{to{--qa:360deg;}}
        .qprem{background:linear-gradient(165deg,rgba(201,168,76,.09),rgba(16,10,22,.9));border-color:rgba(201,168,76,.34);}
        .qglow{background:linear-gradient(160deg,rgba(232,140,58,.16),rgba(16,10,22,.92));border-color:rgba(240,160,80,.5);box-shadow:0 0 36px rgba(232,120,58,.28),inset 0 0 34px rgba(240,160,80,.07);}
        .qglow:hover{box-shadow:0 0 48px rgba(232,120,58,.4),inset 0 0 34px rgba(240,160,80,.09);}
        .qlife{background:linear-gradient(165deg,rgba(201,168,76,.16),rgba(139,32,32,.12));border-color:rgba(201,168,76,.5);box-shadow:0 0 30px rgba(201,168,76,.15);}
        .qcard.qsel{border-color:#c9a84c;box-shadow:inset 0 0 46px rgba(201,168,76,.18),0 0 26px rgba(201,168,76,.3);}
        .qcard.qsel::before{opacity:0!important;animation:none!important;}
        .qbtn{width:100%;border:none;border-radius:11px;padding:15px;font-size:14px;font-weight:800;font-family:'Cinzel',serif;letter-spacing:.5px;transition:all .25s;}
        .qbadge{position:absolute;top:-11px;left:50%;transform:translateX(-50%);font-family:'Cinzel',serif;font-size:9px;font-weight:800;letter-spacing:1px;text-transform:uppercase;padding:3px 12px;border-radius:20px;white-space:nowrap;z-index:2;}
      `}</style>

      <div style={{ minHeight: "100vh", background: "radial-gradient(1200px 600px at 50% -10%, rgba(139,32,32,.16), transparent), #080608", color: "#f4edd8", fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif", padding: "40px 18px 60px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>

          {/* Header — matches the site's title logo */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 8 }}>
            <div style={{ filter: "drop-shadow(0 0 18px rgba(201,168,76,.6))", display: "flex" }}><SwordShield s={40} c="#c9a84c" /></div>
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, color: "rgba(201,168,76,.55)", letterSpacing: 5, lineHeight: 1, marginBottom: 4 }}>— YOUR CAREER —</div>
              <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 34, fontWeight: 700, background: "linear-gradient(135deg,#c9a84c,#e8613a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.1 }}>Main Quest</div>
            </div>
          </div>
          <div style={{ textAlign: "center", fontSize: 12, color: "rgba(201,168,76,.7)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 26 }}>Begin Your Journey</div>

          {finishing ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 18, color: "#f0d080" }}>Completing your account…</div>
              <div style={{ fontSize: 12, color: "rgba(244,237,216,.5)", marginTop: 8 }}>One moment while we finish setting things up.</div>
            </div>
          ) : (
            <>
              {/* Account form */}
              <div style={{ maxWidth: 460, margin: "0 auto 30px", background: "rgba(16,10,22,.6)", border: "1px solid rgba(201,168,76,.15)", borderRadius: 14, padding: 20 }}>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: "rgba(201,168,76,.75)", textTransform: "uppercase", letterSpacing: 1, textAlign: "center", marginBottom: 14 }}>Create Your Account</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                  <input style={inp} value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" />
                  <div style={{ position: "relative" }}>
                    <input style={{ ...inp, paddingRight: 62 }} value={pass} onChange={e => setPass(e.target.value)} placeholder="Password (min 6 characters)" type={show ? "text" : "password"} />
                    <button onClick={() => setShow(s => !s)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(201,168,76,.7)", cursor: "pointer", fontSize: 11, fontFamily: "'Cinzel',serif" }}>{show ? "Hide" : "Show"}</button>
                  </div>
                  <label onClick={() => setAgreed(a => !a)} style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", fontSize: 11, color: "rgba(244,237,216,.55)", lineHeight: 1.4, marginTop: 2 }}>
                    <div style={{ width: 15, height: 15, borderRadius: 4, border: `1.5px solid ${agreed ? "#c9a84c" : "rgba(201,168,76,.3)"}`, background: agreed ? "#c9a84c" : "transparent", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#0a0608", fontSize: 11, fontWeight: 900 }}>{agreed ? "✓" : ""}</div>
                    <span>I agree to the <a href="/terms" target="_blank" style={{ color: "#c9a84c" }}>Terms</a> and <a href="/privacy" target="_blank" style={{ color: "#c9a84c" }}>Privacy Policy</a>.</span>
                  </label>
                </div>
              </div>

              {/* Plan cards */}
              <div style={{ textAlign: "center", fontFamily: "'Cinzel',serif", fontSize: 15, color: "#f0d080", letterSpacing: 1, marginBottom: 4 }}>Choose Your Path</div>
              <div style={{ textAlign: "center", fontSize: 12, color: "rgba(244,237,216,.45)", marginBottom: 20 }}>Select a plan to finish creating your account.</div>

              <div className="qgrid">
                {/* BASIC */}
                <div className={"qcard" + (selected === "basic" ? " qsel" : "")} onClick={() => setSelected("basic")}>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(244,237,216,.6)", textAlign: "center" }}>Basic</div>
                  <div style={{ textAlign: "center", margin: "8px 0 4px" }}><span style={{ fontFamily: "'Cinzel',serif", fontSize: 40, fontWeight: 800, color: "#f4edd8" }}>$0</span></div>
                  <div style={{ textAlign: "center", fontSize: 11, color: "rgba(244,237,216,.4)", marginBottom: 16 }}>Free forever</div>
                  <FeatureList items={FEATURES.basic} />
                  <SelectPip on={selected === "basic"} />
                </div>
                {/* PLUS */}
                <div className={"qcard qprem" + (selected === "plus" ? " qsel" : "")} onClick={() => setSelected("plus")}>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", background: "linear-gradient(135deg,#c9a84c,#f0d080)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800, textAlign: "center" }}>Plus</div>
                  <div style={{ textAlign: "center", margin: "8px 0 2px" }}><span style={{ fontFamily: "'Cinzel',serif", fontSize: 40, fontWeight: 800, color: "#f0d080" }}>${plusPrice}</span><span style={{ fontSize: 13, color: "rgba(244,237,216,.45)", fontWeight: 600 }}>{plusUnit}</span></div>
                  <CycleToggle opts={["monthly", "yearly"]} val={plusCycle} set={setPlusCycle} />
                  <FeatureList items={FEATURES.plus} gold />
                  <SelectPip on={selected === "plus"} />
                </div>
                {/* PREMIUM */}
                <div className={"qcard qprem qglow" + (selected === "premium" ? " qsel" : "")} onClick={() => setSelected("premium")}>
                  <div className="qbadge" style={{ background: "linear-gradient(135deg,#f0d080,#e8613a)", color: "#1a0e06", boxShadow: "0 4px 16px rgba(232,120,58,.5)" }}>Most Popular</div>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", background: "linear-gradient(135deg,#f7d98a,#f0a050)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800, textAlign: "center" }}>Premium</div>
                  <div style={{ textAlign: "center", margin: "8px 0 2px" }}><span style={{ fontFamily: "'Cinzel',serif", fontSize: 40, fontWeight: 800, color: "#f7d98a" }}>${premPrice}</span><span style={{ fontSize: 13, color: "rgba(244,237,216,.45)", fontWeight: 600 }}>{premUnit}</span></div>
                  <CycleToggle opts={["monthly", "yearly", "lifetime"]} val={premCycle} set={setPremCycle} />
                  <FeatureList items={FEATURES.premium} gold />
                  <SelectPip on={selected === "premium"} />
                </div>
              </div>

              {/* Error + Proceed */}
              {err && <div style={{ maxWidth: 560, margin: "20px auto 0", color: "#e8a070", fontSize: 12, textAlign: "center", lineHeight: 1.5 }}>{err}</div>}
              <div style={{ maxWidth: 380, margin: "22px auto 0" }}>
                <button
                  onClick={proceed}
                  disabled={!canProceed || busy}
                  className="qbtn"
                  style={{
                    background: canProceed ? "linear-gradient(135deg,#c9a84c,#f0d080)" : "rgba(201,168,76,.12)",
                    color: canProceed ? "#0a0608" : "rgba(244,237,216,.4)",
                    cursor: canProceed && !busy ? "pointer" : "default",
                    boxShadow: canProceed ? "0 8px 30px rgba(201,168,76,.35)" : "none",
                    opacity: busy ? 0.7 : 1,
                  }}
                >
                  {busy ? "…" : proceedLabel}
                </button>
                {!validForm && selected && <div style={{ textAlign: "center", fontSize: 10.5, color: "rgba(244,237,216,.4)", marginTop: 8 }}>Fill in your account details above to continue.</div>}
              </div>

              <div style={{ textAlign: "center", marginTop: 22, fontSize: 12, color: "rgba(244,237,216,.4)" }}>
                Already have an account? <a href="/" style={{ color: "#c9a84c", fontFamily: "'Cinzel',serif", fontWeight: 700, textDecoration: "none" }}>Sign in</a>
              </div>
            </>
          )}
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

function CycleToggle({ opts, val, set }) {
  return (
    <div onClick={e => e.stopPropagation()} style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
      <div style={{ display: "inline-flex", background: "rgba(10,7,8,.5)", border: "1px solid rgba(201,168,76,.25)", borderRadius: 14, padding: 2, flexWrap: "wrap", justifyContent: "center" }}>
        {opts.map(o => (
          <button key={o} type="button" onClick={() => set(o)} style={{ background: val === o ? "linear-gradient(135deg,#c9a84c,#f0d080)" : "transparent", color: val === o ? "#0a0608" : "rgba(244,237,216,.65)", border: "none", borderRadius: 12, padding: "5px 10px", fontSize: 10, fontWeight: 700, fontFamily: "'Cinzel',serif", cursor: "pointer", textTransform: "capitalize" }}>{o}</button>
        ))}
      </div>
    </div>
  );
}
function FeatureList({ items, gold }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "rgba(244,237,216,.72)", lineHeight: 1.4 }}>
          <span style={{ color: gold ? "#f0d080" : "#7ecfb3", flexShrink: 0, marginTop: 1 }}>✦</span>{it}
        </div>
      ))}
    </div>
  );
}

function SelectPip({ on }) {
  return (
    <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 11, fontFamily: "'Cinzel',serif", letterSpacing: .5, color: on ? "#0a0608" : "rgba(244,237,216,.5)", background: on ? "linear-gradient(135deg,#c9a84c,#f0d080)" : "rgba(201,168,76,.06)", border: `1px solid ${on ? "transparent" : "rgba(201,168,76,.2)"}`, borderRadius: 9, padding: "9px", fontWeight: 700 }}>
      {on ? "✓ Selected" : "Select"}
    </div>
  );
}