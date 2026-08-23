// lib/bans.js — server-only ban checks + IP logging. Uses the service-role
// client so it can read the RLS-locked ban tables.
import { supabaseAdmin } from "./supabaseAdmin";
import { getClientIp } from "./clientIp";

// Returns { banned: boolean, ip }. Fails OPEN on infra errors — a transient
// DB hiccup should not lock every user out of the app.
export async function checkBanned(req, userId) {
  const ip = getClientIp(req);
  try {
    if (ip) {
      const { data } = await supabaseAdmin.from("banned_ips").select("ip").eq("ip", ip).maybeSingle();
      if (data) return { banned: true, ip };
    }
    if (userId) {
      const { data } = await supabaseAdmin.from("banned_users").select("user_id").eq("user_id", userId).maybeSingle();
      if (data) return { banned: true, ip };
    }
  } catch (e) { /* fail open */ }
  return { banned: false, ip };
}

// Best-effort: record that this user was seen from this IP (so you can later
// identify which IP to ban). Never throws.
export async function logUserIp(userId, ip) {
  if (!userId || !ip) return;
  try {
    await supabaseAdmin
      .from("user_ips")
      .upsert({ user_id: userId, ip, last_seen: new Date().toISOString() }, { onConflict: "user_id,ip" });
  } catch (e) { /* best-effort */ }
}
