// GET /api/cron/expire-trials — reverts lapsed student trials to Basic.
// Only downgrades trial-only accounts (is_premium set, premiumUntil passed, and NO
// active Stripe subscription). Real subscribers are never touched.
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { heartbeat } from "../../../lib/heartbeat";

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.authorization || "";
  const authorized = secret && (auth === `Bearer ${secret}` || req.query.key === secret);
  if (secret && !authorized) return res.status(401).json({ error: "unauthorized" });

  const now = Date.now();
  const ACTIVE = new Set(["active", "trialing", "past_due"]);
  try {
    const { data: profs, error } = await supabaseAdmin
      .from("profiles").select("id,name,is_premium,subscription_status,data").eq("is_premium", true);
    if (error) throw error;

    let reverted = 0;
    for (const p of profs || []) {
      const d = (p.data && typeof p.data === "object") ? p.data : {};
      const until = d.premiumUntil ? Number(d.premiumUntil) : 0;
      const trialLapsed = until && until < now;
      const hasActiveSub = ACTIVE.has(String(p.subscription_status || "").toLowerCase());
      if (trialLapsed && !hasActiveSub) {
        const nextData = { ...d, premiumUntil: null, studentTrialExpired: true };
        await supabaseAdmin.from("profiles").upsert(
          { id: p.id, name: p.name, is_premium: false, data: nextData }, { onConflict: "id" }
        );
        reverted++;
      }
    }
    await heartbeat("expire-trials", true, `reverted ${reverted}`);
    return res.status(200).json({ ok: true, reverted });
  } catch (e) {
    await heartbeat("expire-trials", false, e.message);
    return res.status(500).json({ error: "server error", detail: String((e && e.message) || e) });
  }
}