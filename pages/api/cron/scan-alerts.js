import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { fetchAllJobs } from "../../../lib/atsLite";
import { asAlertArray, alertHasCriteria, jobMatchesAnyAlert } from "../../../lib/matchAlert";
import { sendJobAlertEmail } from "../../../lib/resend";

// Runs once a day (see vercel.json). For each premium user with job alerts, finds
// newly-matching postings, emails them, and drops the matches into their on-site
// inbox. De-dups via a per-user `emailedKeys` list so nobody is pinged twice.
export default async function handler(req, res){
  // Vercel Cron sends "Authorization: Bearer <CRON_SECRET>" automatically when the
  // CRON_SECRET env var is set. We also accept ?key= for manual test runs.
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.authorization || "";
  const authorized = secret && (auth === `Bearer ${secret}` || req.query.key === secret);
  if(secret && !authorized) return res.status(401).json({ error: "unauthorized" });

  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://main-quest-beta.vercel.app";
  const started = Date.now();

  try{
    // 1) Users who have followed companies (any tier) OR a premium alert wizard.
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles").select("id,name,data,is_premium");
    if(error) throw error;
    const candidates = (profiles || []).filter(p => {
      const d = p.data || {};
      const hasFollows = Array.isArray(d.notifyCompanies) && d.notifyCompanies.length > 0;
      const hasWizard = p.is_premium && alertHasCriteria(d.jobAlerts);
      return hasFollows || hasWizard;
    });
    if(candidates.length === 0){
      return res.status(200).json({ ok: true, users: 0, note: "no users with follows or alerts" });
    }

    // 2) Fetch all current jobs once (shared across users).
    const jobs = await fetchAllJobs(base);

    let emailedUsers = 0, totalNew = 0;
    for(const p of candidates){
      const d = p.data || {};
      const emailOn = d.emailJobAlerts !== false;   // email delivery toggle (default on)
      const inAppOn = d.notifications !== false;     // inbox delivery toggle (default on)
      if(!emailOn && !inAppOn) continue;             // both channels off — nothing to deliver

      const alerts = asAlertArray(d.jobAlerts);
      const wizardOn = p.is_premium && alertHasCriteria(alerts);
      const followed = (d.notifyCompanies || []).map(c => String(c).toLowerCase());
      const emailedKeys = new Set(d.emailedKeys || []);
      const inbox = d.inbox || [];
      const inboxKeys = new Set(inbox.map(n => n.jobKey));

      // Every current posting that matches a followed company or the premium wizard.
      const allMatches = [];
      for(const j of jobs){
        const followHit = followed.length && followed.includes((j.company || "").toLowerCase());
        const wizardHit = wizardOn && jobMatchesAnyAlert(j, alerts);
        if(!(followHit || wizardHit)) continue;
        const jobKey = `${j.company}|${j.title}|${j.location || ""}`;
        allMatches.push({ jobKey, title: j.title, company: j.company, location: j.location || "", url: j.url || base });
      }
      if(allMatches.length === 0) continue;

      // Email: only postings not emailed to this user before (capped), if the toggle is on.
      if(emailOn){
        const toEmail = allMatches.filter(m => !emailedKeys.has(m.jobKey)).slice(0, 25);
        if(toEmail.length){
          toEmail.forEach(m => emailedKeys.add(m.jobKey));
          let email = null;
          try{ const u = await supabaseAdmin.auth.admin.getUserById(p.id); email = (u && u.data && u.data.user && u.data.user.email) || null; }
          catch(e){ /* no email → skip send */ }
          if(email){
            try{ await sendJobAlertEmail(email, p.name || "", toEmail); emailedUsers++; }
            catch(e){ /* send failed → keys still recorded, continue */ }
          }
        }
      }

      // Inbox: only postings not already in the inbox, if the toggle is on.
      const newInboxItems = inAppOn
        ? allMatches.filter(m => !inboxKeys.has(m.jobKey))
            .map(m => ({ id: m.jobKey, jobKey: m.jobKey, title: m.title, company: m.company, location: m.location, ts: Date.now(), read: false }))
        : [];
      totalNew += allMatches.length;

      const nextData = {
        ...d,
        emailedKeys: [...emailedKeys].slice(-800),
        inbox: [...newInboxItems, ...inbox].slice(0, 100),
        lastEmailScan: Date.now(),
      };
      await supabaseAdmin.from("profiles").upsert({ id: p.id, name: p.name, data: nextData }, { onConflict: "id" });
    }

    return res.status(200).json({ ok: true, users: candidates.length, jobs: jobs.length, emailedUsers, newMatches: totalNew, ms: Date.now() - started });
  }catch(e){
    return res.status(500).json({ ok: false, error: e.message });
  }
}

// This route fans out to ~200 upstream fetches; give it room to finish.
export const config = { maxDuration: 60 };