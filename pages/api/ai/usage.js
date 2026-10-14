import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const AI_LIMIT = 40; // shared monthly AI usage pool (must match the AI routes)

// GET -> this month's AI usage for the signed-in user.
export default async function handler(req, res) {
  try {
    const authz = req.headers.authorization || "";
    const tok = authz.startsWith("Bearer ") ? authz.slice(7) : "";
    if (!tok) return res.status(401).json({ error: "Please sign in." });
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(tok);
    if (ue || !u || !u.user) return res.status(401).json({ error: "Please sign in." });

    const { data: prof } = await supabaseAdmin.from("profiles").select("is_admin,data").eq("id", u.user.id).single();
    const isAdmin = !!(prof && prof.is_admin);
    const d = (prof && prof.data && typeof prof.data === "object") ? prof.data : {};
    const isStudent = !!(d.studentTrialRedeemed && d.premiumUntil && Number(d.premiumUntil) > Date.now());
    const unlimited = isAdmin || isStudent; // no monthly cap
    const month = new Date().toISOString().slice(0, 7);
    const read = async (tbl) => {
      const { data } = await supabaseAdmin.from(tbl).select("count").eq("user_id", u.user.id).eq("month", month).single();
      return (data && data.count) || 0;
    };
    const used = await read("ai_usage");
    return res.status(200).json({ isAdmin, isStudent, unlimited, used, limit: AI_LIMIT });
  } catch (e) {
    return res.status(500).json({ error: "Could not load usage." });
  }
}