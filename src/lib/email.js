import { buildOrderEmail } from './orderEmail'
import { isSupabaseConfigured } from './supabase'

// The Vercel function in api/. Override only if it's hosted elsewhere.
const EMAIL_ENDPOINT = import.meta.env.VITE_ORDER_EMAIL_ENDPOINT || '/api/send-order-email'

/**
 * Trigger the order confirmation email.
 *
 * Call right after the order is inserted into Supabase. The browser only
 * sends the order reference; api/send-order-email.js looks the order up,
 * builds the email and sends it through Resend, so the Resend key never
 * reaches the browser and the endpoint can't be used to email arbitrary people.
 *
 * - Supabase not configured (local/offline mode): the email is simulated
 *   and logged to the console.
 * - Supabase configured but the insert failed: nothing to look up, so 'failed'.
 *
 * @param {object} order
 * @param {{ synced: boolean }} saveResult  result of saveOrder(order)
 * @returns {Promise<{ status: 'sent' | 'simulated' | 'failed' }>}
 */
export async function sendOrderConfirmation(order, { synced }) {
  if (!isSupabaseConfigured) {
    const payload = buildOrderEmail(order)
    await new Promise((r) => setTimeout(r, 600))
    console.groupCollapsed(`📧 [Simulated email] ${payload.subject}`)
    console.log('To:', payload.to)
    console.log(payload.text)
    console.groupEnd()
    return { status: 'simulated' }
  }

  if (!synced) {
    console.error('[Dariy Bloom] Order was not saved to Supabase, so no confirmation email was sent.')
    return { status: 'failed' }
  }

  try {
    const res = await fetch(EMAIL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: order.reference }),
    })
    const text = await res.text()
    if (!res.ok) throw new Error(`Email endpoint responded ${res.status}: ${text}`)
    // A missing function can be answered by the SPA fallback (index.html, status 200),
    // so only the function's own { ok: true } reply counts as sent.
    let reply = null
    try {
      reply = JSON.parse(text)
    } catch {
      // not JSON — handled below
    }
    if (reply?.ok !== true) throw new Error(`Email endpoint gave an unexpected reply (is ${EMAIL_ENDPOINT} deployed?)`)
    return { status: 'sent' }
  } catch (err) {
    console.error(
      '[Dariy Bloom] Confirmation email failed:',
      err.message,
      `\nOpen ${EMAIL_ENDPOINT} in the browser to check the email configuration; full details are in the Vercel function logs.`,
    )
    return { status: 'failed' }
  }
}
