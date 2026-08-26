import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM || "Main Quest <onboarding@resend.dev>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mainquestjobs.com";

function escapeHtml(s){
  return String(s == null ? "" : s).replace(/[&<>"']/g, c => (
    { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]
  ));
}

// Shared email shell (gold-on-dark Main Quest look).
function shell(inner){
  return `<!doctype html><html><body style="margin:0;padding:0;background:#080608;">
    <div style="max-width:560px;margin:0 auto;padding:28px 20px;font-family:Arial,Helvetica,sans-serif;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:bold;letter-spacing:2px;color:#f0d080;">MAIN QUEST</div>
        <div style="font-size:11px;color:#8a7f68;letter-spacing:3px;text-transform:uppercase;margin-top:5px;">Game Industry Jobs</div>
      </div>
      ${inner}
    </div>
  </body></html>`;
}

// ── Email verification ──
export function verificationEmailHtml(name, link){
  return shell(`
    <p style="font-size:15px;color:#d8ceb4;line-height:1.6;margin:0 0 16px;">${name ? "Welcome, " + escapeHtml(name) + "!" : "Welcome!"} One quick step to unlock your account's features.</p>
    <p style="font-size:14px;color:rgba(216,206,180,.85);line-height:1.6;margin:0 0 22px;">Confirm your email address to enable job match scores, application tracking, AI tools, and alerts. You can keep browsing the board in the meantime.</p>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="${escapeHtml(link)}" style="display:inline-block;font-size:14px;font-weight:bold;color:#0a0608;background:#c9a84c;text-decoration:none;padding:13px 30px;border-radius:10px;font-family:Georgia,serif;">Verify my email</a>
    </div>
    <p style="font-size:11.5px;color:#5f5749;line-height:1.55;margin:0;">If the button doesn't work, paste this link into your browser:<br/><span style="color:#8a7f68;word-break:break-all;">${escapeHtml(link)}</span></p>
    <p style="font-size:11px;color:#5f5749;line-height:1.5;margin:18px 0 0;">This link expires in 24 hours. If you didn't create a Main Quest account, you can ignore this email.</p>
  `);
}

export async function sendVerificationEmail(to, name, link){
  if(!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
  return resend.emails.send({
    from: FROM,
    to,
    subject: "Verify your Main Quest email",
    html: verificationEmailHtml(name, link),
  });
}

// ── Job alerts ──
export function jobAlertEmailHtml(name, jobs){
  const rows = jobs.map(j => `
    <tr><td style="padding:14px 16px;border:1px solid #2a2018;border-radius:10px;background:#120c10;">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#f0d080;font-weight:bold;">${escapeHtml(j.title)}</div>
      <div style="font-size:13px;color:#b8ad90;margin-top:4px;">${escapeHtml(j.company)}${j.location ? " &middot; " + escapeHtml(j.location) : ""}</div>
      ${j.url ? `<a href="${escapeHtml(j.url)}" style="display:inline-block;margin-top:11px;font-size:12px;color:#0a0608;background:#c9a84c;text-decoration:none;padding:7px 16px;border-radius:8px;font-weight:bold;">View posting &rarr;</a>` : ""}
    </td></tr>
    <tr><td style="height:10px;line-height:10px;">&nbsp;</td></tr>`).join("");
  return shell(`
    <p style="font-size:14px;color:#d8ceb4;line-height:1.6;margin:0 0 4px;">${name ? "Hail, " + escapeHtml(name) + "." : "Hail, adventurer."} New postings match your job alerts:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">${rows}</table>
    <div style="text-align:center;margin-top:20px;">
      <a href="${SITE_URL}/" style="font-size:13px;color:#c9a84c;text-decoration:none;">Open the full job board &rarr;</a>
    </div>
    <p style="font-size:11px;color:#5f5749;text-align:center;margin-top:28px;line-height:1.5;">You're receiving this because you set up job alerts on Main Quest.<br/>Manage or turn these off anytime from the inbox on the site.</p>
  `);
}

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

// ── Support tickets ──
export async function sendSupportTicket({ name, email, reason, message }){
  if(!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
  const to = process.env.SUPPORT_EMAIL;
  if(!to) throw new Error("SUPPORT_EMAIL is not set");
  const esc = escapeHtml;
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
  return resend.emails.send({ from: FROM, to, subject: `[Support · ${reason}] from ${name}`, html });
}