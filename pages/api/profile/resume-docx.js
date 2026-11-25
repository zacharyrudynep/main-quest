// POST /api/profile/resume-docx — store or clear the signed-in user's resume .docx (base64).
//
// The .docx is kept OUT of profiles.data (see resume_files_migration.sql) so it no longer
// inflates every profiles read. Only the resume-tailor endpoint reads it, server-side, so
// this table has no client-facing RLS policy and there are no client reads of the blob.
//
// Body: { docxB64: "<base64>" } to set, or { docxB64: "" } / {} to clear.
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

// A base64 .docx can be a couple hundred KB; allow headroom but cap it.
export const config = { api: { bodyParser: { sizeLimit: "8mb" } } };

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "POST only" }); }
    const authz = req.headers.authorization || "";
    const token = authz.startsWith("Bearer ") ? authz.slice(7) : "";
    if (!token) return res.status(401).json({ error: "Please sign in." });
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(token);
    if (ue || !u || !u.user) return res.status(401).json({ error: "Please sign in." });
    const uid = u.user.id;

    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const docx = typeof b.docxB64 === "string" ? b.docxB64 : "";
    if (docx && docx.length > 6000000) return res.status(413).json({ error: "File too large." });

    if (!docx) {
      // Clear any stored docx (e.g. user removed their resume or uploaded a non-.docx).
      try { await supabaseAdmin.from("resume_files").delete().eq("user_id", uid); } catch (e) {}
      return res.status(200).json({ ok: true, cleared: true });
    }
    const { error } = await supabaseAdmin
      .from("resume_files")
      .upsert({ user_id: uid, docx_b64: docx, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) return res.status(500).json({ error: "Could not save." });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "Something went wrong." });
  }
}