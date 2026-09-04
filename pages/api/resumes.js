import { supabaseAdmin } from "../../lib/supabaseAdmin";

// /api/resumes — saved AI-tailored resumes for the signed-in user.
//   GET    -> list all (newest first)
//   POST   -> save a new one { jobKey, company, title, location, url, resumeText }
//   PATCH  -> edit text of one { id, resumeText }
//   DELETE -> remove one (?id= or { id })
export default async function handler(req, res) {
  try {
    const authz = req.headers.authorization || "";
    const tok = authz.startsWith("Bearer ") ? authz.slice(7) : "";
    if (!tok) return res.status(401).json({ error: "Please sign in." });
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(tok);
    if (ue || !u || !u.user) return res.status(401).json({ error: "Please sign in." });
    const uid = u.user.id;

    if (req.method === "GET") {
      const { data } = await supabaseAdmin
        .from("generated_resumes")
        .select("id,job_key,company,title,location,url,resume_text,created_at")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(200);
      return res.status(200).json({ resumes: data || [] });
    }

    if (req.method === "POST") {
      const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      const resume_text = String(b.resumeText || "").slice(0, 60000);
      if (!resume_text.trim()) return res.status(400).json({ error: "No resume text." });
      const row = {
        user_id: uid,
        job_key: String(b.jobKey || "").slice(0, 400),
        company: String(b.company || "").slice(0, 200),
        title: String(b.title || "").slice(0, 300),
        location: String(b.location || "").slice(0, 200),
        url: String(b.url || "").slice(0, 800),
        resume_text,
      };
      const { data, error } = await supabaseAdmin.from("generated_resumes").insert(row).select("id").single();
      if (error) return res.status(500).json({ error: "Could not save." });
      return res.status(200).json({ ok: true, id: data && data.id });
    }

    if (req.method === "PATCH") {
      const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      if (!b.id) return res.status(400).json({ error: "Missing id." });
      const { error } = await supabaseAdmin
        .from("generated_resumes")
        .update({ resume_text: String(b.resumeText || "").slice(0, 60000) })
        .eq("id", b.id).eq("user_id", uid);
      if (error) return res.status(500).json({ error: "Could not update." });
      return res.status(200).json({ ok: true });
    }

    if (req.method === "DELETE") {
      const id = (req.query && req.query.id) || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: "Missing id." });
      await supabaseAdmin.from("generated_resumes").delete().eq("id", id).eq("user_id", uid);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST, PATCH, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: "Something went wrong." });
  }
}