import { supabase } from './supabase'

/** Supabase Storage bucket holding product photos (must be a public bucket). */
export const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'product-images'

/**
 * Turn whatever is stored in a JSONB/text "list" column into a JS array.
 * Handles: real arrays, JSON strings ('["a","b"]', even double-encoded),
 * Postgres array literals ('{a,b}'), comma-separated text and single values.
 */
export function parseList(value) {
  if (value == null || value === '') return []
  if (Array.isArray(value)) return value
  if (typeof value === 'object') return [value]
  if (typeof value !== 'string') return []

  const text = value.trim()
  if (text.startsWith('[') || text.startsWith('"')) {
    try {
      return parseList(JSON.parse(text))
    } catch {
      // not valid JSON — fall through to the plain-text formats
    }
  }
  if (text.startsWith('{') && text.endsWith('}')) {
    return text
      .slice(1, -1)
      .split(',')
      .map((s) => s.trim().replace(/^"(.*)"$/, '$1'))
      .filter(Boolean)
  }
  return text.split(',').map((s) => s.trim()).filter(Boolean)
}

/**
 * Resolve one stored image reference to a URL the browser can load:
 *  - "https://…"            → used as-is (Supabase Storage public URL, CDN, etc.)
 *  - "/images/x.jpg"        → used as-is (file in public/images, deployed with the site)
 *  - "images/x.jpg"         → "/images/x.jpg" (a relative path would 404 on /product/… pages)
 *  - "nimi/front.jpg"       → public URL of that path in the Storage bucket
 *  - { url | src | path }   → same rules applied to that field
 */
export function resolveImageUrl(entry) {
  const ref = typeof entry === 'string' ? entry : entry?.url ?? entry?.src ?? entry?.path
  if (typeof ref !== 'string' || !ref.trim()) return null

  const path = ref.trim()
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('/')) return path
  if (path.startsWith('images/')) return `/${path}`

  if (!supabase) return `/${path}`
  // Accept "product-images/nimi.jpg" as well as just "nimi.jpg".
  const objectPath = path.startsWith(`${STORAGE_BUCKET}/`) ? path.slice(STORAGE_BUCKET.length + 1) : path
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(objectPath).data.publicUrl
}

/** Parse a product's `images` column into a clean array of loadable URLs. */
export const normalizeImages = (value) => parseList(value).map(resolveImageUrl).filter(Boolean)
