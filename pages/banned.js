// pages/banned.js — shown when a banned user tries to sign in.
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

const SUPPORT_EMAIL = "support@mainquestjobs.com";

export default function Banned() {
  const [reason, setReason] = useState("");
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      setReason(sp.get("reason") || "");
    } catch (e) {}
  }, []);
  const G = "linear-gradient(135deg,#c9a84c,#e8613a)";
  return (
    <>
      <Head><title>Account Suspended — Main Quest</title><meta name="robots" content="noindex" /></Head>
      <div style={{ minHeight: "100vh", background: "radial-gradient(1100px 600px at 50% -12%, rgba(139,32,32,.18), transparent), #080608", color: "#f4edd8", fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ maxWidth: 460, width: "100%", background: "rgba(16,10,12,.92)", border: "1px solid rgba(192,50,26,.4)", borderRadius: 16, padding: "32px 28px", textAlign: "center", boxShadow: "0 30px 90px rgba(0,0,0,.6)" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🚫</div>
          <h1 style={{ fontFamily: "'Cinzel',serif", fontSize: 22, fontWeight: 800, color: "#e8613a", margin: "0 0 10px" }}>Account Suspended</h1>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(244,237,216,.72)", marginBottom: reason ? 14 : 18 }}>
            Your account has been banned and you can no longer sign in to Main Quest.
          </p>
          {reason && (
            <div style={{ background: "rgba(192,50,26,.1)", border: "1px solid rgba(192,50,26,.3)", borderRadius: 10, padding: "12px 14px", marginBottom: 18, textAlign: "left" }}>
              <div style={{ fontSize: 10, color: "rgba(232,97,58,.9)", textTransform: "uppercase", letterSpacing: .6, fontFamily: "'Cinzel',serif", marginBottom: 4 }}>Reason</div>
              <div style={{ fontSize: 13.5, color: "#f4edd8", lineHeight: 1.5, wordBreak: "break-word" }}>{reason}</div>
            </div>
          )}
          <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(244,237,216,.6)", marginBottom: 20 }}>
            If you believe this was a mistake, you can reach us by emailing{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: "#c9a84c" }}>{SUPPORT_EMAIL}</a>{" "}
            or through our support page.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{ background: G, color: "#0a0608", textDecoration: "none", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 800, fontFamily: "'Cinzel',serif" }}>Email Support</a>
            <Link href="/support" style={{ background: "rgba(201,168,76,.1)", border: "1px solid rgba(201,168,76,.3)", color: "#f0d080", textDecoration: "none", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 700, fontFamily: "'Cinzel',serif" }}>Support Page</Link>
          </div>
        </div>
      </div>
    </>
  );
}