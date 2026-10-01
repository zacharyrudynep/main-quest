import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").toLowerCase();

// Owner-only: full user directory with complete profile + résumé text per account.
export default async function handler(req, res) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return res.status(401).json({ error: "no token" });
    if (!ADMIN_EMAIL) return res.status(500).json({ error: "ADMIN_EMAIL not configured" });
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(token);
    const em = ((u && u.user && u.user.email) || "").toLowerCase();
    if (ue || !em || em !== ADMIN_EMAIL) return res.status(403).json({ error: "forbidden" });

    // 1) Auth users -> email / created / last sign-in / verified (paginated).
    const authById = {};
    for (let page = 1; page <= 50; page++) {
      const { data } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
      const list = (data && data.users) || [];
      for (const au of list) {
        authById[au.id] = {
          email: au.email || "",
          created: au.created_at || null,
          lastSignIn: au.last_sign_in_at || null,
          emailVerified: !!(au.email_confirmed_at || (au.app_metadata && au.app_metadata.email_verified)),
        };
      }
      if (list.length < 1000) break;
    }

    // 2) Profiles (the JSONB `data` holds every profile field).
    const { data: profs } = await supabaseAdmin
      .from("profiles").select("id,data,is_premium,plan,created_at").limit(100000);

    // 3) Applied counts per user.
    const appliedBy = {};
    const { data: apps } = await supabaseAdmin.from("applications").select("user_id").limit(200000);
    for (const a of apps || []) if (a.user_id) appliedBy[a.user_id] = (appliedBy[a.user_id] || 0) + 1;

    const users = (profs || []).map((p) => {
      const d = (p.data && typeof p.data === "object") ? p.data : {};
      const a = authById[p.id] || {};
      const plan = d.plan || p.plan || (p.is_premium ? "premium" : "basic");
      return {
        id: p.id,
        email: a.email || d.emailAddress || "",
        name: d.name || "",
        tier: plan,
        isPremium: !!p.is_premium || plan === "premium" || plan === "plus",
        created: a.created || p.created_at || null,
        lastSignIn: a.lastSignIn || null,
        emailVerified: a.emailVerified != null ? a.emailVerified : !!d.email_verified,
        location: d.location || "", country: d.country || "",
        role: d.role || "", experience: d.experience || d.yearsExp || "",
        skills: d.skills || "", education: d.education || "",
        targetSalary: d.targetSalary || "", openTo: d.openTo || [],
        bio: d.bio || "", achievements: d.achievements || "",
        workBlocks: Array.isArray(d.workBlocks) ? d.workBlocks : [],
        workHistory: d.workHistory || "",
        links: {
          linkedin: d.linkedin || "", portfolio: d.portfolio || "", github: d.github || "",
          artstation: d.artstation || "", behance: d.behance || "", otherWebsite: d.otherWebsite || "",
        },
        resumeText: d.resumeText || "", resumeFileName: d.resumeFileName || "",
        notifyCompanies: Array.isArray(d.notifyCompanies) ? d.notifyCompanies : [],
        jobAlerts: d.jobAlerts || null,
        appliedCount: appliedBy[p.id] || 0,
      };
    });

    // Newest accounts first.
    users.sort((x, y) => new Date(y.created || 0) - new Date(x.created || 0));
    res.status(200).json({ users, total: users.length });
  } catch (e) {
    res.status(500).json({ error: "server error", detail: String((e && e.message) || e) });
  }
}