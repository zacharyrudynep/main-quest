// pages/terms.js — Terms of Service
import Head from "next/head";
import Link from "next/link";

export default function Terms() {
  const G = "linear-gradient(135deg,#c9a84c,#e8613a)";
  const today = "June 2026";
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

        <h2 style={h2}>4. Your Account & Conduct</h2>
        <ul>
          <li style={li}>You are responsible for keeping your login credentials secure and for all activity under your account.</li>
          <li style={li}>You agree to provide accurate information and to use the Service only for lawful, personal job-seeking purposes.</li>
          <li style={li}>You agree not to scrape, overload, disrupt, reverse-engineer, or misuse the Service, and not to use it to harass others or violate any law.</li>
        </ul>

        <h2 style={h2}>5. AI-Generated Content</h2>
        <p style={p}>Some features use AI to generate text such as cover letters, emails, and resume suggestions. AI output may contain errors or inaccuracies. You are solely responsible for reviewing, editing, and verifying any AI-generated content before using or submitting it. We make no warranties about its quality, accuracy, or suitability.</p>

        <h2 style={h2}>6. Intellectual Property</h2>
        <p style={p}>The Main Quest name, design, and original code are the property of the site operator. You may use the Service for your personal job search but may not copy, resell, or redistribute the Service or its underlying data without permission.</p>

        <h2 style={h2}>7. Disclaimer of Warranties</h2>
        <p style={p}>The Service is provided "as is" and "as available," without warranties of any kind, express or implied, including merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the Service will be uninterrupted, error-free, or secure.</p>

        <h2 style={h2}>8. Limitation of Liability</h2>
        <p style={p}>To the maximum extent permitted by law, the site operator shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of data, opportunities, or employment, arising from your use of (or inability to use) the Service. Because the Service is provided free of charge, the operator's total liability for any claim shall not exceed USD $50.</p>

        <h2 style={h2}>9. Indemnification</h2>
        <p style={p}>You agree to indemnify and hold harmless the site operator from any claims, damages, or expenses arising out of your use of the Service or your violation of these Terms.</p>

        <h2 style={h2}>10. Termination</h2>
        <p style={p}>We may suspend or terminate access to the Service at any time, for any reason, including violation of these Terms. You may stop using the Service and delete your account at any time.</p>

        <h2 style={h2}>11. Changes to These Terms</h2>
        <p style={p}>We may revise these Terms from time to time. Material changes are indicated by updating the "Last updated" date. Continued use after changes take effect constitutes acceptance of the revised Terms.</p>

        <h2 style={h2}>12. Governing Law</h2>
        <p style={p}>These Terms are governed by the laws of the operator's place of residence in the United States, without regard to conflict-of-law principles. (Replace with your specific state before publishing if you wish.)</p>

        <h2 style={h2}>13. Contact</h2>
        <p style={p}>Questions about these Terms can be sent to the site operator through the email address associated with this site.</p>

        <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid rgba(201,168,76,.15)", fontSize: 12, color: "rgba(244,237,216,.4)" }}>
          <Link href="/privacy" style={{ color: "#c9a84c", textDecoration: "none", marginRight: 16 }}>Privacy Policy</Link>
          <Link href="/" style={{ color: "#c9a84c", textDecoration: "none" }}>Home</Link>
        </div>
      </div>
    </div>
  </>;
}