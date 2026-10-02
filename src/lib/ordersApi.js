import { supabase } from './supabase'

const LOCAL_KEY = 'dariy-bloom:orders'

const readLocal = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY)) ?? []
  } catch {
    return []
  }
}

const writeLocal = (orders) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(orders))
  } catch {
    // Storage full or unavailable — the order still completes in memory.
  }
}

/** Store (or replace) an order in this browser's local order history. */
export function saveOrderLocally(order) {
  writeLocal([order, ...readLocal().filter((o) => o.reference !== order.reference)].slice(0, 20))
}

/**
 * Persist an order. Always keeps a local copy (so the success page survives
 * a refresh) and additionally inserts into Supabase when configured.
 *
 * @returns {Promise<{ synced: boolean }>}
 */
export async function saveOrder(order) {
  saveOrderLocally(order)

  if (!supabase) return { synced: false }

  const { error } = await supabase.from('orders').insert({
    reference: order.reference,
    customer_name: order.customer.name,
    customer_email: order.customer.email,
    customer_phone: order.customer.phone,
    delivery_address: order.customer.address,
    delivery_city: order.customer.city,
    delivery_state: order.customer.state,
    delivery_notes: order.customer.notes || null,
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus,
    items: order.items,
    subtotal: order.subtotal,
    delivery_fee: order.deliveryFee,
    total: order.total,
    created_at: order.createdAt,
  })

  if (error) {
    console.error('[Dariy Bloom] Could not sync order to Supabase:', error.message)
    return { synced: false }
  }
  return { synced: true }
}

export const getLocalOrder = (reference) => readLocal().find((o) => o.reference === reference)
