import { Resend } from "resend";

// The Resend client reads your API key from the environment.
const resend = new Resend(process.env.RESEND_API_KEY);

// Who the email comes FROM.
// - Until you verify a domain in Resend, use "onboarding@resend.dev" (it works,
//   but ONLY delivers to the email address on your own Resend account).
// - Once you verify a domain, set RESEND_FROM in your env to something like
//   "Main Quest <noreply@mainquestjobs.com>" and this picks it up.
const FROM = process.env.RESEND_FROM || "Main Quest <onboarding@resend.dev>";

// Public site URL, used for links inside emails. Driven by env so it always
// matches the current deployment; falls back to the live domain.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mainquestjobs.com";

function escapeHtml(s){
  return String(s == null ? "" : s).replace(/[&<>"']/g, c => (
    { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]
  ));
}

// Build the HTML body for a job-alert email (Main Quest's gold-on-dark look).
export function jobAlertEmailHtml(name, jobs){
  const rows = jobs.map(j => `
    <tr><td style="padding:14px 16px;border:1px solid #2a2018;border-radius:10px;background:#120c10;">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#f0d080;font-weight:bold;">${escapeHtml(j.title)}</div>
      <div style="font-size:13px;color:#b8ad90;margin-top:4px;">${escapeHtml(j.company)}${j.location ? " &middot; " + escapeHtml(j.location) : ""}</div>
      ${j.url ? `<a href="${escapeHtml(j.url)}" style="display:inline-block;margin-top:11px;font-size:12px;color:#0a0608;background:#c9a84c;text-decoration:none;padding:7px 16px;border-radius:8px;font-weight:bold;">View posting &rarr;</a>` : ""}
    </td></tr>
    <tr><td style="height:10px;line-height:10px;">&nbsp;</td></tr>`).join("");

  return `<!doctype html><html><body style="margin:0;padding:0;background:#080608;">
    <div style="max-width:560px;margin:0 auto;padding:28px 20px;font-family:Arial,Helvetica,sans-serif;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:bold;letter-spacing:2px;color:#f0d080;">MAIN QUEST</div>
        <div style="font-size:11px;color:#8a7f68;letter-spacing:3px;text-transform:uppercase;margin-top:5px;">New Quests Await</div>
      </div>
      <p style="font-size:14px;color:#d8ceb4;line-height:1.6;margin:0 0 4px;">${name ? "Hail, " + escapeHtml(name) + "." : "Hail, adventurer."} New postings match your job alerts:</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">${rows}</table>
      <div style="text-align:center;margin-top:20px;">
        <a href="${SITE_URL}/" style="font-size:13px;color:#c9a84c;text-decoration:none;">Open the full job board &rarr;</a>
      </div>
      <p style="font-size:11px;color:#5f5749;text-align:center;margin-top:28px;line-height:1.5;">You're receiving this because you set up job alerts on Main Quest.<br/>Manage or turn these off anytime from the inbox on the site.</p>
    </div>
  </body></html>`;
}

// Send one job-alert email. `jobs` is an array of {title, company, location, url}.
export async function sendJobAlertEmail(to, name, jobs){
  if(!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
  const count = jobs.length;
  return resend.emails.send({
    from: FROM,
    to,
    subject: `${count} new ${count === 1 ? "posting" : "postings"} match your Main Quest alerts`,
    html: jobAlertEmailHtml(name, jobs),
  });
}

// Email a support ticket to the site owner (SUPPORT_EMAIL). The user's email is
// included in the body so you can reply to them directly.
export async function sendSupportTicket({ name, email, reason, message }){
  if(!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
  const to = process.env.SUPPORT_EMAIL;
  if(!to) throw new Error("SUPPORT_EMAIL is not set");
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => (
    { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]
  ));
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:580px;margin:0 auto;">
    <div style="font-family:Georgia,serif;font-size:18px;color:#8a6d1f;font-weight:bold;margin-bottom:14px;">New Main Quest support ticket</div>
    <table style="font-size:14px;color:#222;line-height:1.6;">
      <tr><td style="padding:2px 10px 2px 0;"><strong>Reason</strong></td><td>${esc(reason)}</td></tr>
      <tr><td style="padding:2px 10px 2px 0;"><strong>Name</strong></td><td>${esc(name)}</td></tr>
      <tr><td style="padding:2px 10px 2px 0;"><strong>Email</strong></td><td>${esc(email)}</td></tr>
    </table>
    <div style="margin-top:12px;font-size:14px;color:#222;"><strong>Message:</strong></div>
    <div style="white-space:pre-wrap;background:#f6f3ec;padding:14px;border-radius:8px;margin-top:6px;font-size:14px;color:#222;">${esc(message)}</div>
  </div>`;
  return resend.emails.send({
    from: FROM,
    to,
    subject: `[Support · ${reason}] from ${name}`,
    html,
  });
}