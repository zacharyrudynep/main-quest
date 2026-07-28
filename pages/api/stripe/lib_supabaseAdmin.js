// Server-only Supabase client that uses the SERVICE ROLE key. This bypasses
// Row Level Security so the Stripe webhook (which is not a logged-in user) can
// update any user's subscription status.
//
// ⚠️  NEVER import this file into client-side code, and NEVER expose
//     SUPABASE_SERVICE_ROLE_KEY. It is a full-access key. It must only exist in
//     server environment variables (no NEXT_PUBLIC_ prefix).
import { createClient } from "@supabase/supabase-js";

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://vtbavrvokhupulokqqqb.supabase.co";

export const supabaseAdmin = createClient(
  url,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);
