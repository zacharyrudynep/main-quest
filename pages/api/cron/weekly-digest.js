// GET /api/cron/weekly-digest — once a week, emails each user who turned on the
// "Weekly email digest" toggle a summary of new roles matching their alerts or
// followed studios. De-dups via a per-user `digestedKeys` list so the same posting
// isn't sent in two consecutive digests; skips users with nothing new.
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { fetchAllJobs } from "../../../lib/atsLite";
import { asAlertArray, alertHasCriteria, jobMatchesAnyAlert } from "../../../lib/matchAlert";
import { sendWeeklyDigest } from "../../../lib/resend";

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.authorization || "";
  const authorized = secret && (auth === `Bearer ${secret}` || req.query.key === secret);
  if (secret && !authorized) return res.status(401).json({ error: "unauthorized" });

  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://mainquestjobs.com";
  const started = Date.now();
  try {
    const { data: profiles, error } = await supabaseAdmin.from("profiles").select("id,name,data");
    if (error) throw error;
    const candidates = (profiles || []).filter(p => (p.data || {}).weeklyDigest === true);
    if (candidates.length === 0) {
      return res.status(200).json({ ok: true, users: 0, note: "no users opted into the weekly digest" });
    }

    const jobs = await fetchAllJobs(base);

    let sent = 0;
    for (const p of candidates) {
      const d = p.data || {};
      const alerts = asAlertArray(d.jobAlerts);
      const hasAlerts = alertHasCriteria(alerts);
      const followed = (d.notifyCompanies || []).map(c => String(c).toLowerCase());
      if (!hasAlerts && followed.length === 0) continue; // nothing to match against

      const digestedKeys = new Set(d.digestedKeys || []);
      const seenThis = new Set();
      const matches = [];
      for (const j of jobs) {
        const key = `${j.company}|${j.title}|${j.location || ""}`;
        if (seenThis.has(key) || digestedKeys.has(key)) continue;
        const hit = (hasAlerts && jobMatchesAnyAlert(j, alerts)) ||
                    (followed.length && followed.includes((j.company || "").toLowerCase()));
        if (!hit) continue;
        seenThis.add(key);
        matches.push({ jobKey: key, title: j.title, company: j.company, location: j.location || "", url: j.url || base });
      }
      if (matches.length === 0) continue; // nothing new this week — don't send an empty digest
      const top = matches.slice(0, 12);

      let email = null;
      try { const u = await supabaseAdmin.auth.admin.getUserById(p.id); email = (u && u.data && u.data.user && u.data.user.email) || null; }
      catch (e) { /* no email → skip */ }
      if (!email) continue;

      try { await sendWeeklyDigest(email, p.name || "", top); sent++; }
      catch (e) { continue; } // send failed → don't record keys, try again next week

      top.forEach(m => digestedKeys.add(m.jobKey));
      const nextData = { ...d, digestedKeys: [...digestedKeys].slice(-1500), lastDigestAt: Date.now() };
      await supabaseAdmin.from("profiles").upsert({ id: p.id, name: p.name, data: nextData }, { onConflict: "id" });
    }

    return res.status(200).json({ ok: true, users: candidates.length, jobs: jobs.length, sent, ms: Date.now() - started });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
