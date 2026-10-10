import { supabase } from './supabase'

// Server side of the shared cart: public.cart_items, one row per
// (customer, product, size). See supabase/migrations/20261010000000_shared_cart.sql.
// Sizes are stored as '' for one-size items; the app uses undefined.

const toSize = (size) => size ?? ''
const fromSize = (size) => (size === '' ? undefined : size)

/** @returns {Promise<{ productId: string, size?: string, quantity: number }[]>} */
export async function fetchCartLines() {
  const { data, error } = await supabase
    .from('cart_items')
    .select('product_id, size, quantity')
    .order('updated_at', { ascending: true })
  if (error) throw error
  return data.map((r) => ({ productId: r.product_id, size: fromSize(r.size), quantity: r.quantity }))
}

/** Increment a line (atomic on the server, capped at 20). */
export async function addCartLine(productId, size, quantity) {
  const { error } = await supabase.rpc('add_to_cart', {
    p_product_id: productId,
    p_size: toSize(size),
    p_quantity: quantity,
  })
  if (error) throw error
}

export async function setCartLine(productId, size, quantity) {
  if (quantity <= 0) return removeCartLine(productId, size)
  const { error } = await supabase.from('cart_items').upsert(
    {
      product_id: productId,
      size: toSize(size),
      quantity: Math.min(quantity, 20),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,product_id,size' },
  )
  if (error) throw error
}

export async function removeCartLine(productId, size) {
  const { error } = await supabase.from('cart_items').delete().eq('product_id', productId).eq('size', toSize(size))
  if (error) throw error
}

export async function clearCartLines() {
  // RLS limits this to the signed-in customer's rows; PostgREST still requires a filter.
  const { error } = await supabase.from('cart_items').delete().gte('quantity', 0)
  if (error) throw error
}

/**
 * Call `onChange` whenever this customer's cart changes on any device.
 * Returns an unsubscribe function.
 */
export function subscribeToCart(userId, onChange) {
  const channel = supabase
    .channel(`cart:${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cart_items' }, (payload) => {
      // RLS limits inserts/updates to our own rows; deletes only carry the
      // primary key, which includes user_id.
      const row = payload.new?.user_id ? payload.new : payload.old
      if (!row?.user_id || row.user_id === userId) onChange()
    })
    .subscribe()
  return () => supabase.removeChannel(channel)
}
