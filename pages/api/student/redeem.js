// POST /api/student/redeem { email, otp, code }  (auth required)
// Verifies the school-email OTP + the student code, enforces one-per-account and
// one-per-school-email, then grants a Premium trial for `days_granted` days.
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { normEmail } from "../../../lib/entitlements";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return res.status(401).json({ error: "Please sign in." });
    const { data: u } = await supabaseAdmin.auth.getUser(token);
    if (!u || !u.user) return res.status(401).json({ error: "Please sign in." });
    const uid = u.user.id;

    const email = normEmail(req.body && req.body.email);
    const otp = String((req.body && req.body.otp) || "").trim();
    const code = String((req.body && req.body.code) || "").trim();
    if (!email || !otp || !code) return res.status(400).json({ error: "Missing code, email, or verification code." });

    // ── verify the student code is still valid ──
    const { data: cr } = await supabaseAdmin.from("student_codes").select("*").ilike("code", code).maybeSingle();
    if (!cr || cr.active === false) return res.status(400).json({ error: "That code isn't valid." });
    if (cr.expires_at && new Date(cr.expires_at) < new Date()) return res.status(400).json({ error: "That code has expired." });
    if (cr.max_redemptions != null && (cr.redeemed_count || 0) >= cr.max_redemptions) return res.status(400).json({ error: "That code has reached its redemption limit." });

    // ── verify the OTP ──
    const { data: otpRow } = await supabaseAdmin.from("student_email_otps").select("*").eq("email", email).maybeSingle();
    if (!otpRow) return res.status(400).json({ error: "No code on file for that email — request a new one." });
    if (new Date(otpRow.expires_at) < new Date()) return res.status(400).json({ error: "That verification code has expired — request a new one." });
    if ((otpRow.attempts || 0) >= 5) return res.status(429).json({ error: "Too many attempts — request a new code." });
    const hash = crypto.createHash("sha256").update(otp + "|" + (process.env.CRON_SECRET || "mq")).digest("hex");
    if (hash !== otpRow.code_hash) {
      await supabaseAdmin.from("student_email_otps").update({ attempts: (otpRow.attempts || 0) + 1 }).eq("email", email);
      return res.status(400).json({ error: "That verification code is incorrect." });
    }

    // ── re-check eligibility right before granting ──
    const { data: takenEmail } = await supabaseAdmin.from("student_redemptions").select("id").ilike("school_email", email).maybeSingle();
    if (takenEmail) return res.status(409).json({ error: "That school email has already been used for a student trial." });
    const { data: mine } = await supabaseAdmin.from("student_redemptions").select("id").eq("user_id", uid).maybeSingle();
    if (mine) return res.status(409).json({ error: "This account has already redeemed a student trial." });

    // ── grant: is_premium column (so existing gates work) + premiumUntil in data ──
    const days = cr.days_granted || 30;
    const premiumUntil = Date.now() + days * 86400000;
    const { data: prof } = await supabaseAdmin.from("profiles").select("name,data").eq("id", uid).single();
    const d = (prof && prof.data && typeof prof.data === "object") ? prof.data : {};
    const nextData = { ...d, premiumUntil, studentTrialRedeemed: true, studentCode: cr.code, studentVerifiedAt: Date.now() };
    const { error: upErr } = await supabaseAdmin.from("profiles").upsert(
      { id: uid, name: prof && prof.name, is_premium: true, data: nextData }, { onConflict: "id" }
    );
    if (upErr) return res.status(500).json({ error: "Couldn't apply your trial — please contact support." });

    // ── record redemption (unique on user + on school_email) ──
    const { error: redErr } = await supabaseAdmin.from("student_redemptions").insert({ user_id: uid, code: cr.code, school_email: email });
    if (redErr) {
      // Unique-violation race → someone just claimed it. Roll back the grant.
      await supabaseAdmin.from("profiles").upsert({ id: uid, name: prof && prof.name, is_premium: false, data: d }, { onConflict: "id" });
      return res.status(409).json({ error: "That trial was just claimed — please contact support if this is a mistake." });
    }
    await supabaseAdmin.from("student_codes").update({ redeemed_count: (cr.redeemed_count || 0) + 1 }).eq("code", cr.code);
    await supabaseAdmin.from("student_email_otps").delete().eq("email", email);

    return res.status(200).json({ ok: true, premiumUntil, days });
  } catch (e) {
    return res.status(500).json({ error: "server error" });
  }
}