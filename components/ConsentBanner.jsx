// components/ConsentBanner.jsx
// Opt-in analytics consent banner. Renders only when the user hasn't chosen yet.
// Calls onChange("accepted" | "declined") so _app can init/skip analytics live.
import { useState, useEffect } from "react";
import Link from "next/link";
import { getConsent, setConsent } from "../lib/consent";

export default function ConsentBanner({ onChange }) {
  const [visible, setVisible] = useState(false);

  // Only decide visibility after mount (avoids SSR/hydration mismatch on localStorage).
  useEffect(() => {
    if (getConsent() === null) setVisible(true);
  }, []);

  if (!visible) return null;

  const choose = (value) => {
    setConsent(value);
    setVisible(false);
    if (onChange) onChange(value);
  };

  const G = "linear-gradient(135deg,#c9a84c,#e8613a)";

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie and analytics consent"
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: 12,
        zIndex: 10000,
        maxWidth: 720,
        margin: "0 auto",
        background: "rgba(14,10,20,.97)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(201,168,76,.28)",
        borderRadius: 14,
        boxShadow: "0 20px 60px rgba(0,0,0,.55)",
        padding: "16px 18px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 14,
        fontFamily: "'Space Grotesk',system-ui,sans-serif",
      }}
    >
      <div style={{ flex: "1 1 320px", minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'Cinzel',serif",
            fontSize: 13,
            fontWeight: 700,
            color: "#f0d080",
            letterSpacing: 0.5,
            marginBottom: 5,
          }}
        >
          A quick word on analytics
        </div>
        <p style={{ fontSize: 12.5, lineHeight: 1.6, color: "rgba(244,237,216,.7)", margin: 0 }}>
          We use privacy-friendly analytics to understand how Main Quest is used and improve it.
          These are optional and off until you accept. Essential features (signing in, applying,
          saving jobs) work either way. See our{" "}
          <Link href="/privacy" style={{ color: "#c9a84c", textDecoration: "underline" }}>
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: "auto" }}>
        <button
          onClick={() => choose("declined")}
          style={{
            background: "rgba(244,237,216,.05)",
            border: "1px solid rgba(244,237,216,.15)",
            color: "rgba(244,237,216,.6)",
            cursor: "pointer",
            borderRadius: 9,
            padding: "9px 18px",
            fontSize: 12,
            fontFamily: "'Cinzel',serif",
            fontWeight: 600,
            letterSpacing: 0.4,
          }}
        >
          Decline
        </button>
        <button
          onClick={() => choose("accepted")}
          style={{
            background: G,
            border: "none",
            color: "#0a0608",
            cursor: "pointer",
            borderRadius: 9,
            padding: "9px 20px",
            fontSize: 12,
            fontFamily: "'Cinzel',serif",
            fontWeight: 800,
            letterSpacing: 0.6,
            textTransform: "uppercase",
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
