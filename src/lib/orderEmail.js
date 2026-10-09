import { BANK_DETAILS, BRAND, PAYMENT_METHODS } from './config.js'
import { formatNaira } from './format.js'

// Pure (no browser or Vite APIs) so the Vercel function in api/ can import it too.

/**
 * Build the order confirmation email. Field names match Mailgun's
 * `messages` API (to / subject / text / html / v:* variables).
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
