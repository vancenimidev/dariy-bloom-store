import { createClient } from '@supabase/supabase-js'
import { AppState, Platform } from 'react-native'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './env'

/** True when both env vars are present, i.e. Supabase sync is turned on. */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

/**
 * Shared Supabase client, or `null` when the env vars are not set.
 * Unlike the web store's client this one keeps a session, because the
 * shared cart belongs to the signed-in customer.
 */
export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null

if (!supabase && __DEV__) {
  console.info(
    '[Dariy Bloom] Supabase not configured — using the local catalogue and a device-only cart. ' +
      'Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in mobile/.env.',
  )
}

// Only refresh the session while the app is in the foreground (native only;
// browsers handle this themselves).
if (supabase && Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh()
    else supabase.auth.stopAutoRefresh()
  })
}
