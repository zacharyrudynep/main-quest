// pages/privacy.js — Privacy Policy
import Head from "next/head";
import Link from "next/link";

export default function Privacy() {
  const G = "linear-gradient(135deg,#c9a84c,#e8613a)";
  const today = "June 2026";
  const h2 = { fontFamily: "'Cinzel',serif", fontSize: 18, color: "#f0d080", marginTop: 32, marginBottom: 10 };
  const p = { fontSize: 14, lineHeight: 1.75, color: "rgba(244,237,216,.72)", marginBottom: 12 };
  const li = { fontSize: 14, lineHeight: 1.7, color: "rgba(244,237,216,.72)", marginBottom: 8 };

  return <>
    <Head><title>Privacy Policy — Main Quest</title><meta name="robots" content="index,follow" /></Head>
    <div style={{ minHeight: "100vh", background: "#080608", color: "#f4edd8", fontFamily: "system-ui,sans-serif", padding: "40px 20px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#c9a84c", fontSize: 13, textDecoration: "none" }}>&larr; Back to Main Quest</Link>
        <h1 style={{ fontSize: 28, margin: "16px 0 4px", fontFamily: "'Cinzel Decorative',serif", background: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Privacy Policy</h1>
        <p style={{ fontSize: 12, color: "rgba(244,237,216,.4)", marginBottom: 8 }}>Last updated: {today}</p>

        <p style={p}>This Privacy Policy explains how Main Quest ("we", "us", "the Service") collects, uses, and protects your information when you use our game-industry job board. By using the Service, you agree to the practices described here. If you do not agree, please do not use the Service.</p>

        <h2 style={h2}>1. Who We Are</h2>
        <p style={p}>Main Quest is an independent, personally operated job-aggregation website. It is not affiliated with, endorsed by, or sponsored by any of the game studios, companies, or hiring platforms listed on the Service. We aggregate publicly available job postings and link to the original application pages.</p>

        <h2 style={h2}>2. Information We Collect</h2>
        <p style={p}>We collect only the information needed to provide the Service:</p>
        <ul>
          <li style={li}><strong>Account information:</strong> When you sign up, we collect your email address and a password (passwords are stored securely and encrypted by our authentication provider, Supabase).</li>
          <li style={li}><strong>Profile information:</strong> Any details you choose to add — your name, location, role, bio, skills, work history, education, and email-provider preference.</li>
          <li style={li}><strong>Resume data:</strong> If you upload a resume, its text content is processed to auto-fill your profile fields. The extracted text may be stored in your profile so you can reuse it.</li>
          <li style={li}><strong>Application tracking:</strong> Jobs you mark as applied or saved, along with timestamps, so you can track your applications.</li>
          <li style={li}><strong>Technical data:</strong> Standard server and browser information (such as IP address and browser type) that is automatically logged by our hosting provider for security and reliability.</li>
        </ul>

        <h2 style={h2}>3. How We Use Your Information</h2>
        <ul>
          <li style={li}>To create and maintain your account.</li>
          <li style={li}>To save your profile, saved jobs, and application history.</li>
          <li style={li}>To generate AI-assisted application materials (cover letters, emails, resume suggestions) when you request them.</li>
          <li style={li}>To operate, secure, and improve the Service.</li>
        </ul>
        <p style={p}>We do not sell your personal information. We do not show third-party advertising.</p>

        <h2 style={h2}>4. Third-Party Services</h2>
        <p style={p}>We rely on a small number of trusted third parties to run the Service. When you use relevant features, limited data is shared with them solely to provide that feature:</p>
        <ul>
          <li style={li}><strong>Supabase</strong> — stores your account, profile, and application data, and handles authentication.</li>
          <li style={li}><strong>Vercel</strong> — hosts the website and processes requests.</li>
          <li style={li}><strong>Google (Gemini API)</strong> — when you use an AI feature, the relevant job details and the profile/resume text you provide are sent to Google's Gemini API to generate the requested text. Do not include information in your profile or resume that you are not comfortable sending to this service.</li>
          <li style={li}><strong>Hiring platforms</strong> (Greenhouse, Lever, Ashby, Workable, SmartRecruiters, Recruitee, JazzHR, BambooHR, Paylocity) — we read public job listings from these platforms. When you click "Apply," you are taken to their site and become subject to their privacy policies.</li>
        </ul>

        <h2 style={h2}>5. Legal Bases & Your Rights</h2>
        <p style={p}>Depending on where you live, you may have rights under laws such as the EU/UK GDPR and the California Consumer Privacy Act (CCPA/CPRA), including the right to access, correct, export, or delete your personal data, and the right to withdraw consent. To exercise any of these rights, contact us using the details in Section 10. We will respond within the timeframe required by applicable law.</p>
        <p style={p}>You can delete your profile information at any time from your account settings. Deleting your account removes your stored profile, saved jobs, and application records from our database.</p>

        <h2 style={h2}>6. Data Retention</h2>
        <p style={p}>We keep your information for as long as your account is active or as needed to provide the Service. If you delete your account, we delete the associated personal data, except where we are required to retain certain records by law.</p>

        <h2 style={h2}>7. Data Security</h2>
        <p style={p}>We use industry-standard measures provided by Supabase and Vercel, including encryption in transit (HTTPS) and access controls, to protect your information. No method of transmission or storage is 100% secure, and we cannot guarantee absolute security.</p>

        <h2 style={h2}>8. Children's Privacy</h2>
        <p style={p}>The Service is intended for users who are at least 16 years old (or the age of digital consent in your jurisdiction). We do not knowingly collect personal information from children. If you believe a child has provided us information, contact us and we will delete it.</p>

        <h2 style={h2}>9. Changes to This Policy</h2>
        <p style={p}>We may update this Privacy Policy from time to time. Material changes will be reflected by updating the "Last updated" date above. Your continued use of the Service after changes take effect constitutes acceptance of the revised policy.</p>

        <h2 style={h2}>10. Contact</h2>
        <p style={p}>For privacy questions or to exercise your rights, contact the site operator through the email address associated with this site. (Replace this line with your preferred contact email before publishing.)</p>

        <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid rgba(201,168,76,.15)", fontSize: 12, color: "rgba(244,237,216,.4)" }}>
          <Link href="/terms" style={{ color: "#c9a84c", textDecoration: "none", marginRight: 16 }}>Terms of Service</Link>
          <Link href="/" style={{ color: "#c9a84c", textDecoration: "none" }}>Home</Link>
        </div>
      </div>
    </div>
  </>;
}