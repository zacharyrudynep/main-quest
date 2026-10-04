import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

const TOS_VERSION = "2026-06-20";

export default function Join() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const validForm = name.trim() && /\S+@\S+\.\S+/.test(email) && pass.length >= 6 && agreed;

  async function proceed() {
    setErr("");
    if (!name.trim()) return setErr("Enter your name.");
    if (!/\S+@\S+\.\S+/.test(email)) return setErr("Enter a valid email.");
    if (pass.length < 6) return setErr("Password must be at least 6 characters.");
    if (!agreed) return setErr("Please agree to the Terms and Privacy Policy.");
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password: pass });
      if (error) {
        if (/already registered|already exists/i.test(error.message)) {
          setErr("An account with that email already exists. Try signing in instead.");
        } else {
          setErr(error.message);
        }
        setBusy(false);
        return;
      }
      try { await supabase.from("profiles").insert({ id: data.user.id, name, data: { tosVersion: TOS_VERSION } }); } catch (e) {}
      try { sessionStorage.setItem("mq_session", "1"); } catch (e) {} // keep the new user signed in
      router.push("/personalize");
    } catch (e) {
      setErr("Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  const inp = { background: "rgba(201,168,76,.06)", border: "1px solid rgba(201,168,76,.2)", color: "#f4edd8", colorScheme: "dark", borderRadius: 9, padding: "12px 14px", fontSize: 13, fontFamily: "inherit", width: "100%", boxSizing: "border-box", outline: "none" };

  return (
    <>
      <Head>
        <title>Main Quest — Create Your Account</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Cinzel+Decorative:wght@700&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ minHeight: "100vh", background: "radial-gradient(1200px 600px at 50% -10%, rgba(139,32,32,.16), transparent), #080608", color: "#f4edd8", fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif", padding: "40px 18px 60px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 8 }}>
          <div style={{ filter: "drop-shadow(0 0 18px rgba(201,168,76,.6))", display: "flex" }}><SwordShield s={40} c="#c9a84c" /></div>
          <div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, color: "rgba(201,168,76,.55)", letterSpacing: 5, lineHeight: 1, marginBottom: 4 }}>— YOUR CAREER —</div>
            <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 34, fontWeight: 700, background: "linear-gradient(135deg,#c9a84c,#e8613a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.1 }}>Main Quest</div>
          </div>
        </div>
        <div style={{ textAlign: "center", fontSize: 12, color: "rgba(201,168,76,.7)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 26 }}>Begin Your Journey</div>

        {/* Account form */}
        <div style={{ width: "100%", maxWidth: 440, background: "rgba(16,10,22,.6)", border: "1px solid rgba(201,168,76,.15)", borderRadius: 14, padding: 22 }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: "rgba(201,168,76,.75)", textTransform: "uppercase", letterSpacing: 1, textAlign: "center", marginBottom: 6 }}>Create Your Account</div>
          <div style={{ textAlign: "center", fontSize: 12, color: "rgba(244,237,216,.45)", marginBottom: 18 }}>You'll choose your path on the next step.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
            <input style={inp} value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" />
            <div style={{ position: "relative" }}>
              <input style={{ ...inp, paddingRight: 62 }} value={pass} onChange={e => setPass(e.target.value)} placeholder="Password (min 6 characters)" type={show ? "text" : "password"} onKeyDown={e => { if (e.key === "Enter" && validForm && !busy) proceed(); }} />
              <button onClick={() => setShow(s => !s)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(201,168,76,.7)", cursor: "pointer", fontSize: 11, fontFamily: "'Cinzel',serif" }}>{show ? "Hide" : "Show"}</button>
            </div>
            <label onClick={() => setAgreed(a => !a)} style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", fontSize: 11, color: "rgba(244,237,216,.55)", lineHeight: 1.4, marginTop: 2 }}>
              <div style={{ width: 15, height: 15, borderRadius: 4, border: `1.5px solid ${agreed ? "#c9a84c" : "rgba(201,168,76,.3)"}`, background: agreed ? "#c9a84c" : "transparent", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#0a0608", fontSize: 11, fontWeight: 900 }}>{agreed ? "✓" : ""}</div>
              <span>I agree to the <a href="/terms" target="_blank" style={{ color: "#c9a84c" }}>Terms</a> and <a href="/privacy" target="_blank" style={{ color: "#c9a84c" }}>Privacy Policy</a>.</span>
            </label>
          </div>

          {err && <div style={{ color: "#e8a070", fontSize: 12, textAlign: "center", lineHeight: 1.5, marginTop: 14 }}>{err}</div>}

          <button
            onClick={proceed}
            disabled={!validForm || busy}
            style={{
              width: "100%", marginTop: 16, border: "none", borderRadius: 11, padding: 15, fontSize: 14, fontWeight: 800, fontFamily: "'Cinzel',serif", letterSpacing: .5,
              background: validForm ? "linear-gradient(135deg,#c9a84c,#f0d080)" : "rgba(201,168,76,.12)",
              color: validForm ? "#0a0608" : "rgba(244,237,216,.4)",
              cursor: validForm && !busy ? "pointer" : "default",
              boxShadow: validForm ? "0 8px 30px rgba(201,168,76,.35)" : "none",
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? "Creating…" : "Create Account →"}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 22, fontSize: 12, color: "rgba(244,237,216,.4)" }}>
          Already have an account? <a href="/" style={{ color: "#c9a84c", fontFamily: "'Cinzel',serif", fontWeight: 700, textDecoration: "none" }}>Sign in</a>
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