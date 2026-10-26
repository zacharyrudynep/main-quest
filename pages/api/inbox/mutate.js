// POST /api/inbox/mutate  { action: "clear" | "dismiss" | "read" | "readAll", id? }
// Authenticated (Bearer session token). Mutates the user's in-app inbox using the
// SERVICE-ROLE key — the same privilege the alert crons use to POPULATE the inbox.
//
// Why this exists: the client used supabase.from("profiles").upsert(...) to clear the
// inbox, but `upsert` runs as INSERT ... ON CONFLICT and needs an INSERT row-level
// security policy. With the usual "authenticated can SELECT/UPDATE their own row"
// policy set (and no INSERT policy), that write silently fails — so clearing never
// persisted and cleared jobs reappeared on reload. Clearing through service-role here
// is symmetric with how the crons add items, so it always sticks.
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

// Stable notification identity: company|title (location-independent), matching the
// crons and the client so cleared jobs are reliably excluded going forward.
const _nk = (c, t) => `${String(c || "").trim().toLowerCase().replace(/\s+/g, " ")}|${String(t || "").trim().toLowerCase().replace(/\s+/g, " ")}`;
const _nkFrom = (k) => { const a = String(k || "").split("|"); return _nk(a[0], a[1]); };

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "POST only" }); }
  try {
    const tok = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!tok) return res.status(401).json({ error: "Not signed in" });
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(tok);
    if (ue || !u || !u.user) return res.status(401).json({ error: "Invalid session" });
    const uid = u.user.id;

    const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const action = String(b.action || "");
    const id = b.id;

    // Re-read the user's full data so the write preserves everything else.
    const { data: prof } = await supabaseAdmin.from("profiles").select("data").eq("id", uid).single();
    const data = (prof && prof.data && typeof prof.data === "object") ? prof.data : {};
    const inbox = Array.isArray(data.inbox) ? data.inbox : [];
    // Seen-set includes anything currently in the inbox, so cleared/dismissed jobs are
    // permanently suppressed for the crons + client scan.
    const seen = new Set([...(data.seenInboxKeys || []), ...inbox.map(n => n && n.jobKey)].filter(Boolean).map(_nkFrom));

    let nextInbox;
    if (action === "clear") {
      inbox.forEach(n => { if (n && n.jobKey) seen.add(_nkFrom(n.jobKey)); });
      nextInbox = [];
    } else if (action === "dismiss") {
      const it = inbox.find(n => n && n.id === id);
      if (it && it.jobKey) seen.add(_nkFrom(it.jobKey));
      nextInbox = inbox.filter(n => n && n.id !== id);
    } else if (action === "read") {
      nextInbox = inbox.map(n => (n && n.id === id) ? { ...n, read: true } : n);
    } else if (action === "readAll") {
      nextInbox = inbox.map(n => ({ ...n, read: true }));
    } else {
      return res.status(400).json({ error: "Unknown action" });
    }

    const nextData = { ...data, inbox: nextInbox, seenInboxKeys: [...seen].slice(-2000) };
    const { error } = await supabaseAdmin.from("profiles").update({ data: nextData }).eq("id", uid);
    if (error) return res.status(500).json({ error: error.message || "write failed" });

    return res.status(200).json({ ok: true, inbox: nextInbox });
  } catch (e) {
    return res.status(500).json({ error: String((e && e.message) || e).slice(0, 200) });
  }
}