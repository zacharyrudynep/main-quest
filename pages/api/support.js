import { sendSupportTicket } from "../../lib/resend";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { name, email, reason, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Please fill in your name, email, and message." });
  }
  try {
    await sendSupportTicket({ name, email, reason: reason || "General Inquiry", message });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("support error:", e.message);
    return res.status(500).json({ error: e.message });
  }
}
