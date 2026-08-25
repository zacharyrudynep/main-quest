// pages/terms.js — Terms of Service
import Head from "next/head";
import Link from "next/link";

// ── EDIT BEFORE PUBLISHING ───────────────────────────────────────────────────
// Set these to your real values before you publish.
const CONTACT_EMAIL = "support@mainquestjobs.com";
const GOVERNING_STATE = "New York";

export default function Terms() {
  const G = "linear-gradient(135deg,#c9a84c,#e8613a)";
  const today = "August 2026";
  const h2 = { fontFamily: "'Cinzel',serif", fontSize: 18, color: "#f0d080", marginTop: 32, marginBottom: 10 };
  const p = { fontSize: 14, lineHeight: 1.75, color: "rgba(244,237,216,.72)", marginBottom: 12 };
  const li = { fontSize: 14, lineHeight: 1.7, color: "rgba(244,237,216,.72)", marginBottom: 8 };

  return <>
    <Head><title>Terms of Service — Main Quest</title><meta name="robots" content="index,follow" /></Head>
    <div style={{ minHeight: "100vh", background: "#080608", color: "#f4edd8", fontFamily: "system-ui,sans-serif", padding: "40px 20px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#c9a84c", fontSize: 13, textDecoration: "none" }}>&larr; Back to Main Quest</Link>
        <h1 style={{ fontSize: 28, margin: "16px 0 4px", fontFamily: "'Cinzel Decorative',serif", background: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Terms of Service</h1>
        <p style={{ fontSize: 12, color: "rgba(244,237,216,.4)", marginBottom: 8 }}>Last updated: {today}</p>

        <p style={p}>Welcome to Main Quest. These Terms of Service ("Terms") govern your use of the Main Quest website and services (the "Service"). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, do not use the Service.</p>

        <h2 style={h2}>1. The Service</h2>
        <p style={p}>Main Quest is an independent job-aggregation tool for the game industry. It collects publicly available job listings from third-party hiring platforms and provides tools to help you organize and apply to them. We are not a recruiter, employer, or staffing agency, and we do not guarantee employment.</p>

        <h2 style={h2}>2. No Affiliation</h2>
        <p style={p}>Studio names, company names, logos, and trademarks belong to their respective owners and are used for identification only. Main Quest is not affiliated with, authorized by, or endorsed by any company listed. Job listings originate from the companies' own hiring systems, and all applications are submitted directly to those companies through their official pages.</p>

        <h2 style={h2}>3. Accuracy of Listings</h2>
        <p style={p}>Job data is aggregated automatically and may be incomplete, out of date, or inaccurate. We do not warrant the accuracy, availability, or legitimacy of any listing. Always verify details on the employer's official site before applying or sharing personal information. We are not responsible for the content, hiring practices, or conduct of any third-party employer.</p>

        <h2 style={h2}>4. Your Account &amp; Conduct</h2>
        <ul>
          <li style={li}>You are responsible for keeping your login credentials secure and for all activity under your account.</li>
          <li style={li}>You agree to provide accurate information and to use the Service only for lawful, personal job-seeking purposes.</li>
          <li style={li}>You agree not to scrape, overload, disrupt, reverse-engineer, or misuse the Service, and not to use it to harass others or violate any law.</li>
          <li style={li}>We may record technical identifiers (such as IP address) associated with activity that violates these Terms, and may block accounts and/or IP addresses that engage in abuse, fraud, or other violations.</li>
        </ul>

        <h2 style={h2}>5. AI-Generated Content</h2>
        <p style={p}>Some features use AI to generate text such as cover letters, emails, and resume suggestions. AI output may contain errors or inaccuracies. You are solely responsible for reviewing, editing, and verifying any AI-generated content before using or submitting it. We make no warranties about its quality, accuracy, or suitability.</p>
        <p style={p}>The AI features are provided for job-application assistance only. They are not a substitute for professional, legal, financial, or medical advice, and are not a crisis or mental-health resource. If you are experiencing a personal crisis, please contact a qualified professional or an appropriate local support service.</p>

        <h2 style={h2}>6. Subscriptions, Billing &amp; Auto-Renewal</h2>
        <p style={p}>Parts of the Service are offered free of charge, and certain features are available through paid plans. Paid plans currently include a monthly subscription, an annual subscription, and a one-time lifetime purchase. Prices are shown at the point of purchase and may change from time to time; any price change will apply only to future billing periods.</p>
        <ul>
          <li style={li}><strong>Payment processing:</strong> Payments are handled by our third-party payment processor, Stripe. By purchasing a paid plan, you also agree to Stripe's applicable terms. We do not store your full payment card details.</li>
          <li style={li}><strong>Auto-renewal:</strong> Subscription plans (monthly and annual) automatically renew at the end of each billing period at the then-current price, using your payment method on file, <strong>until you cancel</strong>. The monthly plan renews every month and the annual plan renews every year.</li>
          <li style={li}><strong>Cancellation:</strong> You may cancel a subscription at any time from your account's billing settings. When you cancel, your plan remains active until the end of the current paid period and does not renew after that. Cancelling is designed to take no more steps than signing up.</li>
          <li style={li}><strong>Lifetime purchase:</strong> The one-time lifetime purchase grants access to the included features for as long as the Service is offered. It is a one-time charge and does not auto-renew.</li>
          <li style={li}><strong>Refunds:</strong> Except where required by applicable law, payments are non-refundable, and cancelling stops future charges rather than refunding the current period. If you believe you were charged in error, contact us and we will review your request in good faith.</li>
          <li style={li}><strong>Failed payments:</strong> If a renewal payment fails, we may retry the charge and/or suspend access to paid features until payment is resolved.</li>
        </ul>

        <h2 style={h2}>7. Intellectual Property</h2>
        <p style={p}>The Main Quest name, design, and original code are the property of the site operator. You may use the Service for your personal job search but may not copy, resell, or redistribute the Service or its underlying data without permission.</p>

        <h2 style={h2}>8. Disclaimer of Warranties</h2>
        <p style={p}>The Service is provided "as is" and "as available," without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Service will be uninterrupted, error-free, or secure.</p>

        <h2 style={h2}>9. Limitation of Liability</h2>
        <p style={p}>To the maximum extent permitted by law, the site operator shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of data, opportunities, or employment, arising from your use of (or inability to use) the Service. To the maximum extent permitted by law, the operator's total aggregate liability for any claim relating to the Service shall not exceed the greater of (a) the total amount you paid us for the Service in the twelve (12) months before the event giving rise to the claim, or (b) USD $100.</p>

        <h2 style={h2}>10. Indemnification</h2>
        <p style={p}>You agree to indemnify and hold harmless the site operator from any claims, damages, or expenses arising out of your use of the Service or your violation of these Terms.</p>

        <h2 style={h2}>11. Termination</h2>
        <p style={p}>We may suspend or terminate access to the Service at any time, for any reason, including violation of these Terms. You may stop using the Service and delete your account at any time. If you have an active paid subscription when you delete your account, cancelling and deleting stops future renewals; amounts already paid for the current period are handled as described in Section 6.</p>

        <h2 style={h2}>12. Dispute Resolution; Arbitration; Class-Action Waiver</h2>
        <p style={p}><strong>Please read this section carefully — it affects how disputes between you and the operator are resolved and limits the ways you can seek relief.</strong></p>
        <p style={p}><strong>Informal resolution first.</strong> If you have a dispute with us, you agree to first contact us and give us a genuine opportunity to resolve it informally. Send a brief description of the dispute and your contact information to the email in the "Contact" section. We will try in good faith to resolve it within 30 days.</p>
        <p style={p}><strong>Binding arbitration.</strong> If we cannot resolve the dispute informally, you and the operator agree that any dispute arising out of or relating to these Terms or the Service will be resolved by final and binding individual arbitration, rather than in court, except as stated below. Arbitration will be administered by a recognized arbitration provider under its consumer arbitration rules, and judgment on the award may be entered in any court with jurisdiction.</p>
        <p style={p}><strong>Exceptions.</strong> Either party may (a) bring an individual claim in small-claims court if it qualifies, and (b) seek injunctive or equitable relief in court to protect intellectual-property or misuse-related rights. Nothing in this section prevents you from reporting concerns to a government agency.</p>
        <p style={p}><strong>Class-action waiver.</strong> To the maximum extent permitted by law, you and the operator agree that each may bring claims against the other only in an individual capacity, and not as a plaintiff or class member in any purported class, collective, consolidated, or representative proceeding. The arbitrator may not consolidate more than one person's claims or preside over any form of class or representative proceeding.</p>
        <p style={p}><strong>Your right to opt out.</strong> You may opt out of this arbitration and class-action-waiver section by emailing us at the address in the "Contact" section within 30 days of first accepting these Terms, stating your name and that you opt out of arbitration. Opting out will not affect any other part of these Terms.</p>
        <p style={p}>If any portion of this Section 12 is found unenforceable, that portion will be severed and the remainder will remain in effect — except that if the class-action waiver is found unenforceable as to a particular claim, that claim will proceed in court rather than in arbitration.</p>

        <h2 style={h2}>13. Governing Law</h2>
        <p style={p}>These Terms are governed by the laws of the State of {GOVERNING_STATE}, United States, without regard to its conflict-of-law principles. Subject to Section 12, any dispute not subject to arbitration will be brought in the state or federal courts located in {GOVERNING_STATE}, and you consent to their jurisdiction.</p>

        <h2 style={h2}>14. Changes to These Terms</h2>
        <p style={p}>We may revise these Terms from time to time. Material changes are indicated by updating the "Last updated" date. Continued use after changes take effect constitutes acceptance of the revised Terms.</p>

        <h2 style={h2}>15. Contact</h2>
        <p style={p}>Questions about these Terms can be sent to <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#c9a84c" }}>{CONTACT_EMAIL}</a>.</p>

        <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid rgba(201,168,76,.15)", fontSize: 12, color: "rgba(244,237,216,.4)" }}>
          <Link href="/privacy" style={{ color: "#c9a84c", textDecoration: "none", marginRight: 16 }}>Privacy Policy</Link>
          <Link href="/" style={{ color: "#c9a84c", textDecoration: "none" }}>Home</Link>
        </div>
      </div>
    </div>
  </>;
}