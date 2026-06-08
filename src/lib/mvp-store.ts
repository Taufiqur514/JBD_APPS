import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, demoUserId } from "./db";
import { featuredProducts, productCategories } from "./prototype-data";

export type DbProduct = (typeof featuredProducts)[number] & {
  sku: string;
  active: boolean;
  updatedAt: string;
};

export type DbOrder = {
  id: string;
  userId: string;
  status: "unpaid" | "paid" | "picking" | "qc" | "packing" | "shipped" | "delivered";
  items: Array<{ productSlug: string; name: string; qty: number; price: number; variant: string }>;
  addressId: string;
  paymentStatus: "pending" | "paid";
  shipmentStatus: "pending" | "reserved" | "picking" | "packed" | "shipped" | "delivered";
  total: number;
  createdAt: string;
  updatedAt: string;
};

export type DbRecipe = {
  title: string;
  keyword: string;
  productSlug: string;
  product?: string;
  time?: string;
  margin?: string;
  tone?: string;
  type?: "recipe" | "banner" | "video" | "product-video";
  status?: string;
  createdAt?: string;
};

export type DbUser = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: "customer" | "admin" | "finance" | "warehouse" | "seller";
  segment?: string;
  tier?: string;
  points?: number;
  lastOrderAt?: string;
  totalSpend?: number;
  repeatWindow?: number;
};

export type DbPromoRule = {
  id: string;
  name: string;
  type: "voucher" | "flash-sale" | "tier-pricing" | "bundle" | "cashback" | "referral" | "loyalty";
  status: "active" | "scheduled" | "draft";
  trigger: string;
  reward: string;
  budget: number;
  used: number;
  startsAt: string;
  endsAt: string;
};

export type DbLedgerEntry = {
  id: string;
  date: string;
  account: "AR" | "AP" | "GL" | "COGS" | "OPEX" | "CASH" | "TAX";
  description: string;
  debit: number;
  credit: number;
  source: string;
};

export type DbWarehouseStock = {
  productSlug: string;
  warehouseId: string;
  warehouse: string;
  batch: string;
  expiry: string;
  stock: number;
  reserved: number;
  fifoRank: number;
};

export type DbEvent = {
  id: string;
  type: string;
  actorId: string;
  channel: string;
  value?: number;
  meta?: Record<string, string | number>;
  createdAt: string;
};

export type DbNotification = {
  id: string;
  channel: "email" | "whatsapp" | "push" | "sms" | "in-app";
  recipient: string;
  title: string;
  template: string;
  status: "queued" | "sent" | "failed";
  relatedId: string;
  createdAt: string;
};

let seedPromise: Promise<void> | undefined;
const readCache = new Map<string, { expiresAt: number; value: unknown }>();
const DEFAULT_READ_CACHE_MS = 12_000;
const FAST_READ_CACHE_MS = 30_000;

async function cachedRead<T>(key: string, loader: () => Promise<T>, ttl = DEFAULT_READ_CACHE_MS): Promise<T> {
  const cached = readCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value as T;
  const value = await loader();
  readCache.set(key, { value, expiresAt: Date.now() + ttl });
  return value;
}

export function invalidateMvpCache() {
  readCache.clear();
}

export async function ensureSeed() {
  if (!seedPromise) {
    seedPromise = runSeed().catch((error) => {
      seedPromise = undefined;
      throw error;
    });
  }
  return seedPromise;
}

async function runSeed() {
  const db = await getDb();
  const productCount = await db.collection("products").countDocuments();
  if (productCount === 0) {
    await db.collection("categories").insertMany(
      productCategories.map((name, index) => ({ name, sort: index, active: true })),
    );
    await db.collection("products").insertMany(
      featuredProducts.map((product, index) => ({
        ...product,
        sku: `JBD-${String(index + 1).padStart(3, "0")}`,
        active: true,
        updatedAt: new Date().toISOString(),
      })),
    );
    await db.collection("inventory").insertMany(
      featuredProducts.map((product) => ({
        productSlug: product.slug,
        stock: product.stock,
        reserved: 0,
        batch: `BATCH-${product.slug.slice(0, 3).toUpperCase()}-2606`,
        expiry: "2027-06-30",
      })),
    );
    await db.collection("users").insertOne({
      id: demoUserId,
      name: "Kedai Teman Kopi",
      phone: "0812-2406-0505",
      role: "customer",
      points: 1250,
    });
    await db.collection("addresses").insertMany([
      {
        id: "addr-main",
        userId: demoUserId,
        name: "Kedai Teman Kopi",
        phone: "0812-2406-0505",
        address: "Jl. Melati Raya No. 18, Bekasi Selatan, Jawa Barat",
        primary: true,
      },
      {
        id: "addr-warehouse",
        userId: demoUserId,
        name: "Gudang Reseller Nusa",
        phone: "0813-7788-2406",
        address: "Ruko Niaga Hijau Blok B7, Jakarta Timur",
        primary: false,
      },
    ]);
    await db.collection("vouchers").insertMany([
      { code: "JBD25", type: "discount", value: 25000, active: true, minSpend: 200000 },
      { code: "ONGKIRJBD", type: "shipping", value: 18000, active: true, minSpend: 150000 },
    ]);
    await db.collection("assets").insertMany([
      { id: "banner-1", type: "banner", title: "Better Drink", placement: "home-carousel", status: "published" },
      { id: "short-1", type: "video", title: "Iced Chocolate 30s", placement: "live-short", status: "published" },
    ]);
    await db.collection("recipes").insertMany([
      { title: "Iced Chocolate Signature", keyword: "chocolate cafe", productSlug: "chocolate-premium-500g" },
      { title: "Matcha Latte Foam Stable", keyword: "matcha premium", productSlug: "matcha-latte-1kg" },
      { title: "Taro Frappe Booth Menu", keyword: "taro blended", productSlug: "taro-signature-500g" },
    ]);
  }
  await db.collection("vouchers").updateOne(
    { code: "JBD25" },
    { $set: { value: 25000, minSpend: 150000, active: true } },
  );
  await ensureOperationalSeed();
  await db.collection("promoRules").updateOne(
    { id: "PROMO-JBD25" },
    { $set: { trigger: "Subtotal >= Rp150.000", reward: "Diskon Rp25.000" } },
  );
}

async function ensureOperationalSeed() {
  const db = await getDb();
  const now = new Date().toISOString();
  if ((await db.collection("users").countDocuments({ role: { $ne: "customer" } })) === 0) {
    await db.collection("users").insertMany([
      { id: "admin-ops", name: "Admin Commerce", email: "admin@jbd.test", role: "admin", tier: "staff" },
      { id: "wh-bekasi", name: "Warehouse Bekasi", email: "warehouse@jbd.test", role: "warehouse", tier: "operator" },
      { id: "seller-nusa", name: "Distributor Nusa", email: "seller@jbd.test", role: "seller", tier: "partner" },
    ]);
  }
  await db.collection("users").updateOne(
    { id: "finance-controller" },
    { $set: { name: "Finance Controller", email: "finance@jbd.test", role: "finance", tier: "confidential" } },
    { upsert: true },
  );

  if ((await db.collection("crmProfiles").countDocuments()) === 0) {
    await db.collection("crmProfiles").insertMany([
      {
        userId: demoUserId,
        name: "Kedai Teman Kopi",
        segment: "Active cafe",
        tier: "Gold",
        points: 1250,
        totalSpend: 12800000,
        repeatWindow: 21,
        lastOrderAt: now,
        wishlist: ["chocolate-premium-500g", "matcha-latte-1kg"],
        tickets: [{ id: "CS-1001", topic: "Tanya repeat order", status: "open", channel: "WhatsApp" }],
      },
      {
        userId: "cust-booth-segar",
        name: "Booth Segar Malam",
        segment: "At risk",
        tier: "Silver",
        points: 420,
        totalSpend: 5340000,
        repeatWindow: 35,
        lastOrderAt: "2026-05-14T09:00:00.000Z",
        wishlist: ["taro-signature-500g"],
        tickets: [{ id: "CS-1002", topic: "Follow up promo", status: "pending", channel: "In-app" }],
      },
      {
        userId: "cust-reseller-nusa",
        name: "Reseller Nusa Rasa",
        segment: "VIP reseller",
        tier: "Platinum",
        points: 3100,
        totalSpend: 38200000,
        repeatWindow: 14,
        lastOrderAt: "2026-06-04T11:30:00.000Z",
        wishlist: ["chocolate-premium-500g"],
        tickets: [],
      },
    ]);
  }

  if ((await db.collection("promoRules").countDocuments()) === 0) {
    await db.collection<DbPromoRule>("promoRules").insertMany([
      { id: "PROMO-JBD25", name: "Voucher JBD25", type: "voucher", status: "active", trigger: "Subtotal >= Rp200.000", reward: "Diskon Rp25.000", budget: 15000000, used: 4200000, startsAt: "2026-06-01", endsAt: "2026-06-30" },
      { id: "FLASH-CHOCO", name: "Flash Sale Chocolate", type: "flash-sale", status: "scheduled", trigger: "Jam 19.00-21.00", reward: "Harga Rp79.000", budget: 8000000, used: 0, startsAt: "2026-06-07", endsAt: "2026-06-07" },
      { id: "TIER-HORECA", name: "Horeca Tier Pricing", type: "tier-pricing", status: "active", trigger: "Qty >= 12 pack", reward: "Diskon 8% + prioritas stock", budget: 22000000, used: 9100000, startsAt: "2026-06-01", endsAt: "2026-12-31" },
      { id: "BUNDLE-STARTER", name: "Cafe Starter Bundle", type: "bundle", status: "active", trigger: "Chocolate + Matcha + Taro", reward: "Cashback point 5%", budget: 12000000, used: 3400000, startsAt: "2026-06-01", endsAt: "2026-07-15" },
      { id: "REF-RESELLER", name: "Referral Reseller", type: "referral", status: "draft", trigger: "Invite reseller baru", reward: "Voucher Rp50.000", budget: 6000000, used: 0, startsAt: "2026-06-10", endsAt: "2026-08-31" },
    ]);
  }

  if ((await db.collection("ledger").countDocuments()) === 0) {
    await db.collection<DbLedgerEntry>("ledger").insertMany([
      { id: "LED-001", date: "2026-06-05", account: "AR", description: "Order paid storefront", debit: 482000000, credit: 0, source: "orders" },
      { id: "LED-002", date: "2026-06-05", account: "CASH", description: "Settlement gateway", debit: 469400000, credit: 0, source: "payment" },
      { id: "LED-003", date: "2026-06-05", account: "COGS", description: "HPP powder dan kemasan", debit: 286000000, credit: 0, source: "inventory" },
      { id: "LED-004", date: "2026-06-05", account: "OPEX", description: "Marketing automation spend", debit: 38500000, credit: 0, source: "promotion" },
      { id: "LED-005", date: "2026-06-05", account: "AP", description: "PO cocoa powder base", debit: 0, credit: 74000000, source: "procurement" },
    ]);
  }

  if ((await db.collection("warehouseStocks").countDocuments()) === 0) {
    const products = await db.collection<DbProduct>("products").find({ active: true }).toArray();
    await db.collection<DbWarehouseStock>("warehouseStocks").insertMany(
      products.flatMap((product, index) => [
        { productSlug: product.slug, warehouseId: "BKS", warehouse: "Bekasi Main WH", batch: `BKS-${product.slug.slice(0, 3).toUpperCase()}-2604`, expiry: "2027-04-30", stock: Math.max(12, Math.floor(product.stock * 0.6)), reserved: 0, fifoRank: index + 1 },
        { productSlug: product.slug, warehouseId: "SBY", warehouse: "Surabaya East WH", batch: `SBY-${product.slug.slice(0, 3).toUpperCase()}-2605`, expiry: "2027-05-30", stock: Math.max(8, Math.floor(product.stock * 0.4)), reserved: 0, fifoRank: index + 2 },
      ]),
    );
  }

  if ((await db.collection("events").countDocuments()) === 0) {
    await db.collection<DbEvent>("events").insertMany([
      { id: "EVT-001", type: "view_home", actorId: demoUserId, channel: "storefront", createdAt: now },
      { id: "EVT-002", type: "search", actorId: demoUserId, channel: "storefront", meta: { q: "chocolate" }, createdAt: now },
      { id: "EVT-003", type: "add_to_cart", actorId: demoUserId, channel: "storefront", value: 178000, meta: { product: "chocolate-premium-500g" }, createdAt: now },
      { id: "EVT-004", type: "checkout_started", actorId: demoUserId, channel: "storefront", value: 334000, createdAt: now },
      { id: "EVT-005", type: "payment_success", actorId: demoUserId, channel: "payment", value: 320000, createdAt: now },
    ]);
  }

  if ((await db.collection("notifications").countDocuments()) === 0) {
    await db.collection<DbNotification>("notifications").insertMany([
      { id: "NTF-001", channel: "whatsapp", recipient: "0812-2406-0505", title: "Order paid", template: "payment_success", status: "sent", relatedId: "JBD-demo", createdAt: now },
      { id: "NTF-002", channel: "email", recipient: "admin@jbd.test", title: "Low stock alert", template: "low_stock", status: "queued", relatedId: "matcha-latte-1kg", createdAt: now },
      { id: "NTF-003", channel: "in-app", recipient: demoUserId, title: "Voucher JBD25 aktif", template: "promo", status: "sent", relatedId: "PROMO-JBD25", createdAt: now },
      { id: "NTF-004", channel: "push", recipient: demoUserId, title: "Pesanan siap dikirim", template: "shipment_update", status: "queued", relatedId: "JBD-demo", createdAt: now },
    ]);
  }
}

export async function getProducts() {
  return cachedRead("products:active", async () => {
    await ensureSeed();
    const db = await getDb();
    return db.collection<DbProduct>("products").find({ active: true }).sort({ updatedAt: -1 }).toArray();
  });
}

export async function getProduct(slug: string) {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? products[0];
}

export async function getInventory() {
  return cachedRead("inventory:all", async () => {
    await ensureSeed();
    const db = await getDb();
    return db.collection("inventory").find().toArray();
  }, FAST_READ_CACHE_MS);
}

export async function getAddresses() {
  return cachedRead(`addresses:${demoUserId}`, async () => {
    await ensureSeed();
    const db = await getDb();
    return db.collection("addresses").find({ userId: demoUserId }).toArray();
  });
}

export async function getCartLines() {
  return cachedRead(`cartLines:${demoUserId}`, async () => {
    await ensureSeed();
    const db = await getDb();
    const cart = await db.collection("carts").findOne({ userId: demoUserId, status: "active" });
    const products = await getProducts();
    const items = (cart?.items ?? []) as Array<{ productSlug: string; qty: number; variant: string; note: string }>;
    return items.map((item) => {
      const product = products.find((entry) => entry.slug === item.productSlug) ?? products[0];
      return { ...item, product, lineTotal: product.numericPrice * item.qty };
    });
  }, FAST_READ_CACHE_MS);
}

export async function getOrderSummaryFromCart() {
  return cachedRead(`orderSummary:${demoUserId}`, async () => {
    const lines = await getCartLines();
    const db = await getDb();
    const [promoRules, vouchers] = await Promise.all([
      db.collection<DbPromoRule>("promoRules").find({ status: "active" }).toArray(),
      db.collection<{ code: string; type: string; value: number; active: boolean; minSpend: number }>("vouchers").find({ active: true }).toArray(),
    ]);
    const subtotal = lines.reduce((total, line) => total + line.lineTotal, 0);
    const qty = lines.reduce((total, line) => total + line.qty, 0);
    const selectedVoucher = vouchers.find((voucher) => voucher.code === "JBD25");
    const voucherRule = promoRules.find((rule) => rule.type === "voucher");
    const voucherEligible = Boolean(selectedVoucher && subtotal >= selectedVoucher.minSpend);
    const tierRule = promoRules.find((rule) => rule.type === "tier-pricing" && qty >= 12);
    const bundleRule = promoRules.find((rule) => rule.type === "bundle" && new Set(lines.map((line) => line.product.slug)).size >= 3);
    const voucherDiscount = voucherEligible ? selectedVoucher?.value ?? 0 : 0;
    const tierDiscount = tierRule ? Math.round(subtotal * 0.08) : 0;
    const bundleDiscount = bundleRule ? Math.round(subtotal * 0.05) : 0;
    const discount = voucherDiscount + tierDiscount + bundleDiscount;
    const shipping = lines.length ? 18000 : 0;
    const insurance = lines.length ? 3000 : 0;
    const pointsUsed = lines.length ? 10000 : 0;
    return {
      subtotal,
      discount,
      voucherDiscount,
      voucherEligible,
      voucherMinSpend: selectedVoucher?.minSpend ?? 0,
      shipping,
      insurance,
      pointsUsed,
      total: Math.max(0, subtotal - discount - pointsUsed + shipping + insurance),
      appliedPromos: [voucherEligible ? voucherRule?.id : undefined, tierRule?.id, bundleRule?.id].filter(Boolean),
    };
  }, FAST_READ_CACHE_MS);
}

export async function getOrders() {
  return cachedRead("orders:all", async () => {
    await ensureSeed();
    const db = await getDb();
    return db.collection<DbOrder>("orders").find({}).sort({ createdAt: -1 }).toArray();
  }, FAST_READ_CACHE_MS);
}

export async function getRecipes() {
  return cachedRead("recipes:all", async () => {
    await ensureSeed();
    const db = await getDb();
    return db.collection<DbRecipe>("recipes").find({}).sort({ createdAt: -1 }).toArray();
  });
}

export async function getAssets() {
  return cachedRead("assets:all", async () => {
    await ensureSeed();
    const db = await getDb();
    return db.collection("assets").find({}).sort({ createdAt: -1 }).toArray();
  });
}

export async function getUsers() {
  return cachedRead("users:all", async () => {
    await ensureSeed();
    const db = await getDb();
    return db.collection<DbUser>("users").find({}).sort({ role: 1, name: 1 }).toArray();
  });
}

export async function getCrmProfiles() {
  return cachedRead("crmProfiles:all", async () => {
    await ensureSeed();
    const db = await getDb();
    return db.collection("crmProfiles").find({}).sort({ totalSpend: -1 }).toArray();
  });
}

export async function getPromoRules() {
  return cachedRead("promoRules:all", async () => {
    await ensureSeed();
    const db = await getDb();
    return db.collection<DbPromoRule>("promoRules").find({}).sort({ status: 1, startsAt: -1 }).toArray();
  });
}

export async function getLedger() {
  return cachedRead("ledger:all", async () => {
    await ensureSeed();
    const db = await getDb();
    return db.collection<DbLedgerEntry>("ledger").find({}).sort({ date: -1 }).toArray();
  }, FAST_READ_CACHE_MS);
}

export async function getWarehouseStocks() {
  return cachedRead("warehouseStocks:all", async () => {
    await ensureSeed();
    const db = await getDb();
    return db.collection<DbWarehouseStock>("warehouseStocks").find({}).sort({ warehouseId: 1, fifoRank: 1 }).toArray();
  }, FAST_READ_CACHE_MS);
}

export async function getAnalyticsEvents() {
  return cachedRead("events:all", async () => {
    await ensureSeed();
    const db = await getDb();
    return db.collection<DbEvent>("events").find({}).sort({ createdAt: -1 }).toArray();
  }, FAST_READ_CACHE_MS);
}

export async function getNotifications() {
  return cachedRead("notifications:all", async () => {
    await ensureSeed();
    const db = await getDb();
    return db.collection<DbNotification>("notifications").find({}).sort({ createdAt: -1 }).toArray();
  }, FAST_READ_CACHE_MS);
}

export async function getCustomerProfile(userId = demoUserId) {
  return cachedRead(`customerProfile:${userId}`, async () => {
    await ensureSeed();
    const db = await getDb();
    return db.collection("crmProfiles").findOne({ userId });
  }, FAST_READ_CACHE_MS);
}

export async function getVouchers() {
  return cachedRead("vouchers:active", async () => {
    await ensureSeed();
    const db = await getDb();
    return db.collection("vouchers").find({ active: true }).sort({ code: 1 }).toArray();
  });
}

export async function getReviews() {
  return cachedRead("reviews:all", async () => {
    await ensureSeed();
    const db = await getDb();
    return db.collection("reviews").find({}).sort({ createdAt: -1 }).toArray();
  }, FAST_READ_CACHE_MS);
}

export async function trackEvent(type: string, actorId = demoUserId, channel = "storefront", value?: number, meta?: Record<string, string | number>) {
  await ensureSeed();
  const db = await getDb();
  await db.collection<DbEvent>("events").insertOne({
    id: `EVT-${Date.now()}`,
    type,
    actorId,
    channel,
    value,
    meta,
    createdAt: new Date().toISOString(),
  });
  invalidateMvpCache();
}

export async function getOrder(id: string) {
  const orders = await getOrders();
  return orders.find((order) => order.id === id) ?? orders[0];
}

export async function addToCartAction(formData: FormData) {
  "use server";
  await ensureSeed();
  const slug = String(formData.get("slug") ?? "chocolate-premium-500g");
  const variant = String(formData.get("variant") ?? "500g");
  const db = await getDb();
  const existing = await db.collection("carts").findOne({ userId: demoUserId, status: "active" });
  if (!existing) {
    await db.collection("carts").insertOne({
      userId: demoUserId,
      status: "active",
      items: [{ productSlug: slug, qty: 1, variant, note: "Ditambahkan dari storefront" }],
      updatedAt: new Date().toISOString(),
    });
  } else {
    const item = (existing.items as Array<{ productSlug: string; qty: number }>).find((entry) => entry.productSlug === slug);
    if (item) {
      await db.collection("carts").updateOne(
        { _id: existing._id, "items.productSlug": slug },
        { $inc: { "items.$.qty": 1 }, $set: { updatedAt: new Date().toISOString() } },
      );
    } else {
      await db.collection<{ items: Array<{ productSlug: string; qty: number; variant: string; note: string }> }>("carts").updateOne(
        { _id: existing._id },
        { $push: { items: { productSlug: slug, qty: 1, variant, note: "Ditambahkan dari storefront" } }, $set: { updatedAt: new Date().toISOString() } },
      );
    }
  }
  invalidateMvpCache();
  revalidatePath("/storefront/cart");
  redirect("/storefront/cart");
}

export async function createOrderAction() {
  "use server";
  await ensureSeed();
  const db = await getDb();
  const lines = await getCartLines();
  const summary = await getOrderSummaryFromCart();
  if (!lines.length) redirect("/storefront");
  const now = new Date().toISOString();
  const id = `JBD-${new Date().toISOString().slice(2, 10).replaceAll("-", "")}-${Math.floor(1000 + Math.random() * 9000)}`;
  await db.collection("orders").insertOne({
    id,
    userId: demoUserId,
    status: "unpaid",
    items: lines.map((line) => ({
      productSlug: line.product.slug,
      name: line.product.name,
      qty: line.qty,
      price: line.product.numericPrice,
      variant: line.variant,
    })),
    addressId: "addr-main",
    paymentStatus: "pending",
    shipmentStatus: "pending",
    total: summary.total,
    createdAt: now,
    updatedAt: now,
  });
  await db.collection("carts").updateOne({ userId: demoUserId, status: "active" }, { $set: { status: "ordered", orderId: id, updatedAt: now } });
  invalidateMvpCache();
  revalidatePath("/admin/orders");
  redirect(`/storefront/payment?order=${id}`);
}

export async function payOrderAction(formData: FormData) {
  "use server";
  const id = String(formData.get("orderId"));
  await advanceOrder(id, "paid");
  redirect(`/storefront/success?order=${id}`);
}

export async function processOrderAction(formData: FormData) {
  "use server";
  const id = String(formData.get("orderId"));
  const status = String(formData.get("status")) as DbOrder["status"];
  await advanceOrder(id, status);
  redirect(`/admin/orders/${id}`);
}

export async function operationStatusAction(formData: FormData) {
  "use server";
  const id = String(formData.get("orderId"));
  const status = String(formData.get("status")) as DbOrder["status"];
  const back = String(formData.get("back") ?? "/operations");
  await advanceOrder(id, status);
  redirect(back);
}

export async function advanceOrder(id: string, status: DbOrder["status"]) {
  await ensureSeed();
  const db = await getDb();
  const shipmentStatus =
    status === "paid" ? "reserved" : status === "picking" ? "picking" : status === "packing" ? "packed" : status === "shipped" ? "shipped" : status === "delivered" ? "delivered" : "pending";
  const order = await db.collection<DbOrder>("orders").findOne({ id });
  if (order && status === "paid" && order.status === "unpaid") {
    for (const item of order.items) {
      await db.collection("inventory").updateOne({ productSlug: item.productSlug }, { $inc: { stock: -item.qty, reserved: item.qty } });
      let remaining = item.qty;
      const batches = await db
        .collection<DbWarehouseStock>("warehouseStocks")
        .find({ productSlug: item.productSlug, stock: { $gt: 0 } })
        .sort({ expiry: 1, fifoRank: 1 })
        .toArray();
      for (const batch of batches) {
        if (remaining <= 0) break;
        const take = Math.min(batch.stock, remaining);
        await db.collection("warehouseStocks").updateOne(
          { productSlug: batch.productSlug, warehouseId: batch.warehouseId, batch: batch.batch },
          { $inc: { stock: -take, reserved: take } },
        );
        await db.collection("inventoryMutations").insertOne({
          id: `MUT-${Date.now()}-${batch.batch}`,
          type: "reserve",
          productSlug: item.productSlug,
          warehouseId: batch.warehouseId,
          batch: batch.batch,
          qty: take,
          source: order.id,
          createdAt: new Date().toISOString(),
        });
        remaining -= take;
      }
    }
    await db.collection<DbLedgerEntry>("ledger").insertOne({
      id: `LED-${Date.now()}-${order.id}`,
      date: new Date().toISOString().slice(0, 10),
      account: "AR",
      description: `Order paid ${order.id}`,
      debit: order.total,
      credit: 0,
      source: "orders",
    });
    await db.collection<DbNotification>("notifications").insertOne({
      id: `NTF-${Date.now()}-${order.id}`,
      channel: "whatsapp",
      recipient: order.userId,
      title: "Pembayaran diterima",
      template: "payment_success",
      status: "queued",
      relatedId: order.id,
      createdAt: new Date().toISOString(),
    });
  }
  if (order && status === "delivered" && order.status !== "delivered") {
    const points = Math.floor(order.total / 1000);
    await db.collection("crmProfiles").updateOne({ userId: order.userId }, { $inc: { points }, $set: { lastOrderAt: new Date().toISOString() } });
    await db.collection<DbNotification>("notifications").insertOne({
      id: `NTF-${Date.now()}-LOYALTY`,
      channel: "in-app",
      recipient: order.userId,
      title: `+${points} loyalty point`,
      template: "loyalty_earned",
      status: "queued",
      relatedId: order.id,
      createdAt: new Date().toISOString(),
    });
  }
  await db.collection("orders").updateOne(
    { id },
    {
      $set: {
        status,
        paymentStatus: status === "unpaid" ? "pending" : "paid",
        shipmentStatus,
        updatedAt: new Date().toISOString(),
      },
    },
  );
  invalidateMvpCache();
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/operations");
}
