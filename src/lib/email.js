import { buildOrderEmail } from './orderEmail'

// e.g. "/api/send-order-email" (the Vercel function in api/). Blank = simulate.
const EMAIL_ENDPOINT = import.meta.env.VITE_ORDER_EMAIL_ENDPOINT

/**
 * Send (or simulate) the order confirmation email.
 *
 * The browser only sends the order reference. The server function looks the
 * order up in Supabase, builds the email and sends it through Mailgun, so the
 * Mailgun key never reaches the browser and the endpoint can't be used to
 * email arbitrary people. The order must already be saved to Supabase.
 *
 * Without VITE_ORDER_EMAIL_ENDPOINT, the email is simulated and logged to the console.
 *
 * @returns {Promise<{ status: 'sent' | 'simulated' | 'failed' }>}
 */
export async function sendOrderConfirmation(order) {
  if (!EMAIL_ENDPOINT) {
    const payload = buildOrderEmail(order)
    await new Promise((r) => setTimeout(r, 600))
    console.groupCollapsed(`📧 [Simulated email] ${payload.subject}`)
    console.log('To:', payload.to)
    console.log(payload.text)
    console.groupEnd()
    return { status: 'simulated' }
  }

  try {
    const res = await fetch(EMAIL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: order.reference }),
    })
    if (!res.ok) throw new Error(`Email endpoint responded ${res.status}: ${await res.text()}`)
    return { status: 'sent' }
  } catch (err) {
    console.error('[Dariy Bloom] Confirmation email failed:', err)
    return { status: 'failed' }
  }
}
