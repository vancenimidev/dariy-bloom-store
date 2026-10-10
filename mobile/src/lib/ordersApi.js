import { supabase } from './supabase'

/**
 * Insert an order into the same `orders` table the web store uses
 * (same columns as the web store's src/lib/ordersApi.js).
 * @returns {Promise<{ synced: boolean }>}
 */
export async function saveOrder(order) {
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
    console.error('[Dariy Bloom] Could not save order to Supabase:', error.message)
    return { synced: false }
  }
  return { synced: true }
}
