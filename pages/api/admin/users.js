import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { effectiveTier } from "../../../lib/entitlements";

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
          emailVerified: !!(au.app_metadata && au.app_metadata.email_verified),
        };
      }
      if (list.length < 1000) break;
    }

    // 2) Profiles — project ONLY the keys the admin UI uses, NOT the big ones
    //    (resumeText, and the emailedKeys/seenInboxKeys/inbox dedup arrays). résumé text is
    //    fetched lazily per user via /api/admin/user-detail. This slashes egress on the list.
    const { data: profs } = await supabaseAdmin
      .from("profiles")
      .select("id,is_premium,plan,created_at,deletion_requested_at,name:data->name,emailAddress:data->emailAddress,email_verified:data->email_verified,location:data->location,country:data->country,role:data->role,experience:data->experience,yearsExp:data->yearsExp,skills:data->skills,education:data->education,targetSalary:data->targetSalary,openTo:data->openTo,bio:data->bio,achievements:data->achievements,workBlocks:data->workBlocks,workHistory:data->workHistory,linkedin:data->linkedin,portfolio:data->portfolio,github:data->github,artstation:data->artstation,behance:data->behance,otherWebsite:data->otherWebsite,resumeFileName:data->resumeFileName,notifyCompanies:data->notifyCompanies,jobAlerts:data->jobAlerts,premiumUntil:data->premiumUntil,studentTrialRedeemed:data->studentTrialRedeemed,freeAiCredits:data->freeAiCredits")
      .limit(100000);

    // 3) Applied counts per user.
    const appliedBy = {};
    const { data: apps } = await supabaseAdmin.from("applications").select("user_id").limit(200000);
    for (const a of apps || []) if (a.user_id) appliedBy[a.user_id] = (appliedBy[a.user_id] || 0) + 1;

    // 3b) Banned set + this month's shared AI usage, for the admin support actions.
    const bannedSet = new Set();
    try { const { data: bans } = await supabaseAdmin.from("banned_users").select("user_id").limit(100000); for (const r of bans || []) if (r.user_id) bannedSet.add(r.user_id); } catch (e) {}
    const usedBy = {};
    try { const month = new Date().toISOString().slice(0, 7); const { data: usage } = await supabaseAdmin.from("ai_usage").select("user_id,count").eq("month", month).limit(100000); for (const r of usage || []) if (r.user_id) usedBy[r.user_id] = r.count || 0; } catch (e) {}

    const users = (profs || []).map((p) => {
      const a = authById[p.id] || {};
      const t = effectiveTier({ is_premium: p.is_premium, plan: p.plan, data: { premiumUntil: p.premiumUntil, studentTrialRedeemed: p.studentTrialRedeemed } });
      return {
        id: p.id,
        email: a.email || p.emailAddress || "",
        name: p.name || "",
        tier: t.plan,
        isPremium: t.isPremium,
        created: a.created || p.created_at || null,
        lastSignIn: a.lastSignIn || null,
        emailVerified: a.emailVerified != null ? a.emailVerified : !!p.email_verified,
        location: p.location || "", country: p.country || "",
        role: p.role || "", experience: p.experience || p.yearsExp || "",
        skills: p.skills || "", education: p.education || "",
        targetSalary: p.targetSalary || "", openTo: p.openTo || [],
        bio: p.bio || "", achievements: p.achievements || "",
        workBlocks: Array.isArray(p.workBlocks) ? p.workBlocks : [],
        workHistory: p.workHistory || "",
        links: {
          linkedin: p.linkedin || "", portfolio: p.portfolio || "", github: p.github || "",
          artstation: p.artstation || "", behance: p.behance || "", otherWebsite: p.otherWebsite || "",
        },
        resumeText: "", resumeFileName: p.resumeFileName || "", // résumé text fetched lazily per user
        notifyCompanies: Array.isArray(p.notifyCompanies) ? p.notifyCompanies : [],
        jobAlerts: p.jobAlerts || null,
        appliedCount: appliedBy[p.id] || 0,
        student: t.isStudent,
        premiumUntil: p.premiumUntil || null,
        freeCredits: Number(p.freeAiCredits) || 0,
        banned: bannedSet.has(p.id),
        deletionRequestedAt: p.deletion_requested_at || null,
        aiUsed: usedBy[p.id] || 0,
      };
    });

    // Newest accounts first.
    users.sort((x, y) => new Date(y.created || 0) - new Date(x.created || 0));
    res.status(200).json({ users, total: users.length });
  } catch (e) {
    res.status(500).json({ error: "server error", detail: String((e && e.message) || e) });
  }
}