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
│       ├── email.js         ← build + send/simulate confirmation email
│       ├── config.js        ← brand info, bank details, delivery fee
│       └── format.js        ← ₦ formatting, order reference
└── supabase/
    ├── schema.sql           ← tables, RLS policies, product seed
    └── functions/send-order-email/index.ts  ← Mailgun Edge Function
```

## Product images

Images are referenced as `/images/<name>.jpg` and served from `public/images/`.
See [`public/images/README.md`](public/images/README.md) for the exact filenames.

## Supabase (optional)

1. Create a Supabase project and run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor.
   This creates `products` (publicly readable) and `orders` (insert-only for the storefront) and seeds the catalogue.
2. Add your keys to `.env`:
   ```
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon key>
   ```
3. Restart `npm run dev`.

Behaviour:
- **Products** load from Supabase when the table has rows; otherwise `src/data/products.js` is used.
- **Orders** are always saved locally (so the success page survives a refresh) and also inserted into `orders` when Supabase is configured. View them in the Supabase dashboard.

## Order confirmation email (Mailgun)

`src/lib/email.js` builds a Mailgun-shaped payload (`to`, `subject`, `text`, `html`, `v:*` variables).

- **Without** `VITE_ORDER_EMAIL_ENDPOINT`, the email is simulated and printed to the browser console.
- **With** it, the payload is POSTed to that endpoint. Never put a Mailgun key in the frontend — use the included Edge Function:

```bash
supabase secrets set MAILGUN_API_KEY=key-xxx MAILGUN_DOMAIN=mg.yourdomain.com \
  MAILGUN_FROM="Dariy Bloom <orders@mg.yourdomain.com>" ALLOWED_ORIGIN=https://yourstore.com
supabase functions deploy send-order-email --no-verify-jwt
```

Then set `VITE_ORDER_EMAIL_ENDPOINT=https://<project-ref>.supabase.co/functions/v1/send-order-email`.

## Customising

- Brand details, demo bank account, delivery fee & free-delivery threshold: `src/lib/config.js`
- Colours and fonts: the `@theme` block in `src/index.css`
- Products: `src/data/products.js` (or the Supabase `products` table)
