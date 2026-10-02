// Supabase Edge Function: sends the order confirmation email through Mailgun.
//
// Deploy:
//   supabase secrets set MAILGUN_API_KEY=key-xxx MAILGUN_DOMAIN=mg.dariybloom.com \
//     MAILGUN_FROM="Dariy Bloom <orders@mg.dariybloom.com>" ALLOWED_ORIGIN=https://your-store.com
//   supabase functions deploy send-order-email --no-verify-jwt
//
// Then set in the storefront .env:
//   VITE_ORDER_EMAIL_ENDPOINT=https://<project-ref>.supabase.co/functions/v1/send-order-email
//
// For EU-region Mailgun domains set MAILGUN_API_BASE=https://api.eu.mailgun.net

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'content-type, authorization, apikey',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: corsHeaders })

  const apiKey = Deno.env.get('MAILGUN_API_KEY')
  const domain = Deno.env.get('MAILGUN_DOMAIN')
  const from = Deno.env.get('MAILGUN_FROM') ?? `Dariy Bloom <orders@${domain}>`
  const apiBase = Deno.env.get('MAILGUN_API_BASE') ?? 'https://api.mailgun.net'
  if (!apiKey || !domain) {
    return json({ error: 'Mailgun is not configured' }, 500)
  }

  let payload: Record<string, string>
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const { to, subject, text, html } = payload
  if (!to || !subject || !text || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return json({ error: 'Missing or invalid fields' }, 400)
  }

  const form = new FormData()
  form.append('from', from)
  form.append('to', to)
  form.append('subject', subject)
  form.append('text', text)
  if (html) form.append('html', html)
  for (const [key, value] of Object.entries(payload)) {
    if (key.startsWith('v:')) form.append(key, String(value))
  }

  const res = await fetch(`${apiBase}/v3/${domain}/messages`, {
    method: 'POST',
    headers: { Authorization: `Basic ${btoa(`api:${apiKey}`)}` },
    body: form,
  })

  if (!res.ok) {
    console.error('Mailgun error', res.status, await res.text())
    return json({ error: 'Email provider error' }, 502)
  }
  return json({ ok: true })
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
