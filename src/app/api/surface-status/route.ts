import { NextResponse } from "next/server";
import {
  getAnalyticsEvents,
  getCartLines,
  getNotifications,
  getOrders,
  getProducts,
} from "@/lib/mvp-store";
import { isSupabaseConfigured } from "@/lib/supabase-server";

export async function GET() {
  const [products, orders, cartLines, events, notifications] = await Promise.all([
    getProducts(),
    getOrders(),
    getCartLines(),
    getAnalyticsEvents(),
    getNotifications(),
  ]);

  return NextResponse.json({
    status: "connected",
    surfaces: {
      frontstoreWeb: "https://shop.jbd.co.id/",
      frontstoreApp: "https://app.ptskb.co.id/",
      adminWeb: "https://admin.ptskb.co.id/",
      adminApp: "https://admin-app.ptskb.co.id/",
      api: "https://api.ptskb.co.id/",
      media: "https://media.ptskb.co.id/",
    },
    sharedBackend: {
      database: isSupabaseConfigured() ? "Supabase PostgreSQL + Storage" : "MongoDB development fallback",
      products: products.length,
      orders: orders.length,
      cartItems: cartLines.reduce((sum, line) => sum + line.qty, 0),
      events: events.length,
      notifications: notifications.length,
    },
    checkedAt: new Date().toISOString(),
  });
}
