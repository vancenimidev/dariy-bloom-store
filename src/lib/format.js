const naira = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
})

/** Format a whole-naira amount, e.g. 20000 → "₦20,000". */
export const formatNaira = (amount) => naira.format(amount).replace('NGN', '₦').trim()

/** Human-friendly, unique-enough order reference, e.g. "DB-7K3Q9F". */
export function generateOrderRef() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return 'DB-' + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}
