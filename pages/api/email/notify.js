// POST /api/email/notify  { type: "welcome" | "password-changed" | "device-check" }
// Authenticated (Bearer session token). Sends account/security emails and tracks
// known devices so a new-device sign-in triggers an alert.
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { sendPasswordChangedEmail, sendNewDeviceEmail } from "../../../lib/resend";
import crypto from "crypto";

function deviceLabel(ua) {
  ua = ua || "";
  let os = "an unknown device";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Mac OS X|Macintosh/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Linux/i.test(ua)) os = "Linux";
  let br = "a browser";
  if (/Edg\//i.test(ua)) br = "Edge";
  else if (/OPR\/|Opera/i.test(ua)) br = "Opera";
  else if (/Chrome\//i.test(ua)) br = "Chrome";
  else if (/Firefox\//i.test(ua)) br = "Firefox";
  else if (/Safari\//i.test(ua)) br = "Safari";
  return `${br} on ${os}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "Method not allowed" }); }
  try {
    const tok = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!tok) return res.status(401).json({ error: "Not signed in" });
    const { data: u, error: ue } = await supabaseAdmin.auth.getUser(tok);
    if (ue || !u || !u.user) return res.status(401).json({ error: "Invalid session" });
    const uid = u.user.id;
    const email = u.user.email;
    const type = (req.body && req.body.type) || "";

    const { data: prof } = await supabaseAdmin.from("profiles").select("name,data").eq("id", uid).single();
    const name = (prof && prof.name) || "";
    const data = (prof && prof.data) || {};

    if (type === "password-changed") {
      await sendPasswordChangedEmail(email, name).catch(() => {});
      return res.status(200).json({ ok: true });
    }

    if (type === "device-check") {
      const ua = req.headers["user-agent"] || "";
      const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
      const key = crypto.createHash("sha256").update(ua + "|" + ip).digest("hex").slice(0, 16);
      const known = Array.isArray(data.knownDevices) ? data.knownDevices : [];
      if (known.includes(key)) return res.status(200).json({ ok: true, alerted: false });
      const isFirst = known.length === 0; // don't alert on the user's very first seen device
      const next = [...known, key].slice(-12);
      await supabaseAdmin.from("profiles").update({ data: { ...data, knownDevices: next } }).eq("id", uid);
      if (!isFirst && data.newDeviceAlerts !== false) {
        await sendNewDeviceEmail(email, name, { device: deviceLabel(ua) }).catch(() => {});
        return res.status(200).json({ ok: true, alerted: true });
      }
      return res.status(200).json({ ok: true, alerted: false });
    }

    return res.status(400).json({ error: "Unknown notification type" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
