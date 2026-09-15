import { Resend } from "resend";

// The Resend client reads your API key from the environment.
const resend = new Resend(process.env.RESEND_API_KEY);

// Who the email comes FROM.
// - Until you verify a domain in Resend, use "onboarding@resend.dev" (it works,
//   but ONLY delivers to the email address on your own Resend account).
// - Once you verify a domain (e.g. mainquest.gg), set RESEND_FROM in your env to
//   something like "Main Quest <alerts@mainquest.gg>" and this picks it up.
const FROM = process.env.RESEND_FROM || "Main Quest <onboarding@resend.dev>";

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
        <a href="https://main-quest-beta.vercel.app/" style="font-size:13px;color:#c9a84c;text-decoration:none;">Open the full job board &rarr;</a>
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

// ── Account / security emails ─────────────────────────────────
function _mqShell(title, bodyHtml){
  return `<!doctype html><html><body style="margin:0;padding:0;background:#080608;">
    <div style="max-width:520px;margin:0 auto;padding:28px 20px;font-family:Arial,Helvetica,sans-serif;">
      <div style="text-align:center;margin-bottom:22px;"><div style="font-family:Georgia,serif;font-size:24px;font-weight:bold;letter-spacing:2px;color:#f0d080;">MAIN QUEST</div></div>
      <div style="background:#120c10;border:1px solid #2a2018;border-radius:12px;padding:22px 20px;">
        <div style="font-family:Georgia,serif;font-size:18px;color:#f0d080;font-weight:bold;margin-bottom:12px;">${escapeHtml(title)}</div>
        ${bodyHtml}
      </div>
      <p style="font-size:11px;color:#5f5749;text-align:center;margin-top:22px;line-height:1.5;">Main Quest · The game-industry job board</p>
    </div></body></html>`;
}

export async function sendWelcomeEmail(to, name){
  if(!process.env.RESEND_API_KEY) return;
  const body = `
    <p style="font-size:14px;color:#d8ceb4;line-height:1.6;margin:0 0 12px;">${name?"Welcome, "+escapeHtml(name)+"!":"Welcome, adventurer!"}</p>
    <p style="font-size:13px;color:#b8ad90;line-height:1.6;margin:0 0 14px;">Your Main Quest account is ready. Browse studios worldwide, track your applications, and set alerts so new roles come to you.</p>
    <p style="font-size:13px;color:#b8ad90;line-height:1.6;margin:0 0 18px;">A good first step: upload your resume to unlock your job match scores.</p>
    <a href="https://mainquestjobs.com/" style="display:inline-block;font-size:13px;color:#0a0608;background:#c9a84c;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:bold;">Open Main Quest &rarr;</a>`;
  return resend.emails.send({ from: FROM, to, subject: "Welcome to Main Quest", html: _mqShell("Welcome to Main Quest", body) });
}

export async function sendPasswordChangedEmail(to, name){
  if(!process.env.RESEND_API_KEY) return;
  const body = `
    <p style="font-size:14px;color:#d8ceb4;line-height:1.6;margin:0 0 12px;">${name?"Hi "+escapeHtml(name)+",":"Hi,"}</p>
    <p style="font-size:13px;color:#b8ad90;line-height:1.6;margin:0 0 14px;">The password for your Main Quest account was just changed.</p>
    <p style="font-size:13px;color:#b8ad90;line-height:1.6;margin:0;">If this was you, no action is needed. If you did <b style="color:#e8a06a;">not</b> make this change, reset your password immediately and contact support.</p>`;
  return resend.emails.send({ from: FROM, to, subject: "Your Main Quest password was changed", html: _mqShell("Password Changed", body) });
}

export async function sendNewDeviceEmail(to, name, info){
  if(!process.env.RESEND_API_KEY) return;
  const when = new Date().toUTCString();
  const body = `
    <p style="font-size:14px;color:#d8ceb4;line-height:1.6;margin:0 0 12px;">${name?"Hi "+escapeHtml(name)+",":"Hi,"}</p>
    <p style="font-size:13px;color:#b8ad90;line-height:1.6;margin:0 0 14px;">We noticed a sign-in to your Main Quest account from a new device or browser.</p>
    <div style="font-size:12px;color:#8a7f68;background:#0d0a0e;border:1px solid #241c16;border-radius:8px;padding:12px 14px;margin:0 0 16px;line-height:1.6;">
      <div><b style="color:#b8ad90;">When:</b> ${escapeHtml(when)}</div>
      <div><b style="color:#b8ad90;">Device:</b> ${escapeHtml((info&&info.device)||"Unknown")}</div>
    </div>
    <p style="font-size:13px;color:#b8ad90;line-height:1.6;margin:0;">If this was you, you can ignore this email. If not, change your password right away.</p>`;
  return resend.emails.send({ from: FROM, to, subject: "New sign-in to your Main Quest account", html: _mqShell("New Sign-In Detected", body) });
}