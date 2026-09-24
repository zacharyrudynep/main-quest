// Server-only Supabase client that uses the SERVICE ROLE key. This bypasses
// Row Level Security so the Stripe webhook (which is not a logged-in user) can
// update any user's subscription status.
//
// ⚠️  NEVER import this file into client-side code, and NEVER expose
//     SUPABASE_SERVICE_ROLE_KEY. It is a full-access key. It must only exist in
//     server environment variables (no NEXT_PUBLIC_ prefix).
//
// The client is created LAZILY (on first use), not on import. Env vars aren't
// present during `next build`, so instantiating on import would crash the build
// for any *page* (not just API route) that imports this. The lazy proxy below
// keeps the same import shape — `import { supabaseAdmin }` and `supabaseAdmin.from(...)`
// still work — but the real client is only built at runtime, when the key exists.
import { createClient } from "@supabase/supabase-js";

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://vtbavrvokhupulokqqqb.supabase.co";

let _client = null;
function admin() {
  if (!_client) {
    _client = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _client;
}

export const supabaseAdmin = new Proxy({}, {
  get(_t, prop) {
    const c = admin();
    const v = c[prop];
    return typeof v === "function" ? v.bind(c) : v;
  },
});
