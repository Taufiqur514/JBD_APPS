insert into public.warehouses (code, name, address)
values ('BKS', 'Bekasi Main Warehouse', 'Bekasi, Jawa Barat')
on conflict (code) do nothing;

insert into public.inventory_batches (
  warehouse_id, product_id, batch_number, expiry_date, quantity, reserved
)
select warehouses.id, products.id, 'BKS-CHO-2606', '2027-06-30', 224, 0
from public.warehouses, public.products
where warehouses.code = 'BKS' and products.slug = 'chocolate-premium-500g'
on conflict do nothing;

insert into public.inventory_batches (
  warehouse_id, product_id, batch_number, expiry_date, quantity, reserved
)
select warehouses.id, products.id, 'BKS-MAT-2606', '2027-06-30', 48, 0
from public.warehouses, public.products
where warehouses.code = 'BKS' and products.slug = 'matcha-latte-1kg'
on conflict do nothing;

insert into public.inventory_batches (
  warehouse_id, product_id, batch_number, expiry_date, quantity, reserved
)
select warehouses.id, products.id, 'BKS-TAR-2606', '2027-06-30', 29, 0
from public.warehouses, public.products
where warehouses.code = 'BKS' and products.slug = 'taro-signature-500g'
on conflict do nothing;

insert into public.content_assets (
  title, slug, type, status, placement, product_id, product_slug,
  caption, keywords, published_at
)
select
  'Better Ingredients, Better Drink',
  'better-ingredients-better-drink',
  'banner',
  'published',
  'home-carousel',
  products.id,
  products.slug,
  'Powder minuman premium untuk cafe, booth, reseller, dan distributor.',
  array['banner', 'powder', 'cafe'],
  now()
from public.products
where products.slug = 'chocolate-premium-500g'
on conflict (slug) do nothing;

with inserted_asset as (
  insert into public.content_assets (
    title, slug, type, status, placement, product_id, product_slug,
    caption, keywords, published_at
  )
  select
    'Iced Chocolate Signature',
    'iced-chocolate-signature',
    'recipe',
    'published',
    'recipe-live-reel',
    products.id,
    products.slug,
    'Resep minuman chocolate signature yang cepat dibuat dan stabil untuk operasional cafe.',
    array['chocolate', 'iced', 'cafe'],
    now()
  from public.products
  where products.slug = 'chocolate-premium-500g'
  on conflict (slug) do update set title = excluded.title
  returning id, product_id, product_slug
)
insert into public.recipes (
  title, slug, product_id, product_slug, content_asset_id, description,
  ingredients, steps, preparation_minutes, keywords, status, published_at
)
select
  'Iced Chocolate Signature',
  'iced-chocolate-signature',
  inserted_asset.product_id,
  inserted_asset.product_slug,
  inserted_asset.id,
  'Minuman chocolate creamy untuk menu cafe dan booth.',
  '["30g JBD Chocolate Premium", "150ml susu atau air", "Es batu"]'::jsonb,
  '["Larutkan powder", "Tambahkan susu", "Kocok atau blend dengan es"]'::jsonb,
  3,
  array['chocolate', 'iced', 'cafe'],
  'published',
  now()
from inserted_asset
on conflict (slug) do nothing;

with inserted_asset as (
  insert into public.content_assets (
    title, slug, type, status, placement, product_id, product_slug,
    caption, keywords, published_at
  )
  select
    'Matcha Latte Foam Stable',
    'matcha-latte-foam-stable',
    'recipe',
    'published',
    'recipe-live-reel',
    products.id,
    products.slug,
    'Resep matcha latte dengan warna dan foam stabil.',
    array['matcha', 'latte', 'foam'],
    now()
  from public.products
  where products.slug = 'matcha-latte-1kg'
  on conflict (slug) do update set title = excluded.title
  returning id, product_id, product_slug
)
insert into public.recipes (
  title, slug, product_id, product_slug, content_asset_id, description,
  ingredients, steps, preparation_minutes, keywords, status, published_at
)
select
  'Matcha Latte Foam Stable',
  'matcha-latte-foam-stable',
  inserted_asset.product_id,
  inserted_asset.product_slug,
  inserted_asset.id,
  'Menu matcha premium dengan proses penyajian sederhana.',
  '["35g JBD Matcha Latte", "160ml susu", "Es batu"]'::jsonb,
  '["Larutkan powder", "Tambahkan susu", "Shake sampai foam terbentuk"]'::jsonb,
  3,
  array['matcha', 'latte', 'foam'],
  'published',
  now()
from inserted_asset
on conflict (slug) do nothing;

with inserted_asset as (
  insert into public.content_assets (
    title, slug, type, status, placement, product_id, product_slug,
    caption, keywords, published_at
  )
  select
    'Taro Frappe Booth Menu',
    'taro-frappe-booth-menu',
    'recipe',
    'published',
    'recipe-live-reel',
    products.id,
    products.slug,
    'Resep taro frappe dengan warna menarik untuk booth minuman.',
    array['taro', 'frappe', 'booth'],
    now()
  from public.products
  where products.slug = 'taro-signature-500g'
  on conflict (slug) do update set title = excluded.title
  returning id, product_id, product_slug
)
insert into public.recipes (
  title, slug, product_id, product_slug, content_asset_id, description,
  ingredients, steps, preparation_minutes, keywords, status, published_at
)
select
  'Taro Frappe Booth Menu',
  'taro-frappe-booth-menu',
  inserted_asset.product_id,
  inserted_asset.product_slug,
  inserted_asset.id,
  'Menu taro blended untuk penjualan impulsif dan target keluarga.',
  '["30g JBD Taro Signature", "150ml susu", "Es batu"]'::jsonb,
  '["Masukkan semua bahan", "Blend hingga halus", "Sajikan langsung"]'::jsonb,
  4,
  array['taro', 'frappe', 'booth'],
  'published',
  now()
from inserted_asset
on conflict (slug) do nothing;
