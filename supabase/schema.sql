-- Dariy Bloom — Supabase schema
-- Run in Supabase Dashboard → SQL Editor.

-- ─── Products ──────────────────────────────────────────────────────────────
create table if not exists public.products (
  id          text primary key,
  slug        text unique not null,
  name        text not null,
  price       integer not null check (price >= 0),   -- whole naira
  category    text,
  tagline     text,
  description text,
  details     jsonb not null default '[]'::jsonb,
  sizes       jsonb not null default '[]'::jsonb,
  images      jsonb not null default '[]'::jsonb,     -- e.g. ["/images/ara-set-1.jpg"]
  badge       text,
  sort_order  integer not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.products enable row level security;

-- Anyone can read active products.
drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
  on public.products for select
  using (active);

-- ─── Orders ────────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  reference        text unique not null,
  customer_name    text not null,
  customer_email   text not null,
  customer_phone   text not null,
  delivery_address text not null,
  delivery_city    text not null,
  delivery_state   text not null,
  delivery_notes   text,
  payment_method   text not null check (payment_method in ('bank_transfer', 'pay_on_delivery')),
  payment_status   text not null default 'pending',
  items            jsonb not null,
  subtotal         integer not null,
  delivery_fee     integer not null default 0,
  total            integer not null,
  status           text not null default 'new',
  created_at       timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Storefront (anon key) may create orders but never read them back.
-- View/manage orders from the Supabase dashboard or with the service role key.
drop policy if exists "Anyone can place an order" on public.orders;
create policy "Anyone can place an order"
  on public.orders for insert
  to anon, authenticated
  with check (true);

-- ─── Seed the catalogue ────────────────────────────────────────────────────
insert into public.products (id, slug, name, price, category, tagline, description, details, sizes, images, badge, sort_order)
values
  ('nimi-bubble-pants', 'nimi-bubble-pants', 'Nimi Bubble Pants', 20000, 'Casual',
   'Playful volume, effortless ease.',
   'Our signature bubble pants cut from vibrant African print cotton. A high, comfortable waist and a softly gathered ankle create that statement silhouette — dress them up with heels or keep it easy with flats.',
   '["100% African print cotton","High waist with concealed elastic back","Side seam pockets","Gathered bubble hem at the ankle"]',
   '["S","M","L","XL","XXL"]',
   '["/images/nimi-bubble-pants-1.jpg","/images/nimi-bubble-pants-2.jpg","/images/nimi-bubble-pants-3.jpg"]',
   'Bestseller', 0),
  ('nonye-two-piece-corporate-set', 'nonye-two-piece-corporate-set', 'Nonye Two-Piece Corporate Set', 30000, 'Occasion',
   'Boardroom-ready, culture-proud.',
   'A tailored two-piece that brings African print into the office with confidence. A structured top and polished trousers that move from Monday meetings to Friday dinners.',
   '["Structured top with clean neckline","Tailored straight-leg trousers","Fully lined for comfort","Sold as a complete set"]',
   '["S","M","L","XL","XXL"]',
   '["/images/nonye-corporate-set-1.jpg","/images/nonye-corporate-set-2.jpg","/images/nonye-corporate-set-3.jpg"]',
   'New', 1),
  ('dinma-two-piece', 'dinma-two-piece', 'Dinma Two-Piece', 26000, 'Occasion',
   'Soft structure, bold print.',
   'The Dinma set pairs a flattering top with a matching bottom in rich, colour-saturated Ankara. Wear it together for impact or style the pieces separately all week.',
   '["Premium Ankara wax print","Matching top and bottom","Easy-wear, breathable fabric","Pieces can be styled separately"]',
   '["S","M","L","XL"]',
   '["/images/dinma-two-piece-1.jpg","/images/dinma-two-piece-2.jpg","/images/dinma-two-piece-3.jpg"]',
   null, 2),
  ('ara-set', 'ara-set', 'Ara Set', 15000, 'Casual',
   'Everyday elegance, made simple.',
   'Light, breezy and endlessly wearable. The Ara set is your go-to for brunches, errands and weekend getaways — comfort that still turns heads.',
   '["Lightweight African print cotton","Relaxed, comfortable fit","Pull-on design","Perfect for warm days"]',
   '["S","M","L","XL","XXL"]',
   '["/images/ara-set-1.jpg","/images/ara-set-2.jpg","/images/ara-set-3.jpg"]',
   'Great value', 3),
  ('signature-ankara-midi-dress', 'signature-ankara-midi-dress', 'Signature Ankara Midi Dress', 28000, 'Occasion',
   'The dress that walks in before you do.',
   'Our signature midi — a cinched waist, graceful flare and a hem that hits just right. Designed for weddings, celebrations and every occasion that calls for a queen.',
   '["Premium Ankara wax print","Fitted bodice with flared midi skirt","Concealed back zip","Partially lined"]',
   '["S","M","L","XL","XXL"]',
   '["/images/ankara-midi-dress-1.jpg","/images/ankara-midi-dress-2.jpg","/images/ankara-midi-dress-3.jpg"]',
   'Signature', 4)
on conflict (id) do nothing;
