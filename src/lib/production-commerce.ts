import { demoUserId } from "./db";
import type { DbOrder } from "./mvp-store";
import { getPostgresPool, queryPostgres } from "./supabase-server";

const demoUsers = {
  "demo-customer": {
    uuid: "00000000-0000-4000-8000-000000000101",
    role: "customer",
    name: "Kedai Teman Kopi",
    phone: "0812-2406-0505",
    email: "customer@jbd.local",
  },
  "admin-ops": {
    uuid: "00000000-0000-4000-8000-000000000201",
    role: "admin",
    name: "Admin Commerce",
    phone: "0812-2406-0001",
    email: "admin@jbd.local",
  },
  "finance-controller": {
    uuid: "00000000-0000-4000-8000-000000000301",
    role: "finance",
    name: "Finance Controller",
    phone: "0812-2406-0002",
    email: "finance@jbd.local",
  },
  "wh-bekasi": {
    uuid: "00000000-0000-4000-8000-000000000401",
    role: "warehouse",
    name: "Warehouse Bekasi",
    phone: "0812-2406-0003",
    email: "warehouse@jbd.local",
  },
  "seller-nusa": {
    uuid: "00000000-0000-4000-8000-000000000501",
    role: "seller",
    name: "Seller Nusa",
    phone: "0812-2406-0004",
    email: "seller@jbd.local",
  },
} as const;

type CartLineRow = {
  cart_item_id: string;
  product_slug: string;
  product_name: string;
  product_price: string;
  variant_name: string | null;
  variant_price: string | null;
  quantity: number;
  note: string | null;
};

type OrderRow = {
  order_number: string;
  user_id: string;
  status: DbOrder["status"];
  payment_status: "pending" | "paid";
  shipment_status: string;
  courier: string | null;
  service: string | null;
  awb: string | null;
  tracking_events: Array<{ status: string; at: string; note?: string }> | null;
  total: string;
  address_id: string | null;
  created_at: Date;
  updated_at: Date;
  items: Array<{ productSlug: string; name: string; qty: number; price: string; variant: string | null }>;
};

function roleUser(userId = demoUserId) {
  return demoUsers[userId as keyof typeof demoUsers] ?? demoUsers["demo-customer"];
}

function orderNumber() {
  const date = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `JBD-${date}-${random}`;
}

export async function ensureProductionUser(userId = demoUserId) {
  const user = roleUser(userId);
  await queryPostgres(
    `insert into auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin
    )
    values (
      $1, '00000000-0000-0000-0000-000000000000', 'authenticated',
      'authenticated', $2, '', now(), now(), now(),
      jsonb_build_object('provider', 'email', 'providers', array['email']),
      '{}'::jsonb, false
    )
    on conflict (id) do update set
      email = excluded.email,
      updated_at = now()`,
    [user.uuid, user.email],
  );
  await queryPostgres(
    `insert into public.profiles (id, role, name, phone, email, tier, points)
     values ($1, $2::public.app_role, $3, $4, $5, 'Gold', 1250)
     on conflict (id) do update set
      role = excluded.role,
      name = excluded.name,
      phone = excluded.phone,
      email = excluded.email,
      updated_at = now()`,
    [user.uuid, user.role, user.name, user.phone, user.email],
  );
  if (user.role === "customer") {
    await queryPostgres(
      `insert into public.addresses (
        user_id, label, recipient_name, phone, address_line,
        city, province, postal_code, note, is_primary
      )
      select $1, 'Utama', $2, $3,
        'Jl. Melati Raya No. 18, Bekasi Selatan',
        'Bekasi', 'Jawa Barat', '17148',
        'Kirim jam operasional kedai', true
      where not exists (
        select 1 from public.addresses where user_id = $1
      )`,
      [user.uuid, user.name, user.phone],
    );
    await queryPostgres(
      `insert into public.vouchers (
        code, name, discount_type, value, max_discount, min_spend,
        quota, used_count, starts_at, ends_at, active
      )
      values (
        'JBD25', 'Diskon Rp 25.000', 'fixed', 25000, 25000, 100000,
        1000, 0, now() - interval '1 day', now() + interval '90 days', true
      )
      on conflict (code) do update set
        value = excluded.value,
        max_discount = excluded.max_discount,
        min_spend = excluded.min_spend,
        active = true`,
    );
  }
  return user.uuid;
}

export async function listProductionAddresses(userId = demoUserId) {
  const uuid = await ensureProductionUser(userId);
  const result = await queryPostgres<{
    id: string;
    recipient_name: string;
    phone: string;
    address_line: string;
    city: string;
    province: string;
    postal_code: string | null;
    note: string | null;
    is_primary: boolean;
  }>(
    `select id, recipient_name, phone, address_line, city, province,
      postal_code, note, is_primary
     from public.addresses
     where user_id = $1
     order by is_primary desc, created_at desc`,
    [uuid],
  );
  return result.rows.map((row) => ({
    id: row.id,
    userId,
    name: row.recipient_name,
    phone: row.phone,
    address: [row.address_line, row.city, row.province, row.postal_code].filter(Boolean).join(", "),
    note: row.note ?? "",
    primary: row.is_primary,
    createdAt: "",
  }));
}

export async function addProductionAddress(formData: FormData, userId = demoUserId) {
  const uuid = await ensureProductionUser(userId);
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim() || "Bekasi";
  const address = String(formData.get("address") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  if (!name || !phone || !address) return;
  await queryPostgres(
    `insert into public.addresses (
      user_id, label, recipient_name, phone, address_line,
      city, province, note, is_primary
    )
    values ($1, 'Alamat', $2, $3, $4, $5, 'Jawa Barat', $6, false)`,
    [uuid, name, phone, address, city, note],
  );
}

async function ensureActiveCart(userUuid: string) {
  const existing = await queryPostgres<{ id: string }>(
    `select id from public.carts
     where user_id = $1 and status = 'active'
     limit 1`,
    [userUuid],
  );
  if (existing.rows[0]) return existing.rows[0].id;
  const inserted = await queryPostgres<{ id: string }>(
    `insert into public.carts (user_id, status)
     values ($1, 'active')
     returning id`,
    [userUuid],
  );
  return inserted.rows[0].id;
}

async function ensureVariant(productSlug: string, variantName: string) {
  const product = await queryPostgres<{ id: string; sku: string; price: string }>(
    `select id, sku, price from public.products where slug = $1 limit 1`,
    [productSlug],
  );
  if (!product.rows[0]) throw new Error("Produk tidak ditemukan.");
  const productRow = product.rows[0];
  const existing = await queryPostgres<{ id: string; price: string }>(
    `select id, price from public.product_variants
     where product_id = $1 and name = $2 and active
     limit 1`,
    [productRow.id, variantName],
  );
  if (existing.rows[0]) return { productId: productRow.id, variantId: existing.rows[0].id, price: Number(existing.rows[0].price) };
  const normalized = variantName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").toUpperCase() || "VAR";
  const inserted = await queryPostgres<{ id: string }>(
    `insert into public.product_variants (
      product_id, name, sku, price, weight_grams, active
    )
    values ($1, $2, $3, $4, null, true)
    on conflict (sku) do update set active = true
    returning id`,
    [productRow.id, variantName, `${productRow.sku}-${normalized}`, productRow.price],
  );
  return { productId: productRow.id, variantId: inserted.rows[0].id, price: Number(productRow.price) };
}

export async function addProductionCartLine(productSlug: string, variantName: string, qty: number, userId = demoUserId) {
  const uuid = await ensureProductionUser(userId);
  const cartId = await ensureActiveCart(uuid);
  const { productId, variantId } = await ensureVariant(productSlug, variantName);
  const existing = await queryPostgres<{ id: string }>(
    `select id from public.cart_items
     where cart_id = $1 and product_id = $2 and variant_id = $3
     limit 1`,
    [cartId, productId, variantId],
  );
  if (existing.rows[0]) {
    await queryPostgres(
      `update public.cart_items
       set quantity = quantity + $2, updated_at = now()
       where id = $1`,
      [existing.rows[0].id, qty],
    );
  } else {
    await queryPostgres(
      `insert into public.cart_items (
        cart_id, product_id, variant_id, quantity, note
      )
      values ($1, $2, $3, $4, 'Ditambahkan dari storefront')`,
      [cartId, productId, variantId, qty],
    );
  }
}

export async function updateProductionCartLine(productSlug: string, variantName: string, action: string, userId = demoUserId) {
  const uuid = await ensureProductionUser(userId);
  const result = await queryPostgres<{ cart_item_id: string; quantity: number }>(
    `select cart_items.id as cart_item_id, cart_items.quantity
     from public.cart_items
     join public.carts on carts.id = cart_items.cart_id
     join public.products on products.id = cart_items.product_id
     left join public.product_variants on product_variants.id = cart_items.variant_id
     where carts.user_id = $1
      and carts.status = 'active'
      and products.slug = $2
      and coalesce(product_variants.name, '') = $3
     limit 1`,
    [uuid, productSlug, variantName],
  );
  const item = result.rows[0];
  if (!item) return;
  if (action === "remove" || (action === "dec" && item.quantity <= 1)) {
    await queryPostgres("delete from public.cart_items where id = $1", [item.cart_item_id]);
    return;
  }
  if (action === "inc") {
    await queryPostgres("update public.cart_items set quantity = quantity + 1, updated_at = now() where id = $1", [item.cart_item_id]);
  }
  if (action === "dec") {
    await queryPostgres("update public.cart_items set quantity = quantity - 1, updated_at = now() where id = $1", [item.cart_item_id]);
  }
}

export async function listProductionCartLines(userId = demoUserId) {
  const uuid = await ensureProductionUser(userId);
  const result = await queryPostgres<CartLineRow>(
    `select cart_items.id as cart_item_id, products.slug as product_slug,
      products.name as product_name, products.price as product_price,
      product_variants.name as variant_name, product_variants.price as variant_price,
      cart_items.quantity, cart_items.note
     from public.cart_items
     join public.carts on carts.id = cart_items.cart_id
     join public.products on products.id = cart_items.product_id
     left join public.product_variants on product_variants.id = cart_items.variant_id
     where carts.user_id = $1 and carts.status = 'active'
     order by cart_items.created_at desc`,
    [uuid],
  );
  return result.rows;
}

export async function getProductionOrderSummary(userId = demoUserId) {
  const lines = await listProductionCartLines(userId);
  const subtotal = lines.reduce((total, line) => total + Number(line.variant_price ?? line.product_price) * line.quantity, 0);
  const voucher = await queryPostgres<{ code: string; value: string; min_spend: string }>(
    `select code, value, min_spend from public.vouchers
     where code = 'JBD25' and active and now() between starts_at and ends_at
     limit 1`,
  );
  const selectedVoucher = voucher.rows[0];
  const voucherEligible = Boolean(selectedVoucher && subtotal >= Number(selectedVoucher.min_spend));
  const voucherDiscount = voucherEligible ? Number(selectedVoucher.value) : 0;
  const shipping = lines.length ? 18000 : 0;
  const insurance = lines.length ? 3000 : 0;
  const pointsUsed = lines.length ? 10000 : 0;
  const discount = voucherDiscount;
  return {
    subtotal,
    discount,
    voucherDiscount,
    voucherEligible,
    voucherMinSpend: Number(selectedVoucher?.min_spend ?? 100000),
    shipping,
    insurance,
    pointsUsed,
    total: Math.max(0, subtotal - discount - pointsUsed + shipping + insurance),
    appliedPromos: voucherEligible ? ["JBD25"] : [],
  };
}

export async function createProductionOrder(userId = demoUserId) {
  const uuid = await ensureProductionUser(userId);
  const pool = getPostgresPool();
  const client = await pool.connect();
  try {
    await client.query("begin");
    const cart = await client.query<{ id: string }>(
      `select id from public.carts where user_id = $1 and status = 'active' limit 1`,
      [uuid],
    );
    if (!cart.rows[0]) throw new Error("Cart kosong.");
    const lines = await client.query<CartLineRow & { product_id: string; variant_id: string }>(
      `select cart_items.id as cart_item_id, cart_items.product_id, cart_items.variant_id,
        products.slug as product_slug, products.name as product_name,
        products.price as product_price, product_variants.name as variant_name,
        product_variants.price as variant_price, cart_items.quantity, cart_items.note
       from public.cart_items
       join public.products on products.id = cart_items.product_id
       left join public.product_variants on product_variants.id = cart_items.variant_id
       where cart_items.cart_id = $1`,
      [cart.rows[0].id],
    );
    if (!lines.rows.length) throw new Error("Cart kosong.");
    const summary = await getProductionOrderSummary(userId);
    const address = await client.query<{ id: string }>(
      `select id from public.addresses
       where user_id = $1
       order by is_primary desc, created_at desc
       limit 1`,
      [uuid],
    );
    const number = orderNumber();
    const order = await client.query<{ id: string }>(
      `insert into public.orders (
        order_number, user_id, address_id, status, subtotal, discount,
        shipping_cost, insurance_cost, points_used, total
      )
      values ($1, $2, $3, 'unpaid', $4, $5, $6, $7, $8, $9)
      returning id`,
      [
        number,
        uuid,
        address.rows[0]?.id ?? null,
        summary.subtotal,
        summary.discount,
        summary.shipping,
        summary.insurance,
        summary.pointsUsed,
        summary.total,
      ],
    );
    for (const line of lines.rows) {
      const unitPrice = Number(line.variant_price ?? line.product_price);
      await client.query(
        `insert into public.order_items (
          order_id, product_id, variant_id, product_name, variant_name,
          quantity, unit_price
        )
        values ($1, $2, $3, $4, $5, $6, $7)`,
        [order.rows[0].id, line.product_id, line.variant_id, line.product_name, line.variant_name, line.quantity, unitPrice],
      );
      await client.query(
        `update public.inventory_batches
         set reserved = least(quantity, reserved + $2), updated_at = now()
         where id = (
          select id from public.inventory_batches
          where product_id = $1 and quantity > reserved
          order by expiry_date nulls last, created_at
          limit 1
         )`,
        [line.product_id, line.quantity],
      );
    }
    await client.query(
      `insert into public.payments (order_id, provider, method, status, amount)
       values ($1, 'manual-demo', 'QRIS', 'pending', $2)`,
      [order.rows[0].id, summary.total],
    );
    await client.query(
      `insert into public.shipments (
        order_id, courier, service, status, tracking_events
      )
      values (
        $1, 'JNE', 'Reguler', 'pending',
        jsonb_build_array(jsonb_build_object('status', 'order_created', 'at', now(), 'note', 'Order dibuat dari storefront'))
      )`,
      [order.rows[0].id],
    );
    await client.query("update public.carts set status = 'ordered', updated_at = now() where id = $1", [cart.rows[0].id]);
    await client.query("commit");
    return number;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

function normalizeOrder(row: OrderRow): DbOrder {
  return {
    id: row.order_number,
    userId: row.user_id === roleUser("demo-customer").uuid ? "demo-customer" : row.user_id,
    status: row.status,
    items: row.items.map((item) => ({
      productSlug: item.productSlug,
      name: item.name,
      qty: item.qty,
      price: Number(item.price),
      variant: item.variant ?? "Default",
    })),
    addressId: row.address_id ?? "",
    paymentStatus: row.payment_status,
    shipmentStatus: row.shipment_status as DbOrder["shipmentStatus"],
    courier: row.courier ?? undefined,
    service: row.service ?? undefined,
    awb: row.awb ?? undefined,
    trackingEvents: (row.tracking_events ?? []).map((event) => ({
      status: String(event.status),
      at: String(event.at),
      note: event.note ? String(event.note) : undefined,
    })),
    total: Number(row.total),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function listProductionOrders() {
  await ensureProductionUser();
  const result = await queryPostgres<OrderRow>(
    `select orders.order_number, orders.user_id, orders.status,
      coalesce(payments.status, 'pending') as payment_status,
      coalesce(shipments.status, 'pending') as shipment_status,
      shipments.courier, shipments.service, shipments.awb,
      coalesce(shipments.tracking_events, '[]'::jsonb) as tracking_events,
      orders.total, orders.address_id, orders.created_at, orders.updated_at,
      coalesce(
        jsonb_agg(
          jsonb_build_object(
            'productSlug', products.slug,
            'name', order_items.product_name,
            'qty', order_items.quantity,
            'price', order_items.unit_price,
            'variant', order_items.variant_name
          )
          order by order_items.id
        ) filter (where order_items.id is not null),
        '[]'::jsonb
      ) as items
     from public.orders
     left join public.order_items on order_items.order_id = orders.id
     left join public.products on products.id = order_items.product_id
     left join public.payments on payments.order_id = orders.id
     left join public.shipments on shipments.order_id = orders.id
     group by orders.id, payments.status, shipments.status, shipments.courier, shipments.service, shipments.awb, shipments.tracking_events
     order by orders.created_at desc`,
  );
  return result.rows.map(normalizeOrder);
}

export async function getProductionOrder(orderNumberValue: string) {
  const orders = await listProductionOrders();
  return orders.find((order) => order.id === orderNumberValue) ?? orders[0];
}

export async function advanceProductionOrder(orderNumberValue: string, status: DbOrder["status"]) {
  const shipmentStatus = status === "paid"
    ? "reserved"
    : status === "packing"
      ? "packed"
      : status;
  const awb = status === "packing" || status === "shipped" || status === "delivered"
    ? `JNE-${orderNumberValue.replace(/\D/g, "").slice(-8).padStart(8, "0")}`
    : null;
  await queryPostgres(
    `with target_order as (
      update public.orders
      set status = $2::public.order_status, updated_at = now()
      where order_number = $1
      returning id
    )
    update public.shipments
    set status = $3,
      awb = coalesce($4, awb),
      shipped_at = case when $2::public.order_status = 'shipped' then now() else shipped_at end,
      delivered_at = case when $2::public.order_status = 'delivered' then now() else delivered_at end,
      tracking_events = tracking_events || jsonb_build_array(
        jsonb_build_object('status', $2, 'at', now(), 'note', 'Status diperbarui dari dashboard')
      ),
      updated_at = now()
    where order_id = (select id from target_order)`,
    [orderNumberValue, status, shipmentStatus, awb],
  );
  if (status === "paid") {
    await queryPostgres(
      `update public.payments
       set status = 'paid', paid_at = now(), updated_at = now()
       where order_id = (select id from public.orders where order_number = $1)`,
      [orderNumberValue],
    );
  }
}
