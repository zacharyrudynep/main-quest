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
  { q: "Is Main Quest free to use?", a: "Yes. The Basic tier is free forever and gives you full access to the job board, application tracking, and company alerts. Premium adds the Job Match Score Breakdown, the AI Resume Tailor, reusable email templates, and personalized job alerts \u2014 with a price-lock guarantee that your rate never rises." },
  { q: "Do I need to verify my email?", a: "Yes. When you sign up we email you a verification link \u2014 click it to unlock the site\u2019s features. You can browse the job board right away, but tracking, alerts, match scores, AI tools, and upgrading require a verified email. Didn\u2019t get the email? Check your spam/junk folder, or resend it from the Account tab (it can take a minute to arrive)." },
  { q: "Where do the job listings come from?", a: "We aggregate publicly available listings directly from game studios\u2019 official hiring platforms. Always verify the details on the employer\u2019s own site before applying \u2014 postings can change or close at any time." },
  { q: "How often are listings updated?", a: "Live listings refresh regularly throughout the day, pulled straight from each studio\u2019s careers page. Main Quest is in early development, so we\u2019re continually adding new studios and roles \u2014 if a company is missing, it\u2019s likely coming soon." },
  { q: "What exactly does Premium include?", a: "The Job Match Score Breakdown (a per-factor look at why a role fits \u2014 skills, experience, seniority, and keywords), the AI Resume Tailor (rewrites your resume to fit a specific posting), reusable email templates with auto-fill for email applications, and personalized job alerts by role, location, company, and seniority. Your price is locked in \u2014 it never rises, even as we add features." },
  { q: "How do job alerts work?", a: "There are two kinds. Company alerts (free): tap the bell on any studio and we\u2019ll notify you of new roles there, checked once a day. Personalized alerts (Premium): set criteria by role, location, and seniority, and we\u2019ll ping you \u2014 by email and in your on-site inbox \u2014 soon after a matching role is posted, usually within about 15 minutes." },
  { q: "Can I cancel my subscription?", a: "Anytime \u2014 use Manage or Cancel Subscription in your account. Monthly and yearly plans stop renewing at the end of the current period. Lifetime is a one-time purchase and is never billed again." },
  { q: "Is the AI accurate (match score, resume tailor)?", a: "The Job Match Score is an estimated guide comparing your profile to a posting\u2019s listed requirements \u2014 a rough signal, not a guarantee, so don\u2019t let a lower score stop you from applying. The AI Resume Tailor suggests edits you should always review before sending. AI can make mistakes; treat its output as a starting point." },
  { q: "I\u2019m a studio \u2014 how do I get listed or partner with you?", a: "Send us a note through the form on this page with \"Partnerships / Business\" selected, and we\u2019ll get back to you." },
  { q: "Is my data safe?", a: "We only store what\u2019s needed to run your account, track your applications, and power your alerts. We use trusted processors (Supabase for data, Stripe for payments, Resend for email) and don\u2019t sell your data. See our Privacy Policy and Terms for the full details." },
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
        <footer style={{borderTop:"1px solid rgba(201,168,76,.12)",padding:"20px 24px",marginTop:40,display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:12,maxWidth:1000,margin:"40px auto 0"}}>
          <div style={{fontSize:11,color:"rgba(244,237,216,.35)",lineHeight:1.5,maxWidth:560}}>Main Quest aggregates publicly available job listings and is not affiliated with any studio listed. Job data may be inaccurate — always verify on the employer's official site. Trademarks belong to their respective owners.</div>
          <div style={{display:"flex",gap:16,alignItems:"center",flexShrink:0}}>
            <a href="/support" style={{fontSize:11,color:"#c9a84c",textDecoration:"none",fontFamily:"'Cinzel',serif"}}>Support</a>
            <a href="/privacy" style={{fontSize:11,color:"#c9a84c",textDecoration:"none",fontFamily:"'Cinzel',serif"}}>Privacy Policy</a>
            <a href="/terms" style={{fontSize:11,color:"#c9a84c",textDecoration:"none",fontFamily:"'Cinzel',serif"}}>Terms of Service</a>
            <span style={{fontSize:11,color:"rgba(244,237,216,.25)"}}>© 2026 Main Quest. All rights reserved.</span>
          </div>
        </footer>
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