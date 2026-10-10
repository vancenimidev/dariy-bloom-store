# Dariy Bloom — mobile app (Expo)

React Native + Expo Router app for the Dariy Bloom store. It uses the same
Supabase project as the web store, shares its prices, delivery rules and
catalogue (imported from `../src`), and sends order emails through the web
store's Vercel function.

```
mobile/
├── app.json            Expo config (name, scheme, web output)
├── eas.json            EAS Build profiles (development / preview / production)
├── metro.config.js     lets the app import ../src (shared web-store modules)
├── index.js            loads polyfills, then Expo Router
└── src/
    ├── app/            screens: shop, product/[slug], cart, checkout, account, order/[reference]
    ├── context/        AuthContext (email code sign-in), ProductsContext, CartContext
    ├── lib/            supabase client, cartApi (shared cart), ordersApi, email (Vercel), images
    └── components/     small UI kit
```

## 1. Configure

```bash
cd mobile
npm install
cp .env.example .env
```

Fill in `mobile/.env` with the same values as the web store's `.env`
(`VITE_SUPABASE_URL` → `EXPO_PUBLIC_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` →
`EXPO_PUBLIC_SUPABASE_ANON_KEY`) and set `EXPO_PUBLIC_SITE_URL` to the deployed
web store, e.g. `https://dariy-bloom.vercel.app`. Only public values go here:
everything prefixed `EXPO_PUBLIC_` is bundled into the app.

## 2. Supabase (one-time)

1. **Shared cart table:** run `supabase/migrations/20261010000000_shared_cart.sql`
   in Supabase → SQL Editor. It adds `cart_items` (one row per customer, product
   and size, protected by RLS), an atomic `add_to_cart` function and Realtime.
2. **Email codes:** Supabase → Authentication → Sign In / Providers → Email must
   be enabled. In Authentication → Email Templates → Magic Link, include
   `{{ .Token }}` so customers receive a 6-digit code the app can verify.

Guests get a cart stored on the device. When a customer signs in, their guest
items are merged into `cart_items`, and from then on every change syncs live to
any other device signed in to the same account.

## 3. Run

```bash
npm run web       # browser
npm run ios       # iOS simulator / Expo Go
npm run android   # Android emulator / Expo Go
```

## 4. Web preview on EAS Hosting

```bash
npm install --global eas-cli
eas login
npm run deploy:web        # exports dist/ and deploys a preview URL (*.expo.app)
npm run deploy:web:prod   # same, promoted to the production URL
```

The first deploy asks you to link an EAS project and pick a subdomain.
`EXPO_PUBLIC_` values are read from `mobile/.env` at export time.

Native builds use the profiles in `eas.json`, e.g.
`eas build --profile preview --platform android` for an installable APK.
For EAS cloud builds, add the `EXPO_PUBLIC_` variables in the EAS dashboard
(Project → Environment variables) for each environment, since `.env` isn't uploaded.

## Order emails

Checkout inserts the order into the same `orders` table as the web store, then
POSTs `{ reference }` to `${EXPO_PUBLIC_SITE_URL}/api/send-order-email`. The
function looks the order up with its server-side key, so no secret ever ships
in the app. It now sends CORS headers so the web preview (another origin) can
call it; redeploy the web store on Vercel for that to take effect.
