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
    // 1) Premium users who have set up alerts.
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles").select("id,name,data,is_premium").eq("is_premium", true);
    if(error) throw error;
    const candidates = (profiles || []).filter(p => alertHasCriteria(p.data && p.data.jobAlerts));
    if(candidates.length === 0){
      return res.status(200).json({ ok: true, users: 0, note: "no premium users with alerts" });
    }

    // 2) Fetch all current jobs once (shared across users).
    const jobs = await fetchAllJobs(base);

    let emailedUsers = 0, totalNew = 0;
    for(const p of candidates){
      const d = p.data || {};
      if(d.emailJobAlerts === false) continue; // user turned email off (badges still work)

      const alerts = asAlertArray(d.jobAlerts);
      const emailedKeys = new Set(d.emailedKeys || []);
      const inbox = d.inbox || [];
      const inboxKeys = new Set(inbox.map(n => n.jobKey));

      // New = matches we haven't emailed this user before.
      const fresh = [];
      for(const j of jobs){
        if(!jobMatchesAnyAlert(j, alerts)) continue;
        const jobKey = `${j.company}|${j.title}|${j.location || ""}`;
        if(emailedKeys.has(jobKey)) continue;
        emailedKeys.add(jobKey);
        fresh.push({ jobKey, title: j.title, company: j.company, location: j.location || "", url: j.url || base });
        if(fresh.length >= 40) break;
      }
      if(fresh.length === 0) continue;

      // 3) Look up the user's email address and send.
      let email = null;
      try{
        const u = await supabaseAdmin.auth.admin.getUserById(p.id);
        email = (u && u.data && u.data.user && u.data.user.email) || null;
      }catch(e){ /* no email → skip send, still record so we don't retry forever */ }
      if(email){
        try{ await sendJobAlertEmail(email, p.name || "", fresh.slice(0, 25)); emailedUsers++; }
        catch(e){ /* send failed (quota, bad address) → continue; keys still recorded */ }
      }
      totalNew += fresh.length;

      // 4) Persist: record emailed keys + add matches to the on-site inbox (deduped).
      const newInboxItems = fresh
        .filter(f => !inboxKeys.has(f.jobKey))
        .map(f => ({ id: f.jobKey, jobKey: f.jobKey, title: f.title, company: f.company, location: f.location, ts: Date.now(), read: false }));
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
