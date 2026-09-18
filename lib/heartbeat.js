// lib/heartbeat.js — each cron calls heartbeat() at the end of its run so
// /api/health can report whether the schedulers are actually firing. Best-effort:
// a heartbeat write must never break the cron it's reporting on.
import { supabaseAdmin } from "./supabaseAdmin";

export async function heartbeat(id, ok, note) {
  try {
    await supabaseAdmin
      .from("cron_heartbeats")
      .upsert({ id, last_run: new Date().toISOString(), ok: !!ok, note: (note || "").slice(0, 300) }, { onConflict: "id" });
  } catch (e) { /* ignore — health reporting must never fail a cron */ }
}