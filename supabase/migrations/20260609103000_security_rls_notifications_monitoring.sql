create schema if not exists private;
revoke all on schema private from public;
revoke all on schema private from anon;
revoke all on schema private from authenticated;

create or replace function private.current_app_role()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(auth.jwt() -> 'app_metadata' ->> 'role', ''),
    nullif(auth.jwt() -> 'app_metadata' ->> 'app_role', ''),
    'customer'
  )
$$;

create or replace function private.is_staff(required_roles text[])
returns boolean
language sql
stable
as $$
  select private.current_app_role() = any(required_roles)
$$;

create table if not exists public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('email', 'whatsapp', 'push', 'sms', 'in_app')),
  recipient text not null,
  recipient_user_id uuid references public.profiles(id) on delete set null,
  template text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued', 'processing', 'sent', 'failed', 'cancelled')),
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  scheduled_at timestamptz not null default now(),
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notification_outbox
  add column if not exists recipient_user_id uuid references public.profiles(id) on delete set null,
  add column if not exists scheduled_at timestamptz not null default now();

alter table public.notification_outbox
  drop constraint if exists notification_outbox_status_check;

alter table public.notification_outbox
  add constraint notification_outbox_status_check
  check (status in ('queued', 'processing', 'sent', 'failed', 'cancelled'));

create table if not exists public.provider_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  reference text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'received' check (status in ('received', 'processed', 'failed')),
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.provider_events
  add column if not exists processed_at timestamptz;

create table if not exists public.backup_checks (
  id uuid primary key default gen_random_uuid(),
  check_type text not null default 'scheduled_backup',
  provider text not null default 'supabase',
  status text not null check (status in ('ok', 'warning', 'failed')),
  checked_at timestamptz not null default now(),
  details jsonb not null default '{}'::jsonb,
  created_by uuid references public.profiles(id) on delete set null
);

alter table public.backup_checks
  add column if not exists check_type text not null default 'scheduled_backup',
  add column if not exists created_by uuid references public.profiles(id) on delete set null;

create table if not exists public.security_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  actor_role text,
  event_type text not null,
  target_type text,
  target_id text,
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.security_audit_log
  add column if not exists user_agent text;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'security_audit_log'
      and column_name = 'ip_address'
      and data_type = 'text'
  ) then
    alter table public.security_audit_log
      alter column ip_address type inet using nullif(ip_address, '')::inet;
  end if;
end $$;

create index if not exists notification_outbox_queue_idx
on public.notification_outbox(status, scheduled_at, created_at);

create index if not exists provider_events_reference_idx
on public.provider_events(provider, reference, created_at desc);

create index if not exists security_audit_log_created_idx
on public.security_audit_log(created_at desc, actor_role);

alter table public.notification_outbox enable row level security;
alter table public.provider_events enable row level security;
alter table public.backup_checks enable row level security;
alter table public.security_audit_log enable row level security;

drop policy if exists "Users read own notifications" on public.notification_outbox;
create policy "Users read own notifications"
on public.notification_outbox for select to authenticated
using (
  recipient_user_id = auth.uid()
  or recipient = auth.uid()::text
  or private.is_staff(array['admin', 'warehouse', 'finance'])
);

drop policy if exists "Staff manage notification outbox" on public.notification_outbox;
create policy "Staff manage notification outbox"
on public.notification_outbox for all to authenticated
using (private.is_staff(array['admin', 'finance']))
with check (private.is_staff(array['admin', 'finance']));

drop policy if exists "Finance read provider events" on public.provider_events;
create policy "Finance read provider events"
on public.provider_events for select to authenticated
using (private.is_staff(array['admin', 'finance']));

drop policy if exists "Staff read backup checks" on public.backup_checks;
create policy "Staff read backup checks"
on public.backup_checks for select to authenticated
using (private.is_staff(array['admin', 'finance']));

drop policy if exists "Admin insert backup checks" on public.backup_checks;
create policy "Admin insert backup checks"
on public.backup_checks for insert to authenticated
with check (private.is_staff(array['admin']));

drop policy if exists "Staff read security audit log" on public.security_audit_log;
create policy "Staff read security audit log"
on public.security_audit_log for select to authenticated
using (private.is_staff(array['admin', 'finance']));

drop policy if exists "Admin insert security audit log" on public.security_audit_log;
create policy "Admin insert security audit log"
on public.security_audit_log for insert to authenticated
with check (private.is_staff(array['admin']));

drop policy if exists "Staff read all profiles" on public.profiles;
create policy "Staff read all profiles"
on public.profiles for select to authenticated
using (private.is_staff(array['admin', 'seller', 'finance']));

drop policy if exists "Staff manage categories" on public.categories;
create policy "Staff manage categories"
on public.categories for all to authenticated
using (private.is_staff(array['admin', 'seller']))
with check (private.is_staff(array['admin', 'seller']));

drop policy if exists "Staff manage products" on public.products;
create policy "Staff manage products"
on public.products for all to authenticated
using (private.is_staff(array['admin', 'seller']))
with check (private.is_staff(array['admin', 'seller']));

drop policy if exists "Staff manage product variants" on public.product_variants;
create policy "Staff manage product variants"
on public.product_variants for all to authenticated
using (private.is_staff(array['admin', 'seller']))
with check (private.is_staff(array['admin', 'seller']));

drop policy if exists "Staff manage product images" on public.product_images;
create policy "Staff manage product images"
on public.product_images for all to authenticated
using (private.is_staff(array['admin', 'seller']))
with check (private.is_staff(array['admin', 'seller']));

drop policy if exists "Staff manage vouchers" on public.vouchers;
create policy "Staff manage vouchers"
on public.vouchers for all to authenticated
using (private.is_staff(array['admin', 'seller', 'finance']))
with check (private.is_staff(array['admin', 'seller', 'finance']));

drop policy if exists "Warehouse read inventory" on public.inventory_batches;
create policy "Warehouse read inventory"
on public.inventory_batches for select to authenticated
using (private.is_staff(array['admin', 'warehouse', 'finance']));

drop policy if exists "Warehouse manage inventory" on public.inventory_batches;
create policy "Warehouse manage inventory"
on public.inventory_batches for all to authenticated
using (private.is_staff(array['admin', 'warehouse']))
with check (private.is_staff(array['admin', 'warehouse']));

drop policy if exists "Staff read warehouses" on public.warehouses;
create policy "Staff read warehouses"
on public.warehouses for select to authenticated
using (private.is_staff(array['admin', 'warehouse', 'finance']));

drop policy if exists "Admin manage warehouses" on public.warehouses;
create policy "Admin manage warehouses"
on public.warehouses for all to authenticated
using (private.is_staff(array['admin']))
with check (private.is_staff(array['admin']));

drop policy if exists "Staff read all orders" on public.orders;
create policy "Staff read all orders"
on public.orders for select to authenticated
using (private.is_staff(array['admin', 'warehouse', 'finance', 'seller']));

drop policy if exists "Warehouse update order status" on public.orders;
create policy "Warehouse update order status"
on public.orders for update to authenticated
using (private.is_staff(array['admin', 'warehouse']))
with check (private.is_staff(array['admin', 'warehouse']));

drop policy if exists "Staff read order items" on public.order_items;
create policy "Staff read order items"
on public.order_items for select to authenticated
using (private.is_staff(array['admin', 'warehouse', 'finance', 'seller']));

drop policy if exists "Finance read payments" on public.payments;
create policy "Finance read payments"
on public.payments for select to authenticated
using (private.is_staff(array['admin', 'finance']));

drop policy if exists "Finance update payments" on public.payments;
create policy "Finance update payments"
on public.payments for update to authenticated
using (private.is_staff(array['finance']))
with check (private.is_staff(array['finance']));

drop policy if exists "Staff read shipments" on public.shipments;
create policy "Staff read shipments"
on public.shipments for select to authenticated
using (private.is_staff(array['admin', 'warehouse', 'seller']));

drop policy if exists "Warehouse update shipments" on public.shipments;
create policy "Warehouse update shipments"
on public.shipments for update to authenticated
using (private.is_staff(array['admin', 'warehouse']))
with check (private.is_staff(array['admin', 'warehouse']));

drop policy if exists "Staff manage content assets" on public.content_assets;
create policy "Staff manage content assets"
on public.content_assets for all to authenticated
using (private.is_staff(array['admin', 'seller']))
with check (private.is_staff(array['admin', 'seller']));

drop policy if exists "Staff manage recipes" on public.recipes;
create policy "Staff manage recipes"
on public.recipes for all to authenticated
using (private.is_staff(array['admin', 'seller']))
with check (private.is_staff(array['admin', 'seller']));

drop policy if exists "Public read commerce media" on storage.objects;
create policy "Public read commerce media"
on storage.objects for select to anon, authenticated
using (bucket_id = 'commerce-media');

drop policy if exists "Staff upload commerce media" on storage.objects;
create policy "Staff upload commerce media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'commerce-media'
  and private.is_staff(array['admin', 'seller'])
);

drop policy if exists "Staff update commerce media" on storage.objects;
create policy "Staff update commerce media"
on storage.objects for update to authenticated
using (
  bucket_id = 'commerce-media'
  and private.is_staff(array['admin', 'seller'])
)
with check (
  bucket_id = 'commerce-media'
  and private.is_staff(array['admin', 'seller'])
);

drop policy if exists "Staff delete commerce media" on storage.objects;
create policy "Staff delete commerce media"
on storage.objects for delete to authenticated
using (
  bucket_id = 'commerce-media'
  and private.is_staff(array['admin', 'seller'])
);

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.products, public.product_variants,
  public.product_images, public.vouchers, public.content_assets, public.recipes to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.addresses, public.carts, public.cart_items to authenticated;
grant select, insert, update, delete on public.categories, public.products, public.product_variants,
  public.product_images, public.vouchers, public.content_assets, public.recipes to authenticated;
grant select, insert, update, delete on public.warehouses, public.inventory_batches to authenticated;
grant select, update on public.orders, public.payments, public.shipments to authenticated;
grant select on public.order_items to authenticated;
grant select, insert, update on public.notification_outbox, public.backup_checks,
  public.security_audit_log to authenticated;
grant select on public.provider_events to authenticated;

alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from anon, authenticated, public;
alter default privileges for role postgres in schema public
  revoke usage, select on sequences from anon, authenticated;
