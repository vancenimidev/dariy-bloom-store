// EXPO_PUBLIC_* values are inlined at build time, so they must be read with
// literal `process.env.EXPO_PUBLIC_…` expressions. See mobile/.env.example.
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim()
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim()
export const STORAGE_BUCKET = process.env.EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET?.trim() || 'product-images'

/** The deployed web store (Vercel), without a trailing slash. */
export const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '') || ''
