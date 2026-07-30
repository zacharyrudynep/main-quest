import Head from "next/head";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

const TOS_VERSION = "2026-06-20";
const MONTHLY = 4.99, ANNUAL = 49.99, LIFETIME = 119.99;
const PCT_OFF = Math.round((1 - ANNUAL / (MONTHLY * 12)) * 100);

const FEATURES = {
  free: [
    "Full access to the entire job board",
    "Apply to any listing",
    "Track all your applications",
    "Follow companies for new-posting alerts",
    "Free forever — no card required",
  ],
  premium: [
    "Everything in Free",
    "Job Match Score on every listing",
    "One-click email autofill for applications",
    "Targeted alerts by role, location, company & seniority",
    "Price-lock guarantee — your rate never rises, even as new features are added",
  ],
  lifetime: [
    "Everything in Premium",
    "One payment — yours for life",
    "Every future feature included, for life",
    "No recurring billing, ever",
    "*Excludes any future AI features that consume usage-based tokens",
  ],
};

export default function Join() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [selected, setSelected] = useState(null); // "free" | "premium" | "lifetime"
  const [billing, setBilling] = useState("monthly"); // for premium: "monthly" | "annual"
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
          setSelected(pend.plan === "lifetime" ? "lifetime" : "premium");
          if (pend.plan === "annual") setBilling("annual");
          if (pend.plan === "monthly") setBilling("monthly");
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
        await supabase.from("profiles").insert({ id: uid, name: pend.name, data: { tosVersion: TOS_VERSION } });
      }
      // Verify payment + grant Premium.
      await fetch("/api/stripe/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, userId: uid }),
      });
      sessionStorage.removeItem("mq_pending_signup");
      router.replace("/");
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
      if (selected === "free") {
        const { data, error } = await supabase.auth.signUp({ email, password: pass });
        if (error) { setErr(error.message); setBusy(false); return; }
        await supabase.from("profiles").insert({ id: data.user.id, name, data: { tosVersion: TOS_VERSION } });
        router.push("/");
        return;
      }
      // Paid: stash credentials for the return trip, then go to Stripe.
      const plan = selected === "lifetime" ? "lifetime" : (billing === "annual" ? "annual" : "monthly");
      try { sessionStorage.setItem("mq_pending_signup", JSON.stringify({ name, email, password: pass, plan })); } catch (e) {}
      const r = await fetch("/api/stripe/join-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan }),
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

  const premiumPrice = billing === "annual" ? ANNUAL : MONTHLY;
  const premiumUnit = billing === "annual" ? "/yr" : "/mo";
  const proceedLabel = selected === "free" ? "Enter Main Quest →" : selected ? "Continue to Payment →" : "Select a plan";
  const inp = { background: "rgba(201,168,76,.06)", border: "1px solid rgba(201,168,76,.2)", color: "#f4edd8", colorScheme: "dark", borderRadius: 9, padding: "12px 14px", fontSize: 13, fontFamily: "inherit", width: "100%", boxSizing: "border-box", outline: "none" };

  return (
    <>
      <Head><title>Main Quest — Create Your Account</title></Head>
      <style>{`
        .qgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;}
        @media(max-width:860px){.qgrid{grid-template-columns:1fr;}}
        .qcard{position:relative;isolation:isolate;background:#0e0a12;border:1px solid rgba(201,168,76,.18);border-radius:16px;padding:22px 20px;cursor:pointer;transition:transform .2s,border-color .2s;display:flex;flex-direction:column;}
        .qcard:hover{transform:translateY(-4px);}
        .qcard::before{content:"";position:absolute;inset:-2px;border-radius:18px;background:conic-gradient(from 0deg,#c9a84c,#f0d080,#e8613a,#8b2020,#c9a84c);opacity:0;z-index:-1;filter:blur(9px);transition:opacity .35s;}
        .qcard:hover::before{opacity:.9;animation:qspin 3s linear infinite;}
        .qcard.qsel{border-color:rgba(201,168,76,.65);}
        .qcard.qsel::before{opacity:1;animation:qspin 3s linear infinite;}
        @keyframes qspin{to{transform:rotate(1turn);}}
        .qbtn{width:100%;border:none;border-radius:11px;padding:15px;font-size:14px;font-weight:800;font-family:'Cinzel',serif;letter-spacing:.5px;transition:all .25s;}
      `}</style>

      <div style={{ minHeight: "100vh", background: "radial-gradient(1200px 600px at 50% -10%, rgba(139,32,32,.16), transparent), #080608", color: "#f4edd8", fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif", padding: "40px 18px 60px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 26 }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 30, fontWeight: 800, letterSpacing: 3, background: "linear-gradient(135deg,#c9a84c,#f0d080)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MAIN QUEST</div>
            <div style={{ fontSize: 12, color: "rgba(201,168,76,.7)", letterSpacing: 3, textTransform: "uppercase", marginTop: 6 }}>Begin Your Journey</div>
          </div>

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
                {/* FREE */}
                <div className={"qcard" + (selected === "free" ? " qsel" : "")} onClick={() => setSelected("free")}>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(244,237,216,.6)", textAlign: "center" }}>Free</div>
                  <div style={{ textAlign: "center", margin: "8px 0 4px" }}><span style={{ fontFamily: "'Cinzel',serif", fontSize: 40, fontWeight: 800, color: "#f4edd8" }}>FREE</span></div>
                  <div style={{ textAlign: "center", fontSize: 11, color: "rgba(244,237,216,.4)", marginBottom: 16 }}>Free forever</div>
                  <FeatureList items={FEATURES.free} />
                  <SelectPip on={selected === "free"} />
                </div>

                {/* PREMIUM */}
                <div className={"qcard" + (selected === "premium" ? " qsel" : "")} onClick={() => setSelected("premium")}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", background: "linear-gradient(135deg,#c9a84c,#f0d080)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 800 }}>Premium</span>
                  </div>
                  <div style={{ textAlign: "center", margin: "8px 0 2px" }}>
                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: 40, fontWeight: 800, color: "#f0d080" }}>${premiumPrice}</span>
                    <span style={{ fontSize: 13, color: "rgba(244,237,216,.45)", fontWeight: 600 }}>{premiumUnit}</span>
                  </div>
                  {/* Monthly / Yearly toggle */}
                  <div onClick={e => e.stopPropagation()} style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
                    <div style={{ display: "inline-flex", background: "rgba(201,168,76,.08)", border: "1px solid rgba(201,168,76,.2)", borderRadius: 20, padding: 2 }}>
                      {["monthly", "annual"].map(b => (
                        <button key={b} onClick={() => setBilling(b)} style={{ background: billing === b ? "linear-gradient(135deg,#c9a84c,#f0d080)" : "transparent", color: billing === b ? "#0a0608" : "rgba(244,237,216,.55)", border: "none", cursor: "pointer", borderRadius: 20, fontSize: 10.5, fontWeight: 700, padding: "5px 13px", fontFamily: "'Cinzel',serif" }}>{b === "monthly" ? "Monthly" : "Yearly"}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ textAlign: "center", fontSize: 10.5, color: billing === "annual" ? "#7ecfb3" : "rgba(244,237,216,.35)", marginBottom: 14, minHeight: 14 }}>{billing === "annual" ? `Save ${PCT_OFF}% vs monthly` : `or $${ANNUAL}/yr — save ${PCT_OFF}%`}</div>
                  <FeatureList items={FEATURES.premium} gold />
                  <SelectPip on={selected === "premium"} />
                </div>

                {/* LIFETIME */}
                <div className={"qcard" + (selected === "lifetime" ? " qsel" : "")} onClick={() => setSelected("lifetime")}>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", color: "#e8a070", textAlign: "center", fontWeight: 800 }}>Lifetime</div>
                  <div style={{ textAlign: "center", margin: "8px 0 2px" }}>
                    <span style={{ fontFamily: "'Cinzel',serif", fontSize: 40, fontWeight: 800, color: "#f0d080" }}>${LIFETIME}</span>
                  </div>
                  <div style={{ textAlign: "center", fontSize: 11, color: "rgba(244,237,216,.4)", marginBottom: 16 }}>One payment · yours for life</div>
                  <FeatureList items={FEATURES.lifetime} gold />
                  <SelectPip on={selected === "lifetime"} />
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
