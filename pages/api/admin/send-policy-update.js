// POST /api/admin/send-policy-update  (owner only)
// Emails all users a legal notice that the Terms and/or Privacy Policy changed.
// Body: { policy: "terms"|"privacy"|"both", version, summary, test }
//   - version: an effective-date / version string (e.g. "October 2026"); required for a real send.
//   - test: true  -> sends only to ADMIN_EMAIL so you can preview it.
// De-dupes per user via data.lastPolicyEmailVersion so re-running only mails people who
// haven't received THIS version yet. Legal notice -> ignores marketing opt-outs.
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { sendPolicyUpdateEmail, sendPolicyUpdateBatch } from "../../../lib/resend";

export const config = { maxDuration: 120 };

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").toLowerCase();
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://mainquestjobs.com";
const LABELS = { terms: "Terms of Service", privacy: "Privacy Policy", both: "Terms of Service and Privacy Policy" };

function chunk(arr, n){ const out=[]; for(let i=0;i<arr.length;i+=n) out.push(arr.slice(i,i+n)); return out; }

export default async function handler(req, res){
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  try {
    // ── auth: owner only ──
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return res.status(401).json({ error: "no token" });
    if (!ADMIN_EMAIL) return res.status(500).json({ error: "ADMIN_EMAIL not configured" });
    const { data: who, error: we } = await supabaseAdmin.auth.getUser(token);
    const email = ((who && who.user && who.user.email) || "").toLowerCase();
    if (we || !email || email !== ADMIN_EMAIL) return res.status(403).json({ error: "forbidden" });

    const body = typeof req.body === "object" && req.body ? req.body : {};
    const policy = ["terms", "privacy", "both"].includes(body.policy) ? body.policy : "both";
    const version = String(body.version || "").trim();
    const summary = String(body.summary || "").trim();
    const test = !!body.test;

    const opts = {
      policy, policyLabel: LABELS[policy], effectiveDate: version, summary,
      termsUrl: SITE + "/terms", privacyUrl: SITE + "/privacy",
    };

    // ── test send: just to the owner ──
    if (test) {
      await sendPolicyUpdateEmail(ADMIN_EMAIL, "", opts);
      return res.status(200).json({ ok: true, test: true, to: ADMIN_EMAIL });
    }

    if (!version) return res.status(400).json({ error: "version (effective date) is required for a real send" });
    const versionKey = `${policy}:${version}`;

    // ── map user ids -> email (paginated) ──
    const emailById = {};
    for (let page = 1; page <= 50; page++) {
      const { data } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
      const list = (data && data.users) || [];
      for (const u of list) if (u.email) emailById[u.id] = u.email;
      if (list.length < 1000) break;
    }

    // ── profiles + build recipient list (skip those already sent this version) ──
    const { data: profs, error: pe } = await supabaseAdmin.from("profiles").select("id,name,data");
    if (pe) throw pe;
    const recipients = [];
    let skipped = 0, noEmail = 0;
    for (const p of profs || []) {
      const d = (p.data && typeof p.data === "object") ? p.data : {};
      const to = emailById[p.id];
      if (!to) { noEmail++; continue; }
      if (d.lastPolicyEmailVersion === versionKey) { skipped++; continue; }
      recipients.push({ id: p.id, name: p.name || d.name || "", to, data: d });
    }

    // ── send in batches of 100; record success per user ──
    let sent = 0, failed = 0;
    const sentRows = [];
    for (const group of chunk(recipients, 100)) {
      try {
        await sendPolicyUpdateBatch(group.map(r => ({ to: r.to, name: r.name })), opts);
        sent += group.length;
        const now = Date.now();
        for (const r of group) sentRows.push({ id: r.id, name: r.name, data: { ...r.data, lastPolicyEmailVersion: versionKey, lastPolicyEmailAt: now } });
      } catch (e) {
        failed += group.length; // whole batch failed -> don't record; a retry will pick them up
      }
    }

    // ── persist the "sent this version" marker (chunked upserts) ──
    for (const rows of chunk(sentRows, 200)) {
      try { await supabaseAdmin.from("profiles").upsert(rows, { onConflict: "id" }); } catch (e) {}
    }

    return res.status(200).json({ ok: true, versionKey, total: (profs || []).length, sent, skipped, failed, noEmail });
  } catch (e) {
    return res.status(500).json({ error: "server error", detail: String((e && e.message) || e) });
  }
}