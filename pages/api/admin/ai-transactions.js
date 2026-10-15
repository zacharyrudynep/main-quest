// GET /api/admin/ai-transactions  (owner only)
// Returns recent AI generation attempts + aggregate stats for the admin dashboard.
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").toLowerCase();
const WINDOW = 2000; // stats computed over the most recent N attempts

async function owner(req) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || !ADMIN_EMAIL) return false;
  const { data: u } = await supabaseAdmin.auth.getUser(token);
  return !!(u && u.user && (u.user.email || "").toLowerCase() === ADMIN_EMAIL);
}

const KINDS = ["resume", "interview", "email_company", "email_template"];

export default async function handler(req, res) {
  try {
    if (!(await owner(req))) return res.status(403).json({ error: "forbidden" });

    const { data: rows } = await supabaseAdmin
      .from("ai_transactions")
      .select("id,user_id,kind,success,model,total_tokens,est_cost_usd,error,created_at")
      .order("created_at", { ascending: false })
      .limit(WINDOW);
    const txns = rows || [];

    // Map user_id -> email for the rows we'll show.
    const needed = new Set(txns.slice(0, 250).map((t) => t.user_id).filter(Boolean));
    const emailById = {};
    if (needed.size) {
      for (let page = 1; page <= 50; page++) {
        const { data } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
        const list = (data && data.users) || [];
        for (const au of list) if (needed.has(au.id)) emailById[au.id] = au.email || "";
        if (list.length < 1000) break;
      }
    }

    // Aggregates.
    const blank = () => ({ count: 0, success: 0, failed: 0, tokens: 0, cost: 0 });
    const byKind = {}; KINDS.forEach((k) => (byKind[k] = blank()));
    const byUser = {};
    let total = 0, success = 0, failed = 0, totalCost = 0, totalTokens = 0;
    for (const t of txns) {
      total++;
      const ok = !!t.success;
      if (ok) success++; else failed++;
      const cost = Number(t.est_cost_usd) || 0;
      const tok = Number(t.total_tokens) || 0;
      totalCost += cost; totalTokens += tok;
      const k = KINDS.includes(t.kind) ? t.kind : "other";
      if (!byKind[k]) byKind[k] = blank();
      byKind[k].count++; byKind[k][ok ? "success" : "failed"]++; byKind[k].tokens += tok; byKind[k].cost += cost;
      if (t.user_id) {
        if (!byUser[t.user_id]) byUser[t.user_id] = blank();
        byUser[t.user_id].count++; byUser[t.user_id][ok ? "success" : "failed"]++; byUser[t.user_id].cost += cost;
      }
    }
    // Top spenders.
    const topUsers = Object.entries(byUser)
      .map(([uid, v]) => ({ userId: uid, email: emailById[uid] || "", count: v.count, success: v.success, failed: v.failed, cost: Number(v.cost.toFixed(6)) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    const list = txns.slice(0, 200).map((t) => ({
      id: t.id,
      email: emailById[t.user_id] || (t.user_id ? t.user_id.slice(0, 8) + "…" : "—"),
      kind: t.kind || "other",
      success: !!t.success,
      model: t.model || "",
      tokens: Number(t.total_tokens) || 0,
      cost: Number(t.est_cost_usd) || 0,
      error: t.error || "",
      created: t.created_at,
    }));

    return res.status(200).json({
      stats: {
        total, success, failed,
        successRate: total ? Math.round((success / total) * 100) : 0,
        totalCost: Number(totalCost.toFixed(6)),
        totalTokens,
        byKind: Object.fromEntries(Object.entries(byKind).map(([k, v]) => [k, { ...v, cost: Number(v.cost.toFixed(6)) }])),
        window: WINDOW,
        shown: total,
      },
      topUsers,
      transactions: list,
    });
  } catch (e) {
    return res.status(500).json({ error: "server error", detail: String((e && e.message) || e) });
  }
}