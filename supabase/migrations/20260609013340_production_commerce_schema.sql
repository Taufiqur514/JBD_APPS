create extension if not exists pgcrypto;

create type public.app_role as enum ('customer', 'admin', 'finance', 'warehouse', 'seller');
create type public.publish_status as enum ('draft', 'scheduled', 'published', 'archived');
create type public.content_type as enum ('image', 'banner', 'video', 'product_video', 'recipe');
create type public.order_status as enum ('unpaid', 'paid', 'picking', 'qc', 'packing', 'shipped', 'delivered', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'customer',
  name text not null,
  phone text,
  email text,
  tier text not null default 'member',
  points integer not null default 0 check (points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  slug text not null unique,
  sku text not null unique,
  name text not null,
  description text not null default '',
  taste text not null default '',
  composition jsonb not null default '[]'::jsonb,
  serving text not null default '',
  price numeric(14,2) not null check (price >= 0),
  compare_at_price numeric(14,2) check (compare_at_price is null or compare_at_price >= 0),
  rating numeric(2,1) not null default 0 check (rating between 0 and 5),
  sold_count integer not null default 0 check (sold_count >= 0),
  cover_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  sku text not null unique,
  price numeric(14,2) not null check (price >= 0),
  weight_grams integer check (weight_grams is null or weight_grams > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default 'Alamat',
  recipient_name text not null,
  phone text not null,
  address_line text not null,
  city text not null,
  province text not null,
  postal_code text,
  note text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'ordered', 'abandoned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index carts_one_active_per_user_idx on public.carts(user_id) where status = 'active';

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id),
  variant_id uuid references public.product_variants(id),
  quantity integer not null check (quantity > 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, product_id, variant_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references public.profiles(id),
  address_id uuid references public.addresses(id),
  status public.order_status not null default 'unpaid',
  subtotal numeric(14,2) not null check (subtotal >= 0),
  discount numeric(14,2) not null default 0 check (discount >= 0),
  shipping_cost numeric(14,2) not null default 0 check (shipping_cost >= 0),
  insurance_cost numeric(14,2) not null default 0 check (insurance_cost >= 0),
  points_used integer not null default 0 check (points_used >= 0),
  total numeric(14,2) not null check (total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  variant_id uuid references public.product_variants(id),
  product_name text not null,
  variant_name text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(14,2) not null check (unit_price >= 0),
  line_total numeric(14,2) generated always as (quantity * unit_price) stored
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  method text not null,
  provider_reference text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'expired', 'refunded')),
  amount numeric(14,2) not null check (amount >= 0),
  paid_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  courier text,
  service text,
  awb text,
  status text not null default 'pending',
  tracking_events jsonb not null default '[]'::jsonb,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.warehouses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  address text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.inventory_batches (
  id uuid primary key default gen_random_uuid(),
  warehouse_id uuid not null references public.warehouses(id),
  product_id uuid not null references public.products(id),
  variant_id uuid references public.product_variants(id),
  batch_number text not null,
  expiry_date date,
  quantity integer not null default 0 check (quantity >= 0),
  reserved integer not null default 0 check (reserved >= 0 and reserved <= quantity),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (warehouse_id, product_id, variant_id, batch_number)
);

create table public.vouchers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  discount_type text not null check (discount_type in ('fixed', 'percentage', 'shipping')),
  value numeric(14,2) not null check (value >= 0),
  max_discount numeric(14,2),
  min_spend numeric(14,2) not null default 0,
  quota integer,
  used_count integer not null default 0,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.content_assets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  type public.content_type not null,
  status public.publish_status not null default 'draft',
  placement text not null default 'live-reel',
  product_id uuid references public.products(id) on delete set null,
  product_slug text,
  storage_bucket text not null default 'commerce-media',
  storage_path text,
  media_url text,
  thumbnail_url text,
  mime_type text,
  file_size bigint check (file_size is null or file_size >= 0),
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  caption text not null default '',
  keywords text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  product_id uuid references public.products(id) on delete set null,
  product_slug text,
  content_asset_id uuid references public.content_assets(id) on delete set null,
  description text not null default '',
  ingredients jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  preparation_minutes integer not null default 3 check (preparation_minutes > 0),
  keywords text[] not null default '{}',
  status public.publish_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_category_id_idx on public.products(category_id);
create index products_active_updated_idx on public.products(updated_at desc) where active;
create index product_variants_product_id_idx on public.product_variants(product_id);
create index addresses_user_id_idx on public.addresses(user_id);
create index cart_items_cart_id_idx on public.cart_items(cart_id);
create index cart_items_product_id_idx on public.cart_items(product_id);
create index orders_user_created_idx on public.orders(user_id, created_at desc);
create index orders_status_created_idx on public.orders(status, created_at desc);
create index order_items_order_id_idx on public.order_items(order_id);
create index payments_order_id_idx on public.payments(order_id);
create index payments_status_created_idx on public.payments(status, created_at desc);
create index inventory_batches_fifo_idx on public.inventory_batches(product_id, expiry_date, created_at);
create index inventory_batches_warehouse_id_idx on public.inventory_batches(warehouse_id);
create index content_assets_publish_idx on public.content_assets(status, published_at desc);
create index content_assets_product_id_idx on public.content_assets(product_id);
create index recipes_publish_idx on public.recipes(status, published_at desc);
create index recipes_product_id_idx on public.recipes(product_id);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.addresses enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.shipments enable row level security;
alter table public.warehouses enable row level security;
alter table public.inventory_batches enable row level security;
alter table public.vouchers enable row level security;
alter table public.content_assets enable row level security;
alter table public.recipes enable row level security;

create policy "Public read active categories"
on public.categories for select to anon, authenticated
using (active);

create policy "Public read active products"
on public.products for select to anon, authenticated
using (active);

create policy "Public read active variants"
on public.product_variants for select to anon, authenticated
using (active);

create policy "Public read active vouchers"
on public.vouchers for select to anon, authenticated
using (active and now() between starts_at and ends_at);

create policy "Public read published content"
on public.content_assets for select to anon, authenticated
using (status = 'published');

create policy "Public read published recipes"
on public.recipes for select to anon, authenticated
using (status = 'published');

create policy "Users read own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

create policy "Users update own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Users manage own addresses"
on public.addresses for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage own carts"
on public.carts for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users manage own cart items"
on public.cart_items for all to authenticated
using (
  exists (
    select 1 from public.carts
    where carts.id = cart_items.cart_id
      and carts.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.carts
    where carts.id = cart_items.cart_id
      and carts.user_id = (select auth.uid())
  )
);

create policy "Users read own orders"
on public.orders for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users read own order items"
on public.order_items for select to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = (select auth.uid())
  )
);

create policy "Users read own payments"
on public.payments for select to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.id = payments.order_id
      and orders.user_id = (select auth.uid())
  )
);

create policy "Users read own shipments"
on public.shipments for select to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.id = shipments.order_id
      and orders.user_id = (select auth.uid())
  )
);

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.products, public.product_variants,
  public.vouchers, public.content_assets, public.recipes to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.addresses, public.carts, public.cart_items to authenticated;
grant select on public.orders, public.order_items, public.payments, public.shipments to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'commerce-media',
  'commerce-media',
  true,
  104857600,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm', 'video/quicktime']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into public.categories (slug, name, sort_order)
values
  ('chocolate', 'Chocolate', 1),
  ('thai-tea', 'Thai Tea', 2),
  ('matcha', 'Matcha', 3),
  ('taro', 'Taro', 4),
  ('red-velvet', 'Red Velvet', 5),
  ('coffee-base', 'Coffee Base', 6)
on conflict (slug) do nothing;

insert into public.products (
  category_id, slug, sku, name, description, taste, composition, serving, price, rating, sold_count, active
)
select
  categories.id,
  'chocolate-premium-500g',
  'JBD-CHOCO-500',
  'JBD Chocolate Premium 500g',
  'Powder chocolate premium untuk cafe, booth minuman, reseller, dan distributor.',
  'Dark chocolate, creamy finish',
  '["Chocolate powder", "Creamer", "Natural flavor"]'::jsonb,
  '25-30 gram per sajian',
  89000,
  4.9,
  1280,
  true
from public.categories
where categories.slug = 'chocolate'
on conflict (slug) do nothing;

insert into public.products (
  category_id, slug, sku, name, description, taste, composition, serving, price, rating, sold_count, active
)
select
  categories.id,
  'matcha-latte-1kg',
  'JBD-MATCHA-1KG',
  'JBD Matcha Latte 1kg',
  'Powder matcha latte dengan warna dan foam stabil untuk operasional cafe.',
  'Fresh green tea profile',
  '["Matcha powder", "Milk powder", "Creamer"]'::jsonb,
  '30 gram per sajian',
  156000,
  4.8,
  840,
  true
from public.categories
where categories.slug = 'matcha'
on conflict (slug) do nothing;

insert into public.products (
  category_id, slug, sku, name, description, taste, composition, serving, price, rating, sold_count, active
)
select
  categories.id,
  'taro-signature-500g',
  'JBD-TARO-500',
  'JBD Taro Signature 500g',
  'Powder taro signature untuk menu iced, frappe, dan creamy drink.',
  'Sweet taro aroma',
  '["Taro powder", "Creamer", "Natural flavor"]'::jsonb,
  '25-30 gram per sajian',
  92000,
  4.8,
  690,
  true
from public.categories
where categories.slug = 'taro'
on conflict (slug) do nothing;
