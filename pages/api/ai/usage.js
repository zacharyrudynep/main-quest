import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const TAILOR_LIMIT = 15;   // must match tailor-resume.js
const COMPANY_LIMIT = 25;  // must match email-company.js
const INTERVIEW_LIMIT = 10; // must match interview-prep.js

// GET -> this month's AI usage for the signed-in user.
export default async function handler(req, res) {
  try {
    const authz = req.headers.authorization || "";
    const tok = authz.startsWith("Bearer ") ? authz.slice(7) : "";
    if (!tok) return res.status(401).json({ error: "Please sign in." });
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(tok);
    if (ue || !u || !u.user) return res.status(401).json({ error: "Please sign in." });

    const { data: prof } = await supabaseAdmin.from("profiles").select("is_admin").eq("id", u.user.id).single();
    const isAdmin = !!(prof && prof.is_admin);
    const month = new Date().toISOString().slice(0, 7);
    const read = async (tbl) => {
      const { data } = await supabaseAdmin.from(tbl).select("count").eq("user_id", u.user.id).eq("month", month).single();
      return (data && data.count) || 0;
    };
    const [tailorUsed, companyUsed, interviewUsed] = await Promise.all([read("ai_tailor_usage"), read("ai_email_usage"), read("ai_interview_usage")]);
    return res.status(200).json({
      isAdmin,
      tailor: { used: tailorUsed, limit: TAILOR_LIMIT },
      company: { used: companyUsed, limit: COMPANY_LIMIT },
      interview: { used: interviewUsed, limit: INTERVIEW_LIMIT },
    });
  } catch (e) {
    return res.status(500).json({ error: "Could not load usage." });
  }
}