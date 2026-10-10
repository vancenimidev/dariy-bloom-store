import { SITE_URL, STORAGE_BUCKET } from './env'
import { supabase } from './supabase'

/**
 * Same list parsing as the web store's src/lib/images.js: real arrays, JSON
 * strings, Postgres array literals ('{a,b}') and comma-separated text.
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
 * Resolve a stored image reference to an absolute URL. Paths like
 * "/images/x.jpg" are files deployed with the web store, so they're loaded
 * from EXPO_PUBLIC_SITE_URL; bare paths are objects in the Storage bucket.
 */
export function resolveImageUrl(entry) {
  const ref = typeof entry === 'string' ? entry : entry?.url ?? entry?.src ?? entry?.path
  if (typeof ref !== 'string' || !ref.trim()) return null

  const path = ref.trim()
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path
  if (path.startsWith('//')) return `https:${path}`
  if (path.startsWith('/') || path.startsWith('images/')) {
    return SITE_URL ? `${SITE_URL}/${path.replace(/^\/+/, '')}` : null
  }

  if (!supabase) return SITE_URL ? `${SITE_URL}/${path}` : null
  const objectPath = path.startsWith(`${STORAGE_BUCKET}/`) ? path.slice(STORAGE_BUCKET.length + 1) : path
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(objectPath).data.publicUrl
}

export const normalizeImages = (value) => parseList(value).map(resolveImageUrl).filter(Boolean)
