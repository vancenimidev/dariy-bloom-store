import { BRAND, BANK_DETAILS, PAYMENT_METHODS } from './config'
import { formatNaira } from './format'

const EMAIL_ENDPOINT = import.meta.env.VITE_ORDER_EMAIL_ENDPOINT

/**
 * Build the confirmation email payload. The shape mirrors Mailgun's
 * `messages` API fields (to / subject / text / html) so a server-side
 * function can forward it as-is.
 */
export function buildOrderEmail(order) {
  const lines = order.items
    .map((i) => `• ${i.name}${i.size ? ` (${i.size})` : ''} × ${i.quantity} — ${formatNaira(i.price * i.quantity)}`)
    .join('\n')

  const paymentNote =
    order.paymentMethod === 'bank_transfer'
      ? `Payment: Bank Transfer\nPlease make sure your transfer of ${formatNaira(order.total)} has been sent to:\n${BANK_DETAILS.bankName} · ${BANK_DETAILS.accountNumber} · ${BANK_DETAILS.accountName}\nUse ${order.reference} as your transfer narration.`
      : `Payment: Pay on Delivery\nPlease have ${formatNaira(order.total)} ready when your order arrives.`

  const text = `Hi ${order.customer.name.split(' ')[0]},

Thank you for shopping with ${BRAND.name}! 🌸
Your order ${order.reference} has been received.

${lines}

Subtotal: ${formatNaira(order.subtotal)}
Delivery: ${order.deliveryFee ? formatNaira(order.deliveryFee) : 'Free'}
Total: ${formatNaira(order.total)}

${paymentNote}

Delivering to:
${order.customer.address}, ${order.customer.city}, ${order.customer.state}

We'll reach out on ${order.customer.phone} once your order is on its way.

With love,
${BRAND.name} · ${BRAND.instagramHandle}`

  return {
    to: order.customer.email,
    subject: `Your ${BRAND.name} order ${order.reference} is confirmed 🌸`,
    text,
    html: `<pre style="font-family:Georgia,serif;font-size:15px;line-height:1.6;white-space:pre-wrap">${escapeHtml(text)}</pre>`,
    'v:order_reference': order.reference,
    'v:payment_method': PAYMENT_METHODS[order.paymentMethod],
  }
}

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * Send (or simulate) the order confirmation email.
 *
 * Never call Mailgun directly from the browser — that would expose the API
 * key. Instead set VITE_ORDER_EMAIL_ENDPOINT to a server-side function (see
 * supabase/functions/send-order-email) that holds the Mailgun credentials.
 * Without it, the email is simulated and logged to the console.
 *
 * @returns {Promise<{ status: 'sent' | 'simulated' | 'failed', payload: object }>}
 */
export async function sendOrderConfirmation(order) {
  const payload = buildOrderEmail(order)

  if (!EMAIL_ENDPOINT) {
    await new Promise((r) => setTimeout(r, 600))
    console.groupCollapsed(`📧 [Simulated email] ${payload.subject}`)
    console.log('To:', payload.to)
    console.log(payload.text)
    console.groupEnd()
    return { status: 'simulated', payload }
  }

  try {
    const res = await fetch(EMAIL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`Email endpoint responded ${res.status}`)
    return { status: 'sent', payload }
  } catch (err) {
    console.error('[Dariy Bloom] Confirmation email failed:', err)
    return { status: 'failed', payload }
  }
}
