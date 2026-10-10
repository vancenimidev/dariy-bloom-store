import { products as webCatalogue } from '../../../src/data/products'
import { normalizeImages, parseList } from './images'
import { supabase } from './supabase'

/** The web store's hardcoded catalogue, with image paths made absolute. */
export const localProducts = webCatalogue.map((p) => ({ ...p, images: normalizeImages(p.images) }))

/**
 * Load the catalogue: the Supabase `products` table when configured and
 * non-empty, otherwise the web store's local catalogue (same as the web).
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
  details: parseList(row.details).map(String),
  sizes: parseList(row.sizes).map(String),
  images: normalizeImages(row.images),
  badge: row.badge ?? undefined,
})
