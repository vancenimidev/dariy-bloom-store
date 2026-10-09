// Vercel Serverless Function: POST /api/send-order-email  { "reference": "DB-XXXXXX" }
//
// Looks the order up in Supabase (service role key, server-side only), builds the
// confirmation email and sends it through Mailgun. Each order is emailed at most
// once (orders.confirmation_sent_at), so the endpoint can't be abused for spam.
//
// Vercel → Project → Settings → Environment Variables:
//   MAILGUN_API_KEY            Mailgun → API Security → sending/private API key
//   MAILGUN_DOMAIN             e.g. mg.dariybloom.com (or your sandbox domain while testing)
//   MAILGUN_FROM               e.g. Dariy Bloom <orders@mg.dariybloom.com>   (optional)
//   MAILGUN_API_BASE           https://api.eu.mailgun.net for EU domains      (optional)
//   SUPABASE_SERVICE_ROLE_KEY  Supabase → Project Settings → API → service_role (secret!)
//   VITE_SUPABASE_URL          already set for the storefront; reused here

import { createClient } from '@supabase/supabase-js'
import { buildOrderEmail } from '../src/lib/orderEmail.js'

const REFERENCE_PATTERN = /^DB-[A-Z0-9]{6}$/

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { MAILGUN_API_KEY, MAILGUN_DOMAIN, SUPABASE_SERVICE_ROLE_KEY } = process.env
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN || !supabaseUrl || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('send-order-email: missing environment variables')
    return res.status(500).json({ error: 'Email is not configured' })
  }

  const reference = typeof req.body?.reference === 'string' ? req.body.reference.trim() : ''
  if (!REFERENCE_PATTERN.test(reference)) return res.status(400).json({ error: 'Invalid order reference' })

  const supabase = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

  // Claim the order atomically: only succeeds if no confirmation was sent yet.
  const { data: row, error } = await supabase
    .from('orders')
    .update({ confirmation_sent_at: new Date().toISOString() })
    .eq('reference', reference)
    .is('confirmation_sent_at', null)
    .select()
    .maybeSingle()

  if (error) {
    console.error('send-order-email: Supabase error', error.message)
    return res.status(500).json({ error: 'Could not load order' })
  }
  if (!row) return res.status(404).json({ error: 'Order not found or already confirmed' })

  const email = buildOrderEmail(orderFromRow(row))
  const form = new FormData()
  form.append('from', process.env.MAILGUN_FROM || `Dariy Bloom <orders@${MAILGUN_DOMAIN}>`)
  form.append('to', email.to)
  form.append('subject', email.subject)
  form.append('text', email.text)
  form.append('html', email.html)
  for (const [key, value] of Object.entries(email)) {
    if (key.startsWith('v:')) form.append(key, String(value))
  }

  const apiBase = process.env.MAILGUN_API_BASE || 'https://api.mailgun.net'
  const mg = await fetch(`${apiBase}/v3/${MAILGUN_DOMAIN}/messages`, {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64')}` },
    body: form,
  })

  if (!mg.ok) {
    console.error('send-order-email: Mailgun error', mg.status, await mg.text())
    // Release the claim so the email can be retried.
    await supabase.from('orders').update({ confirmation_sent_at: null }).eq('reference', reference)
    return res.status(502).json({ error: 'Email provider error' })
  }

  return res.status(200).json({ ok: true })
}

/** Map an `orders` table row back to the shape buildOrderEmail expects. */
const orderFromRow = (row) => ({
  reference: row.reference,
  customer: {
    name: row.customer_name,
    email: row.customer_email,
    phone: row.customer_phone,
    address: row.delivery_address,
    city: row.delivery_city,
    state: row.delivery_state,
    notes: row.delivery_notes,
  },
  paymentMethod: row.payment_method,
  items: row.items ?? [],
  subtotal: row.subtotal,
  deliveryFee: row.delivery_fee,
  total: row.total,
})
