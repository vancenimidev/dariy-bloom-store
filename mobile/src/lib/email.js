import { SITE_URL } from './env'

/** The web store's Vercel function (api/send-order-email.js). */
export const EMAIL_ENDPOINT = SITE_URL ? `${SITE_URL}/api/send-order-email` : ''

/**
 * Ask the Vercel function to email the order confirmation. Only the order
 * reference is sent: the function looks the order up in Supabase with its own
 * server-side key and emails it at most once, so no secrets live in the app.
 *
 * @returns {Promise<{ status: 'sent' | 'failed' }>}
 */
export async function sendOrderConfirmation(order, { synced }) {
  if (!synced) return { status: 'failed' }
  if (!EMAIL_ENDPOINT) {
    console.warn('[Dariy Bloom] EXPO_PUBLIC_SITE_URL is not set, so no confirmation email was sent.')
    return { status: 'failed' }
  }

  try {
    const res = await fetch(EMAIL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: order.reference }),
    })
    const reply = await res.json().catch(() => null)
    if (!res.ok || reply?.ok !== true) throw new Error(reply?.error || `Email endpoint responded ${res.status}`)
    return { status: 'sent' }
  } catch (err) {
    console.error('[Dariy Bloom] Confirmation email failed:', err.message)
    return { status: 'failed' }
  }
}
