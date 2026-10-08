import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Bindings } from "../env";

// Rows are mapped to the typed API shapes in ./mappers, so the client itself is untyped.
export type Db = SupabaseClient<any, "public", "public", any>;

/** Service-role client. Bypasses RLS — only ever used server-side in this Worker. */
export function db(env: Bindings): Db {
  return createClient<any>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
