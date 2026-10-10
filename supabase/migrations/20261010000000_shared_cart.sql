-- Dariy Bloom — shared cart (web store + mobile app)
-- Run once in Supabase Dashboard → SQL Editor (safe to re-run).
--
-- A signed-in customer's cart lives here instead of only in one device's
-- local storage, so the mobile app and the web store see the same bag.
-- Guests keep using a local cart; it is merged in when they sign in.

create table if not exists public.cart_items (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  product_id text not null,            -- products.id (no FK: the store can run on its local catalogue)
  size       text not null default '', -- '' for one-size items
  quantity   integer not null check (quantity between 1 and 20),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id, size)
);

alter table public.cart_items enable row level security;

-- Customers can only see and change their own cart.
drop policy if exists "Customers manage their own cart" on public.cart_items;
create policy "Customers manage their own cart"
  on public.cart_items for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Add to cart atomically, so two devices adding at once both count
-- (same 20-per-line cap as the storefront).
create or replace function public.add_to_cart(p_product_id text, p_size text, p_quantity integer)
returns void
language sql
security invoker
set search_path = public
as $$
  insert into public.cart_items (user_id, product_id, size, quantity)
  values (auth.uid(), p_product_id, coalesce(p_size, ''), least(greatest(p_quantity, 1), 20))
  on conflict (user_id, product_id, size)
  do update set quantity   = least(public.cart_items.quantity + excluded.quantity, 20),
                updated_at = now();
$$;

grant execute on function public.add_to_cart(text, text, integer) to authenticated;

-- Broadcast changes so every open device updates live (Supabase Realtime).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'cart_items'
  ) then
    alter publication supabase_realtime add table public.cart_items;
  end if;
end $$;
