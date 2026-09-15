// /reset-password — users land here from the password-reset email link.
// Supabase parses the recovery token from the URL and opens a temporary session;
// the user sets a new password (entered twice) and we call updateUser().
import { useState, useEffect } from "react";
import Head from "next/head";
import { supabase } from "../lib/supabase";

export default function ResetPassword() {
  const [ready, setReady] = useState(false);   // recovery session detected
  const [checked, setChecked] = useState(false); // finished checking for a session
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data && data.session) setReady(true);
      setChecked(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
      setChecked(true);
    });
    return () => { mounted = false; sub && sub.subscription && sub.subscription.unsubscribe(); };
  }, []);

  const submit = async () => {
    setErr("");
    if (pass.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (pass !== pass2) { setErr("Passwords do not match."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pass });
    setBusy(false);
    if (error) { setErr(error.message || "Could not update password. The link may have expired — request a new one."); return; }
    setDone(true);
    try {
      const { data } = await supabase.auth.getSession();
      const tk = data && data.session && data.session.access_token;
      if (tk) await fetch("/api/email/notify", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${tk}` }, body: JSON.stringify({ type: "password-changed" }) });
    } catch (e) {}
    try { await supabase.auth.signOut(); } catch (e) {}
  };

  const G = "linear-gradient(135deg,#c9a84c,#e8613a)";
  const inp = { width: "100%", background: "rgba(201,168,76,.06)", border: "1px solid rgba(201,168,76,.2)", color: "#f4edd8", colorScheme: "dark", borderRadius: 9, padding: "11px 13px", fontSize: 14, outline: "none", boxSizing: "border-box" };
  const card = { width: "100%", maxWidth: 400, background: "linear-gradient(160deg,#140e0a,#0a0608)", border: "1px solid rgba(201,168,76,.25)", borderRadius: 16, padding: "30px 26px", boxShadow: "0 30px 90px rgba(0,0,0,.7)", textAlign: "center" };
  const btn = { width: "100%", background: G, border: "none", color: "#0a0608", borderRadius: 10, padding: "12px", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "'Cinzel',serif", letterSpacing: .3 };
  const title = { fontFamily: "'Cinzel Decorative',serif", fontSize: 22, fontWeight: 700, background: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 6 };

  return (
    <div style={{ minHeight: "100vh", overflowX: "hidden", maxWidth: "100%", background: "radial-gradient(1200px 600px at 50% -10%, rgba(139,32,32,.16), transparent), #080608", color: "#f4edd8", fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Head><title>Reset Password — Main Quest</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <div style={card}>
        {done ? (
          <>
            <div style={title}>Password Updated</div>
            <p style={{ fontSize: 13, color: "rgba(244,237,216,.6)", lineHeight: 1.5, margin: "0 0 20px" }}>Your password has been changed. You can now sign in with your new password.</p>
            <button style={btn} onClick={() => { window.location.href = "/"; }}>Go to Sign In →</button>
          </>
        ) : ready ? (
          <>
            <div style={title}>Set a New Password</div>
            <p style={{ fontSize: 12.5, color: "rgba(244,237,216,.55)", lineHeight: 1.5, margin: "0 0 18px" }}>Enter your new password below.</p>
            <div style={{ position: "relative", marginBottom: 10 }}>
              <input style={inp} type={show ? "text" : "password"} value={pass} onChange={e => setPass(e.target.value)} placeholder="New password" onKeyDown={e => e.key === "Enter" && submit()} />
            </div>
            <input style={{ ...inp, marginBottom: 10 }} type={show ? "text" : "password"} value={pass2} onChange={e => setPass2(e.target.value)} placeholder="Confirm new password" onKeyDown={e => e.key === "Enter" && submit()} />
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "rgba(244,237,216,.5)", cursor: "pointer", marginBottom: 16, justifyContent: "center" }}>
              <input type="checkbox" checked={show} onChange={e => setShow(e.target.checked)} /> Show password
            </label>
            {err && <div style={{ fontSize: 11.5, color: "#e07060", marginBottom: 12 }}>{err}</div>}
            <button style={{ ...btn, opacity: busy ? .7 : 1 }} onClick={submit} disabled={busy}>{busy ? "Updating…" : "Update Password"}</button>
          </>
        ) : checked ? (
          <>
            <div style={title}>Link Expired</div>
            <p style={{ fontSize: 13, color: "rgba(244,237,216,.6)", lineHeight: 1.5, margin: "0 0 20px" }}>This password-reset link is invalid or has expired. Please request a new one from the sign-in screen.</p>
            <button style={btn} onClick={() => { window.location.href = "/"; }}>Back to Sign In</button>
          </>
        ) : (
          <div style={{ fontSize: 13, color: "rgba(244,237,216,.6)", padding: "20px 0" }}>Verifying your reset link…</div>
        )}
      </div>
    </div>
  );
}