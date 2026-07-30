import { sendJobAlertEmail } from "../../../lib/resend";

// Quick way to confirm Resend is wired up. Visit:
//   /api/email/test?to=YOUR_EMAIL&key=YOUR_CRON_SECRET
// It sends a sample alert email to `to` and reports the result as JSON.
export default async function handler(req, res){
  // Protect the endpoint so nobody can burn your daily email quota.
  const secret = process.env.CRON_SECRET;
  if(secret && req.query.key !== secret){
    return res.status(401).json({ error: "unauthorized — add ?key=YOUR_CRON_SECRET" });
  }
  const to = req.query.to;
  if(!to) return res.status(400).json({ error: "add ?to=you@example.com" });

  const sample = [
    { title: "Senior Gameplay Programmer", company: "Riot Games", location: "Los Angeles, CA", url: "https://main-quest-beta.vercel.app/" },
    { title: "Technical Artist", company: "Bungie", location: "Remote", url: "https://main-quest-beta.vercel.app/" },
  ];

  try{
    const r = await sendJobAlertEmail(to, "Adventurer", sample);
    if(r && r.error){
      // Resend returned an error object (e.g. domain not verified, invalid recipient).
      return res.status(400).json({ ok: false, error: r.error });
    }
    return res.status(200).json({ ok: true, id: r && r.data ? r.data.id : null });
  }catch(e){
    return res.status(500).json({ ok: false, error: e.message });
  }
}
