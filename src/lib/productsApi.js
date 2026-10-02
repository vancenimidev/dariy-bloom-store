import { products as localProducts } from '../data/products'
import { supabase } from './supabase'

/**
 * Load the catalogue. Reads the Supabase `products` table when configured
 * and non-empty, otherwise falls back to the hardcoded catalogue.
 */
export async function fetchProducts() {
  if (!supabase) return localProducts

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })

  if (error || !data?.length) {
    if (error) console.warn('[Dariy Bloom] Falling back to local products:', error.message)
    return localProducts
  }
  return data.map(fromRow)
}

const fromRow = (row) => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  price: row.price,
  category: row.category,
  tagline: row.tagline,
  description: row.description,
  details: row.details ?? [],
  sizes: row.sizes ?? [],
  images: row.images ?? [],
  badge: row.badge ?? undefined,
})

/**
 * One-off helper to seed the Supabase `products` table with the local
 * catalogue. Run from the browser console in dev:
 *   (await import('/src/lib/productsApi.js')).seedProducts()
 * Requires an RLS policy that allows inserts (see supabase/schema.sql).
 */
export async function seedProducts() {
  if (!supabase) throw new Error('Supabase is not configured')
  const rows = localProducts.map((p, i) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    category: p.category,
    tagline: p.tagline,
    description: p.description,
    details: p.details,
    sizes: p.sizes,
    images: p.images,
    badge: p.badge ?? null,
    sort_order: i,
    active: true,
  }))
  const { error } = await supabase.from('products').upsert(rows)
  if (error) throw error
  return rows.length
}
