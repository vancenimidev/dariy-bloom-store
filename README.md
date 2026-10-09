# Dariy Bloom 🌸

> Comfortable. Trendy. Elegant. African print outfits for modern women.
> Occasional & casual sophistication. For confident queens 👑
> Instagram: [@dariy_bloom](https://www.instagram.com/dariy_bloom/)

A responsive e-commerce storefront built with **React + Vite + Tailwind CSS v4**, with
optional **Supabase** persistence and a **Mailgun**-ready order confirmation flow.

## Quick start

```bash
npm install
cp .env.example .env   # optional – the store runs fully offline without it
npm run dev            # http://localhost:5173
npm run build          # production build in dist/
```

## Features

- Sticky, blurred navbar with an animated cart counter and slide-out cart drawer
- Hero, value props, product grid, brand story and footer in a brown / gold / cream theme
- Shop page with category filter and price sort (state kept in the URL)
- Product pages with image gallery, size picker, quantity and "complete the look"
- Cart: add / remove, quantity steppers, live subtotal, free-delivery progress bar (persisted in `localStorage`)
- Checkout: validated contact + delivery form (Nigerian phone numbers and states)
- Payments (simulated): **Bank Transfer** (demo account details, copy buttons, "I've made the transfer" confirmation) and **Pay on Delivery**
- Order success page with full summary and email status
- Graceful image fallbacks — branded placeholders until real photos are added

## Project structure

```
├── index.html
├── public/
│   ├── images/              ← put product photos here (see images/README.md)
│   └── _redirects           ← SPA fallback for Netlify (vercel.json for Vercel)
├── src/
│   ├── main.jsx             ← providers + router
│   ├── App.jsx              ← routes + layout
│   ├── index.css            ← Tailwind theme (brand colours, fonts, utilities)
│   ├── components/          ← Navbar, CartDrawer, Hero, ProductCard, Footer, …
│   ├── pages/               ← Home, Shop, ProductDetail, Checkout, OrderSuccess, NotFound
│   ├── context/             ← CartContext (cart state), ProductsContext (catalogue)
│   ├── data/                ← products.js (hardcoded catalogue), states.js
│   └── lib/
│       ├── supabase.js      ← Supabase client from VITE_SUPABASE_* env vars
│       ├── productsApi.js   ← load products (Supabase → local fallback)
│       ├── ordersApi.js     ← save orders (localStorage + Supabase)
│       ├── email.js         ← request (or simulate) the confirmation email
│       ├── orderEmail.js    ← builds the email text (shared with api/)
│       ├── images.js        ← parses/resolves product image references
│       ├── config.js        ← brand info, bank details, delivery fee
│       └── format.js        ← ₦ formatting, order reference
├── api/
│   └── send-order-email.js  ← Vercel function: sends the Mailgun confirmation
└── supabase/
    └── schema.sql           ← tables, RLS policies, product seed
```

## Product images

Each product's `images` (in `src/data/products.js` or the Supabase `products.images` column) is a list of image references.
`src/lib/images.js` parses the column (JSONB array, JSON string, Postgres array or comma-separated text) and resolves each entry:

| Stored value | Loaded from |
| --- | --- |
| `https://…` | that URL as-is (e.g. a Supabase Storage public URL) |
| `/images/ara-set-1.jpg` or `images/ara-set-1.jpg` | `public/images/` in this repo, deployed with the site |
| `ara-set-1.jpg` or `ara/front.jpg` | public URL in the Supabase Storage bucket `VITE_SUPABASE_STORAGE_BUCKET` (default `product-images`) |

Missing images fall back to a branded placeholder. Filenames are case-sensitive on Vercel (`.JPG` ≠ `.jpg`).
For files in `public/images/`, see [`public/images/README.md`](public/images/README.md).

## Supabase (optional)

1. Create a Supabase project and run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor.
   This creates `products` (publicly readable) and `orders` (insert-only for the storefront) and seeds the catalogue.
   It is safe to re-run on an existing database (it adds any new columns).
2. Add your keys to `.env` (and to Vercel → Settings → Environment Variables):
   ```
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon key>
   ```
3. Restart `npm run dev` (or redeploy on Vercel — `VITE_` variables are baked in at build time).

Behaviour:
- **Products** load from Supabase when the table has rows; otherwise `src/data/products.js` is used.
- **Orders** are always saved locally (so the success page survives a refresh) and also inserted into `orders` when Supabase is configured. View them in the Supabase dashboard.

## Order confirmation email (Mailgun)

`api/send-order-email.js` is a Vercel Serverless Function. After an order is saved to Supabase, the browser POSTs
only the order reference; the function loads the order with the Supabase service role key, builds the email
(`src/lib/orderEmail.js`) and sends it through Mailgun. Each order is emailed at most once (`orders.confirmation_sent_at`),
and the Mailgun key never reaches the browser.

Set these in **Vercel → Project → Settings → Environment Variables**, then redeploy:

| Variable | Value |
| --- | --- |
| `MAILGUN_API_KEY` | Mailgun → API Security → API key |
| `MAILGUN_DOMAIN` | your sending domain, e.g. `mg.dariybloom.com` |
| `MAILGUN_FROM` | optional, e.g. `Dariy Bloom <orders@mg.dariybloom.com>` |
| `MAILGUN_API_BASE` | optional, `https://api.eu.mailgun.net` for EU-region domains |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → `service_role` (secret) |
| `VITE_ORDER_EMAIL_ENDPOINT` | `/api/send-order-email` |

Requires Supabase to be configured (orders must be saved there). Without `VITE_ORDER_EMAIL_ENDPOINT` the email is
simulated and logged to the browser console. `npm run dev` doesn't serve `/api`; use `vercel dev` to test it locally.

## Customising

- Brand details, demo bank account, delivery fee & free-delivery threshold: `src/lib/config.js`
- Colours and fonts: the `@theme` block in `src/index.css`
- Products: `src/data/products.js` (or the Supabase `products` table)
