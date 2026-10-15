import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabase";

export default function VerifyEmail() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [uid, setUid] = useState(null);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [msg, setMsg] = useState("");
  const [msgTone, setMsgTone] = useState("ok");
  const [code, setCode] = useState("");
  const [verifyingCode, setVerifyingCode] = useState(false);
  const pollRef = useRef(null);

  async function getToken() { const { data } = await supabase.auth.getSession(); return data && data.session && data.session.access_token; }

  async function checkVerified(id) {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
      if (!error && data) return data.email_verified === true || (data.data && data.data.email_verified === true);
    } catch (e) {}
    return false;
  }

  // Load session, bounce to /join if none, then poll for verification.
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const s = data && data.session;
      if (!s || !s.user) { router.replace("/join"); return; }
      if (!alive) return;
      setUid(s.user.id); setEmail(s.user.email || "");
      if (await checkVerified(s.user.id)) { router.replace("/personalize"); return; }
      pollRef.current = setInterval(async () => {
        if (await checkVerified(s.user.id)) { clearInterval(pollRef.current); router.replace("/personalize"); }
      }, 4000);
    })();
    return () => { alive = false; if (pollRef.current) clearInterval(pollRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function resend() {
    setMsg("");
    try {
      const tk = await getToken();
      const r = await fetch("/api/auth/resend-verification", { method: "POST", headers: { Authorization: `Bearer ${tk}` } });
      if (r.ok) { setMsgTone("ok"); setMsg("Sent! Check your inbox (and spam)."); setCooldown(30); }
      else { setMsgTone("err"); setMsg("Couldn't resend right now — try again in a moment."); }
    } catch (e) { setMsgTone("err"); setMsg("Couldn't resend right now — try again in a moment."); }
  }

  async function manualCheck() {
    if (!uid) return;
    setChecking(true); setMsg("");
    try { await supabase.auth.refreshSession(); } catch (e) {}
    const ok = await checkVerified(uid);
    setChecking(false);
    if (ok) router.replace("/personalize");
    else { setMsgTone("err"); setMsg("Not verified yet — click the link in your email, then try again."); }
  }

  async function submitCode() {
    const c = code.trim().replace(/\s+/g, "");
    if (!/^\d{6}$/.test(c)) { setMsgTone("err"); setMsg("Enter the 6-digit code from your email."); return; }
    setVerifyingCode(true); setMsg("");
    try {
      const tk = await getToken();
      const r = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tk}` },
        body: JSON.stringify({ code: c }),
      });
      const data = await r.json().catch(() => ({}));
      setVerifyingCode(false);
      if (r.ok && data.ok) { try { await supabase.auth.refreshSession(); } catch (e) {} router.replace("/personalize"); }
      else { setMsgTone("err"); setMsg(data.error || "That code didn't work — try again or resend."); }
    } catch (e) { setVerifyingCode(false); setMsgTone("err"); setMsg("Couldn't verify right now — try again in a moment."); }
  }

  async function startOver() {
    try { await supabase.auth.signOut(); } catch (e) {}
    router.replace("/join");
  }

  return (
    <>
      <Head>
        <title>Main Quest — Verify Your Email</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Cinzel+Decorative:wght@700&display=swap" rel="stylesheet" />
      </Head>
      <style>{`@keyframes mqspin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ minHeight: "100vh", background: "radial-gradient(1200px 600px at 50% -10%, rgba(139,32,32,.16), transparent), #080608", color: "#f4edd8", fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif", padding: "48px 18px 60px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 26 }}>
          <div style={{ filter: "drop-shadow(0 0 16px rgba(201,168,76,.55))", display: "flex" }}><SwordShield s={32} c="#c9a84c" /></div>
          <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 24, fontWeight: 700, background: "linear-gradient(135deg,#c9a84c,#e8613a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Main Quest</div>
        </div>

        <div style={{ width: "100%", maxWidth: 440, background: "rgba(16,10,22,.6)", border: "1px solid rgba(201,168,76,.15)", borderRadius: 16, padding: "30px 26px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✉️</div>
          <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 21, fontWeight: 700, color: "#f4edd8", margin: "0 0 10px" }}>Verify your email</h1>
          <p style={{ fontSize: 13.5, color: "rgba(244,237,216,.6)", lineHeight: 1.6, margin: "0 0 4px" }}>We sent a verification link to</p>
          <p style={{ fontSize: 14, color: "#f0d080", fontWeight: 700, margin: "0 0 18px", wordBreak: "break-word" }}>{email || "your email"}</p>
          <p style={{ fontSize: 12.5, color: "rgba(244,237,216,.5)", lineHeight: 1.6, margin: "0 0 20px" }}>Click the link in the email, or enter the 6-digit code below. This page will move on automatically once you're verified.</p>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={code}
                onChange={e => setCode(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
                onKeyDown={e => e.key === "Enter" && submitCode()}
                inputMode="numeric"
                placeholder="Enter 6-digit code"
                style={{ flex: 1, minWidth: 0, textAlign: "center", letterSpacing: 4, fontSize: 16, fontWeight: 700, fontFamily: "'Cinzel',serif", padding: "12px 10px", background: "rgba(244,237,216,.05)", border: "1px solid rgba(201,168,76,.25)", borderRadius: 11, color: "#f4edd8", boxSizing: "border-box" }}
              />
              <button onClick={submitCode} disabled={verifyingCode || code.trim().length < 6} style={{ border: "none", borderRadius: 11, padding: "0 18px", fontSize: 12.5, fontWeight: 800, fontFamily: "'Cinzel',serif", letterSpacing: .4, background: "linear-gradient(135deg,#c9a84c,#f0d080)", color: "#0a0608", cursor: (verifyingCode || code.trim().length < 6) ? "default" : "pointer", opacity: (verifyingCode || code.trim().length < 6) ? .55 : 1, whiteSpace: "nowrap" }}>
                {verifyingCode ? "…" : "Verify"}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 18px" }}>
            <span style={{ flex: 1, height: 1, background: "rgba(201,168,76,.15)" }} />
            <span style={{ fontSize: 11, color: "rgba(244,237,216,.35)", fontFamily: "'Cinzel',serif" }}>or</span>
            <span style={{ flex: 1, height: 1, background: "rgba(201,168,76,.15)" }} />
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 12, color: "rgba(201,168,76,.8)", fontFamily: "'Cinzel',serif", marginBottom: 22 }}>
            <span style={{ width: 14, height: 14, border: "2px solid rgba(201,168,76,.3)", borderTopColor: "#c9a84c", borderRadius: "50%", display: "inline-block", animation: "mqspin .9s linear infinite" }} />
            Waiting for verification…
          </div>

          <button onClick={manualCheck} disabled={checking} style={{ width: "100%", border: "none", borderRadius: 11, padding: 14, fontSize: 13.5, fontWeight: 800, fontFamily: "'Cinzel',serif", letterSpacing: .5, background: "linear-gradient(135deg,#c9a84c,#f0d080)", color: "#0a0608", cursor: checking ? "default" : "pointer", boxShadow: "0 6px 22px rgba(201,168,76,.3)", opacity: checking ? .7 : 1, marginBottom: 10 }}>
            {checking ? "Checking…" : "I've verified — continue"}
          </button>

          <button onClick={resend} disabled={cooldown > 0} style={{ width: "100%", background: "rgba(244,237,216,.05)", border: "1px solid rgba(201,168,76,.22)", color: cooldown > 0 ? "rgba(244,237,216,.4)" : "#f0d080", cursor: cooldown > 0 ? "default" : "pointer", borderRadius: 11, padding: 12, fontSize: 12.5, fontWeight: 700, fontFamily: "'Cinzel',serif", letterSpacing: .3 }}>
            {cooldown > 0 ? `Resend email (${cooldown}s)` : "Resend email"}
          </button>

          {msg && <div style={{ marginTop: 14, fontSize: 12, lineHeight: 1.5, color: msgTone === "err" ? "#e8a070" : "#7ecfb3" }}>{msg}</div>}
        </div>

        <button onClick={startOver} style={{ marginTop: 20, background: "none", border: "none", color: "rgba(244,237,216,.4)", cursor: "pointer", fontSize: 12, fontFamily: "'Cinzel',serif" }}>Wrong email? Start over</button>
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