import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { fetchAllJobs } from "../../../lib/atsLite";
import { asAlertArray, alertHasCriteria, jobMatchesAnyAlert } from "../../../lib/matchAlert";
import { sendJobAlertEmail } from "../../../lib/resend";

// Frequent scan (every ~15 min via crontab) for PREMIUM personalized job alerts
// only. Because the job cache refreshes on user traffic, this pings a user close
// to when a matching posting first appears — rather than waiting for the daily
// scan. Company-follow (bell) alerts stay in the daily cron. De-dups via each
// user's `emailedKeys` so nobody is pinged twice (shared with the daily scan).
export default async function handler(req, res){
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.authorization || "";
  const authorized = secret && (auth === `Bearer ${secret}` || req.query.key === secret);
  if(secret && !authorized) return res.status(401).json({ error: "unauthorized" });

  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://mainquestjobs.com";
  const started = Date.now();

  try{
    // Premium users with an active personalized alert wizard.
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles").select("id,name,data,is_premium");
    if(error) throw error;
    const candidates = (profiles || []).filter(p =>
      p.is_premium && alertHasCriteria((p.data || {}).jobAlerts)
    );
    if(candidates.length === 0){
      return res.status(200).json({ ok: true, users: 0, note: "no premium users with alerts" });
    }

    const jobs = await fetchAllJobs(base);

    let emailedUsers = 0, totalNew = 0;
    for(const p of candidates){
      const d = p.data || {};
      const emailOn = d.emailJobAlerts !== false;
      const inAppOn = d.notifications !== false;
      if(!emailOn && !inAppOn) continue;

      const alerts = asAlertArray(d.jobAlerts);
      const emailedKeys = new Set(d.emailedKeys || []);
      const inbox = d.inbox || [];
      const inboxKeys = new Set(inbox.map(n => n.jobKey));

      // Postings matching this user's personalized criteria.
      const allMatches = [];
      for(const j of jobs){
        if(!jobMatchesAnyAlert(j, alerts)) continue;
        const jobKey = `${j.company}|${j.title}|${j.location || ""}`;
        allMatches.push({ jobKey, title: j.title, company: j.company, location: j.location || "", url: j.url || base });
      }
      if(allMatches.length === 0) continue;

      // Email only postings not emailed before (capped).
      if(emailOn){
        const toEmail = allMatches.filter(m => !emailedKeys.has(m.jobKey)).slice(0, 25);
        if(toEmail.length){
          toEmail.forEach(m => emailedKeys.add(m.jobKey));
          let email = null;
          try{ const u = await supabaseAdmin.auth.admin.getUserById(p.id); email = (u && u.data && u.data.user && u.data.user.email) || null; }
          catch(e){}
          if(email){
            try{ await sendJobAlertEmail(email, p.name || "", toEmail); emailedUsers++; }
            catch(e){}
          }
        }
      }

      const newInboxItems = inAppOn
        ? allMatches.filter(m => !inboxKeys.has(m.jobKey))
            .map(m => ({ id: m.jobKey, jobKey: m.jobKey, title: m.title, company: m.company, location: m.location, ts: Date.now(), read: false }))
        : [];
      totalNew += allMatches.length;

      // Only write if something actually changed, to keep this light on frequent runs.
      const changedEmail = emailOn && [...emailedKeys].length !== (d.emailedKeys || []).length;
      if(changedEmail || newInboxItems.length){
        const nextData = {
          ...d,
          emailedKeys: [...emailedKeys].slice(-800),
          inbox: [...newInboxItems, ...inbox].slice(0, 100),
          lastInstantScan: Date.now(),
        };
        await supabaseAdmin.from("profiles").upsert({ id: p.id, name: p.name, data: nextData }, { onConflict: "id" });
      }
    }

    return res.status(200).json({ ok: true, users: candidates.length, jobs: jobs.length, emailedUsers, newMatches: totalNew, ms: Date.now() - started });
  }catch(e){
    return res.status(500).json({ ok: false, error: e.message });
  }
}

export const config = { maxDuration: 60 };