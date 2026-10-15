import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { effectiveTier } from "../../../lib/entitlements";
import { fetchAllJobs } from "../../../lib/atsLite";
import { asAlertArray, alertHasCriteria, jobMatchesAnyAlert } from "../../../lib/matchAlert";
import { sendJobAlertEmail } from "../../../lib/resend";
import { heartbeat } from "../../../lib/heartbeat";

// Frequent scan (every ~15 min via crontab) for personalized (Plus+) job alerts.
//
// EGRESS NOTE: this runs very often, so it reads ONLY the few JSON keys it needs from
// each profile's `data` blob (not resumeText, work history, etc.). When a user actually
// needs a write, we re-read that one user's full `data` first so nothing else is lost.
export default async function handler(req, res){
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.authorization || "";
  const authorized = secret && (auth === `Bearer ${secret}` || req.query.key === secret);
  if(secret && !authorized) return res.status(401).json({ error: "unauthorized" });

  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://mainquestjobs.com";
  const started = Date.now();

  try{
    // Lightweight read: just the alert/delivery/dedup keys + tier inputs.
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("id,name,is_premium,plan,jobAlerts:data->jobAlerts,emailJobAlerts:data->emailJobAlerts,notifications:data->notifications,emailedKeys:data->emailedKeys,seenInboxKeys:data->seenInboxKeys,inbox:data->inbox,premiumUntil:data->premiumUntil,studentTrialRedeemed:data->studentTrialRedeemed");
    if(error) throw error;
    const candidates = (profiles || []).filter(p =>
      effectiveTier({ is_premium: p.is_premium, plan: p.plan, data: { premiumUntil: p.premiumUntil, studentTrialRedeemed: p.studentTrialRedeemed } }).isPlus
      && alertHasCriteria(p.jobAlerts)
    );
    if(candidates.length === 0){
      await heartbeat("scan-instant-alerts", true, "no premium users with alerts");
      return res.status(200).json({ ok: true, users: 0, note: "no premium users with alerts" });
    }

    const jobs = await fetchAllJobs(base);

    let emailedUsers = 0, totalNew = 0;
    for(const p of candidates){
      const emailOn = p.emailJobAlerts !== false;
      const inAppOn = p.notifications !== false;
      if(!emailOn && !inAppOn) continue;

      const alerts = asAlertArray(p.jobAlerts);
      const emailedKeys = new Set(p.emailedKeys || []);
      const inbox = p.inbox || [];
      const seenKeys = new Set(p.seenInboxKeys || []);
      inbox.forEach(n => n.jobKey && seenKeys.add(n.jobKey));

      const allMatches = [];
      for(const j of jobs){
        if(!jobMatchesAnyAlert(j, alerts)) continue;
        const jobKey = `${j.company}|${j.title}|${j.location || ""}`;
        allMatches.push({ jobKey, title: j.title, company: j.company, location: j.location || "", url: j.url || base });
      }
      if(allMatches.length === 0) continue;

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
        ? allMatches.filter(m => !seenKeys.has(m.jobKey))
            .map(m => ({ id: m.jobKey, jobKey: m.jobKey, title: m.title, company: m.company, location: m.location, ts: Date.now(), read: false }))
        : [];
      newInboxItems.forEach(m => seenKeys.add(m.jobKey));
      totalNew += allMatches.length;

      const changedEmail = emailOn && [...emailedKeys].length !== (p.emailedKeys || []).length;
      const changedSeen = seenKeys.size !== (p.seenInboxKeys || []).length;
      if(changedEmail || newInboxItems.length || changedSeen){
        // Re-read this ONE user's full data so the write preserves everything else.
        const { data: fr } = await supabaseAdmin.from("profiles").select("data").eq("id", p.id).single();
        const fd = (fr && fr.data && typeof fr.data === "object") ? fr.data : {};
        const nextData = {
          ...fd,
          emailedKeys: [...emailedKeys].slice(-800),
          seenInboxKeys: [...seenKeys].slice(-1500),
          inbox: [...newInboxItems, ...(fd.inbox || inbox)].slice(0, 100),
          lastInstantScan: Date.now(),
        };
        await supabaseAdmin.from("profiles").update({ data: nextData }).eq("id", p.id);
      }
    }

    await heartbeat("scan-instant-alerts", true, `emailed ${emailedUsers}`);
    return res.status(200).json({ ok: true, users: candidates.length, jobs: jobs.length, emailedUsers, newMatches: totalNew, ms: Date.now() - started });
  }catch(e){
    await heartbeat("scan-instant-alerts", false, e.message);
    return res.status(500).json({ ok: false, error: e.message });
  }
}

export const config = { maxDuration: 60 };