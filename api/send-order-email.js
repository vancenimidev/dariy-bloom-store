// Vercel Serverless Function: /api/send-order-email
//
//   POST { "reference": "DB-XXXXXX" }  → emails that order's customer via Resend
//   GET                                  → configuration check (no secrets returned)
//
// The POST looks the order up in Supabase (service role key, server-side only),
// builds the confirmation email and sends it through Resend. Each order is emailed
// at most once (orders.confirmation_sent_at), so the endpoint can't be abused for spam.
//
// Vercel → Project → Settings → Environment Variables (enable for Production AND
// Preview, then redeploy — variables only apply to new deployments):
//   RESEND_API_KEY              Resend → API Keys
//   RESEND_FROM                 e.g. Dariy Bloom <orders@dariybloom.com>, on a domain verified
//                               in Resend → Domains. With onboarding@resend.dev, Resend only
//                               delivers to your own Resend account address.
//   SUPABASE_SERVICE_ROLE_KEY   Supabase → Project Settings → API → service_role (secret!)
//   VITE_SUPABASE_URL           already set for the storefront; reused here

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { buildOrderEmail } from '../src/lib/orderEmail.js'

const REFERENCE_PATTERN = /^DB-[A-Z0-9]{6}$/
const DEFAULT_FROM = 'Dariy Bloom <onboarding@resend.dev>'

function getConfig() {
  const env = process.env
  return {
    resendKey: env.RESEND_API_KEY?.trim(),
    from: env.RESEND_FROM?.trim() || DEFAULT_FROM,
    supabaseUrl: (env.SUPABASE_URL || env.VITE_SUPABASE_URL)?.trim(),
    serviceKey: env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') return healthCheck(res)
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const config = getConfig()
  const missing = missingVars(config)
  if (missing.length) {
    console.error('send-order-email: missing environment variables:', missing.join(', '))
    return res.status(500).json({ error: `Email is not configured (missing ${missing.join(', ')})` })
  }

  const body = typeof req.body === 'string' ? safeJson(req.body) : req.body
  const reference = typeof body?.reference === 'string' ? body.reference.trim() : ''
  if (!REFERENCE_PATTERN.test(reference)) return res.status(400).json({ error: 'Invalid order reference' })

  const supabase = createClient(config.supabaseUrl, config.serviceKey, { auth: { persistSession: false } })

  // Claim the order atomically: only succeeds if no confirmation was sent yet.
  const { data: row, error } = await supabase
    .from('orders')
    .update({ confirmation_sent_at: new Date().toISOString() })
    .eq('reference', reference)
    .is('confirmation_sent_at', null)
    .select()
    .maybeSingle()

  if (error) {
    console.error('send-order-email: Supabase error:', error.message)
    return res.status(500).json({ error: `Could not load order: ${error.message}` })
  }
  if (!row) {
    console.warn('send-order-email: order not found or already confirmed:', reference)
    return res.status(404).json({ error: 'Order not found or already confirmed' })
  }

  // From here on, any failure must release the claim so the email can be retried.
  try {
    const email = buildOrderEmail(orderFromRow(row))
    const resend = new Resend(config.resendKey)
    const { data, error: emailError } = await resend.emails.send(
      {
        from: config.from,
        to: [email.to],
        subject: email.subject,
        text: email.text,
        html: email.html,
      },
      // Resend drops repeats of the same key, a second guard against double sends.
      { idempotencyKey: `order-confirmation/${reference}` },
    )

    if (emailError) {
      console.error('send-order-email: Resend error:', JSON.stringify(emailError))
      await releaseClaim(supabase, reference)
      // Only the error type goes to the browser: Resend messages can contain the account's email address.
      // The full message is in the Vercel function logs.
      return res.status(502).json({ error: `Resend rejected the email (${emailError.name ?? 'unknown_error'})` })
    }

    console.log('send-order-email: sent', reference, 'to', email.to, 'id', data?.id)
    return res.status(200).json({ ok: true, id: data?.id })
  } catch (err) {
    console.error('send-order-email: unexpected error:', err)
    await releaseClaim(supabase, reference)
    return res.status(500).json({ error: 'Unexpected error sending email' })
  }
}

/**
 * GET /api/send-order-email — shows whether the function is deployed and
 * configured, without revealing any secret values.
 */
async function healthCheck(res) {
  const config = getConfig()
  const missing = missingVars(config)
  const warnings = []
  if (/@resend\.dev>?$/i.test(config.from)) {
    warnings.push(
      'RESEND_FROM uses onboarding@resend.dev: Resend only delivers to your own Resend account email. ' +
        'Verify your domain in Resend → Domains and send from an address on it.',
    )
  }

  let supabase = 'skipped (missing variables)'
  if (config.supabaseUrl && config.serviceKey) {
    const client = createClient(config.supabaseUrl, config.serviceKey, { auth: { persistSession: false } })
    // Also proves the confirmation_sent_at column exists and the service key works.
    const { error } = await client.from('orders').select('reference, confirmation_sent_at').limit(1)
    supabase = error ? `error: ${error.message}` : 'ok'
  }

  return res.status(200).json({
    deployed: true,
    missingVariables: missing,
    from: config.from,
    supabase,
    warnings,
  })
}

function missingVars({ resendKey, supabaseUrl, serviceKey }) {
  return [
    !resendKey && 'RESEND_API_KEY',
    !supabaseUrl && 'VITE_SUPABASE_URL',
    !serviceKey && 'SUPABASE_SERVICE_ROLE_KEY',
  ].filter(Boolean)
}

async function releaseClaim(supabase, reference) {
  const { error } = await supabase.from('orders').update({ confirmation_sent_at: null }).eq('reference', reference)
  if (error) console.error('send-order-email: could not release claim for', reference, error.message)
}

function safeJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/** Map an `orders` table row back to the shape buildOrderEmail expects. */
const orderFromRow = (row) => ({
  reference: row.reference,
  customer: {
    name: row.customer_name ?? '',
    email: row.customer_email,
    phone: row.customer_phone ?? '',
    address: row.delivery_address ?? '',
    city: row.delivery_city ?? '',
    state: row.delivery_state ?? '',
    notes: row.delivery_notes,
  },
  paymentMethod: row.payment_method,
  items: Array.isArray(row.items) ? row.items : [],
  subtotal: row.subtotal,
  deliveryFee: row.delivery_fee,
  total: row.total,
})
