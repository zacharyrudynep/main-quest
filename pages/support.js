import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

const REASONS = [
  "General Inquiry",
  "Subscription & Billing",
  "Partnerships / Business",
  "Technical Issue",
  "Bug Report",
  "Feedback",
  "Other",
];

const FAQS = [
  { q: "Is Main Quest free to use?", a: "Yes. The Basic tier is free forever and gives you full access to the job board, application tracking, and company alerts. Premium adds Job Match Scores, one-click email autofill, and targeted job alerts — with a price-lock guarantee." },
  { q: "Where do the job listings come from?", a: "We aggregate publicly available listings directly from game studios' official hiring platforms. Always verify the details on the employer's own site before applying — postings can change or close at any time." },
  { q: "How often are listings updated?", a: "Live listings refresh regularly throughout the day, pulled straight from each studio's careers page. The board only reveals once everything has loaded, so you're seeing the current set." },
  { q: "What exactly does Premium include?", a: "Job Match Score on every listing, one-click email autofill for applications, and specific job alerts by role, location, company, and seniority. Your price is locked in — it never rises, even as we add new features." },
  { q: "How do job alerts work?", a: "Set up alerts in your inbox (a Premium feature). We check for new matching roles once a day and drop them into your on-site inbox — tap one to jump straight to it on the board. Email delivery is rolling out too." },
  { q: "Can I cancel my subscription?", a: "Anytime — use Manage Subscription in your account. Monthly and yearly plans stop renewing at the end of the current period. Lifetime is a one-time purchase and is never billed again." },
  { q: "I'm a studio — how do I get listed or partner with you?", a: "Send us a note through the form on this page with \"Partnerships / Business\" selected, and we'll get back to you." },
  { q: "Is my data safe?", a: "We only store what's needed to run your account and track your applications. See our Privacy Policy for the full details." },
];

export default function Support() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState(REASONS[0]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState({});

  const inp = { background: "rgba(201,168,76,.06)", border: "1px solid rgba(201,168,76,.2)", color: "#f4edd8", colorScheme: "dark", borderRadius: 9, padding: "12px 14px", fontSize: 13, fontFamily: "inherit", width: "100%", boxSizing: "border-box", outline: "none" };
  const label = { fontSize: 10, color: "rgba(201,168,76,.8)", textTransform: "uppercase", letterSpacing: 1.2, fontFamily: "'Cinzel',serif", marginBottom: 6, display: "block" };

  async function submit() {
    setErr("");
    if (!name.trim()) return setErr("Please enter your name.");
    if (!/\S+@\S+\.\S+/.test(email)) return setErr("Please enter a valid email.");
    if (!message.trim()) return setErr("Please enter a message.");
    setBusy(true);
    try {
      const r = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, reason, message }),
      });
      const j = await r.json();
      if (j.ok) { setSent(true); }
      else { setErr(j.error || "Something went wrong. Please try again."); }
    } catch (e) {
      setErr("Something went wrong. Please try again.");
    }
    setBusy(false);
  }

  return (
    <>
      <Head>
        <title>Main Quest — Support</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Cinzel+Decorative:wght@700&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        .sgrid{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start;}
        @media(max-width:820px){.sgrid{grid-template-columns:1fr;}}
      `}</style>

      <div style={{ minHeight: "100vh", background: "radial-gradient(1200px 600px at 50% -10%, rgba(139,32,32,.14), transparent), #080608", color: "#f4edd8", fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,sans-serif", padding: "40px 18px 60px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 8 }}>
            <div style={{ filter: "drop-shadow(0 0 18px rgba(201,168,76,.6))", display: "flex" }}><SwordShield s={38} c="#c9a84c" /></div>
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 9, color: "rgba(201,168,76,.55)", letterSpacing: 5, lineHeight: 1, marginBottom: 4 }}>— YOUR CAREER —</div>
              <div style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 30, fontWeight: 700, background: "linear-gradient(135deg,#c9a84c,#e8613a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.1 }}>Main Quest</div>
            </div>
          </div>
          <div style={{ textAlign: "center", fontSize: 12, color: "rgba(201,168,76,.7)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 30 }}>Support</div>

          <div className="sgrid">
            {/* LEFT — Support ticket */}
            <div style={{ background: "rgba(16,10,22,.6)", border: "1px solid rgba(201,168,76,.15)", borderRadius: 14, padding: 22 }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 15, fontWeight: 700, color: "#f0d080", marginBottom: 4 }}>Contact Us</div>
              <div style={{ fontSize: 12, color: "rgba(244,237,216,.5)", marginBottom: 18, lineHeight: 1.5 }}>Fill out a ticket and we'll get back to you by email.</div>

              {sent ? (
                <div style={{ textAlign: "center", padding: "40px 10px" }}>
                  <div style={{ fontFamily: "'Cinzel',serif", fontSize: 16, color: "#f0d080", marginBottom: 8 }}>Ticket sent!</div>
                  <div style={{ fontSize: 12, color: "rgba(244,237,216,.55)", lineHeight: 1.5 }}>Thanks for reaching out. We'll reply to <strong style={{ color: "#f4edd8" }}>{email}</strong> as soon as we can.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div><label style={label}>Your Name</label><input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" /></div>
                  <div><label style={label}>Email</label><input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" /></div>
                  <div>
                    <label style={label}>Reason for Contacting</label>
                    <select style={{ ...inp, cursor: "pointer" }} value={reason} onChange={e => setReason(e.target.value)}>
                      {REASONS.map(r => <option key={r} value={r} style={{ background: "#140d14" }}>{r}</option>)}
                    </select>
                  </div>
                  <div><label style={label}>Message</label><textarea style={{ ...inp, minHeight: 130, resize: "vertical", lineHeight: 1.5 }} value={message} onChange={e => setMessage(e.target.value)} placeholder="How can we help?" /></div>
                  {err && <div style={{ color: "#e8a070", fontSize: 12, lineHeight: 1.5 }}>{err}</div>}
                  <button onClick={submit} disabled={busy} style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080)", border: "none", color: "#0a0608", cursor: busy ? "default" : "pointer", borderRadius: 10, padding: 14, fontSize: 13, fontWeight: 800, fontFamily: "'Cinzel',serif", letterSpacing: 1, textTransform: "uppercase", opacity: busy ? 0.7 : 1 }}>{busy ? "Sending…" : "Submit Ticket →"}</button>
                </div>
              )}
            </div>

            {/* RIGHT — FAQs */}
            <div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: 15, fontWeight: 700, color: "#f0d080", marginBottom: 14, paddingLeft: 2 }}>Frequently Asked Questions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {FAQS.map((f, i) => {
                  const isOpen = !!open[i];
                  return (
                    <div key={i} style={{ background: "rgba(201,168,76,.03)", border: `1px solid ${isOpen ? "rgba(201,168,76,.3)" : "rgba(201,168,76,.12)"}`, borderRadius: 10, overflow: "hidden", transition: "border-color .2s" }}>
                      <button onClick={() => setOpen(o => ({ ...o, [i]: !o[i] }))} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "none", border: "none", cursor: "pointer", padding: "13px 15px", textAlign: "left" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#f4edd8", lineHeight: 1.4 }}>{f.q}</span>
                        <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: "50%", background: "rgba(201,168,76,.12)", color: "#f0d080", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, lineHeight: 1, transform: isOpen ? "rotate(45deg)" : "none", transition: "transform .2s" }}>+</span>
                      </button>
                      {isOpen && <div style={{ padding: "0 15px 14px", fontSize: 12.5, color: "rgba(244,237,216,.6)", lineHeight: 1.6 }}>{f.a}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 30, fontSize: 12 }}>
            <Link href="/" style={{ color: "#c9a84c", fontFamily: "'Cinzel',serif", fontWeight: 700, textDecoration: "none" }}>← Back to the job board</Link>
          </div>
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