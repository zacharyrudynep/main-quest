// POST /api/student/send-otp { email }  (auth required)
// Validates the address is a university email and hasn't already claimed a trial,
// then emails a 6-digit code. The school email is ONLY used to prove eligibility.
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { isAcademicEmail, normEmail } from "../../../lib/entitlements";
import { sendStudentOtpEmail } from "../../../lib/resend";
import crypto from "crypto";

const OTP_TTL_MIN = 15;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return res.status(401).json({ error: "Please sign in." });
    const { data: u } = await supabaseAdmin.auth.getUser(token);
    if (!u || !u.user) return res.status(401).json({ error: "Please sign in." });

    const email = normEmail(req.body && req.body.email);
    if (!isAcademicEmail(email)) {
      return res.status(400).json({ error: "Please use a standard university email (.edu, .ac.uk, .edu.au, etc.). Trouble? Contact support and we'll verify you quickly." });
    }
    // Already used for a trial by anyone?
    const { data: taken } = await supabaseAdmin
      .from("student_redemptions").select("id").ilike("school_email", email).maybeSingle();
    if (taken) return res.status(409).json({ error: "That school email has already been used for a student trial." });

    // Already claimed a trial on this account?
    const { data: mine } = await supabaseAdmin
      .from("student_redemptions").select("id").eq("user_id", u.user.id).maybeSingle();
    if (mine) return res.status(409).json({ error: "This account has already redeemed a student trial." });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const code_hash = crypto.createHash("sha256").update(otp + "|" + (process.env.CRON_SECRET || "mq")).digest("hex");
    const expires_at = new Date(Date.now() + OTP_TTL_MIN * 60000).toISOString();
    await supabaseAdmin.from("student_email_otps").upsert(
      { email, code_hash, expires_at, attempts: 0, created_at: new Date().toISOString() },
      { onConflict: "email" }
    );
    try { await sendStudentOtpEmail(email, otp); }
    catch (e) { return res.status(502).json({ error: "Couldn't send the code — please try again or contact support." }); }

    return res.status(200).json({ ok: true, ttlMinutes: OTP_TTL_MIN });
  } catch (e) {
    return res.status(500).json({ error: "server error" });
  }
}