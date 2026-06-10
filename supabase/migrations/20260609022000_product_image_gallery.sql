create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_bucket text not null default 'commerce-media',
  storage_path text,
  media_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now(),
  constraint product_images_media_source_check check (storage_path is not null or media_url <> '')
);

create index if not exists product_images_product_sort_idx
on public.product_images(product_id, sort_order, created_at);

alter table public.product_images enable row level security;

drop policy if exists "Published product images are readable" on public.product_images;
create policy "Published product images are readable"
on public.product_images for select to anon, authenticated
using (
  exists (
    select 1 from public.products
    where products.id = product_images.product_id
      and products.active
  )
);

grant select on public.product_images to anon, authenticated;
