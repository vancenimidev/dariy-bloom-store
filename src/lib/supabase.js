import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** True when both env vars are present, i.e. Supabase sync is turned on. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

/**
 * Shared Supabase client, or `null` when the env vars are not set.
 * Every caller must handle the `null` case so the store keeps working offline.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    })
  : null

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.info(
    '[Dariy Bloom] Supabase not configured — using local product data and local order storage. ' +
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to enable sync.',
  )
}
