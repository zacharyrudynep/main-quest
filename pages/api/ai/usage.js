import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { effectiveTier } from "../../../lib/entitlements";

const AI_LIMIT = 40; // shared monthly AI usage pool (must match the AI routes)

// GET -> this month's AI usage for the signed-in user.
export default async function handler(req, res) {
  try {
    const authz = req.headers.authorization || "";
    const tok = authz.startsWith("Bearer ") ? authz.slice(7) : "";
    if (!tok) return res.status(401).json({ error: "Please sign in." });
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(tok);
    if (ue || !u || !u.user) return res.status(401).json({ error: "Please sign in." });

    const { data: prof } = await supabaseAdmin.from("profiles").select("is_premium,is_admin,plan,data").eq("id", u.user.id).single();
    const t = effectiveTier(prof);
    const isAdmin = t.isAdmin, isStudent = t.isStudent;
    const unlimited = isAdmin || isStudent; // no monthly cap (active student trial / admin)
    const month = new Date().toISOString().slice(0, 7);
    const read = async (tbl) => {
      const { data } = await supabaseAdmin.from(tbl).select("count").eq("user_id", u.user.id).eq("month", month).single();
      return (data && data.count) || 0;
    };
    const used = await read("ai_usage");
    return res.status(200).json({ isAdmin, isStudent, unlimited, used, limit: AI_LIMIT, premiumUntil: t.premiumUntil });
  } catch (e) {
    return res.status(500).json({ error: "Could not load usage." });
  }
}