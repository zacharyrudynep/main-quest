import { supabaseAdmin } from "../../../lib/supabaseAdmin";

// Drives the "keep browsing, we'll notify you" UX.
//   GET            -> { jobs: [...] } recent jobs (lightweight, no result blob)
//   GET ?id=<uuid> -> { job }        one job WITH its result (for the waiting modal)
//   POST { seen:[ids] } | { seenKind:"resume"|"interview" } -> mark done jobs seen
export default async function handler(req, res) {
  try {
    const authz = req.headers.authorization || "";
    const tok = authz.startsWith("Bearer ") ? authz.slice(7) : "";
    if (!tok) return res.status(401).json({ error: "Please sign in." });
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(tok);
    if (ue || !u || !u.user) return res.status(401).json({ error: "Please sign in." });
    const uid = u.user.id;

    if (req.method === "GET") {
      const id = req.query && req.query.id;
      if (id) {
        const { data } = await supabaseAdmin.from("ai_jobs").select("id,kind,job_key,status,error,result,seen,created_at").eq("id", id).eq("user_id", uid).maybeSingle();
        return res.status(200).json({ job: data || null });
      }
      const { data } = await supabaseAdmin
        .from("ai_jobs").select("id,kind,job_key,status,error,seen,created_at")
        .eq("user_id", uid).order("created_at", { ascending: false }).limit(20);
      return res.status(200).json({ jobs: data || [] });
    }

    if (req.method === "POST") {
      const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      let q = supabaseAdmin.from("ai_jobs").update({ seen: true, updated_at: new Date().toISOString() }).eq("user_id", uid).eq("status", "done");
      if (Array.isArray(b.seen) && b.seen.length) q = q.in("id", b.seen.slice(0, 50));
      else if (b.seenKind === "resume" || b.seenKind === "interview") q = q.eq("kind", b.seenKind);
      else return res.status(400).json({ error: "Nothing to mark." });
      await q;
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: "Something went wrong." });
  }
}