import { NextResponse } from "next/server";
import {
  getAnalyticsEvents,
  getCartLines,
  getNotifications,
  getOrders,
  getProducts,
} from "@/lib/mvp-store";

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
      app: "http://100.81.217.5:3001/storefront",
      frontstoreWeb: "/storefront",
      adminWeb: "/admin",
    },
    sharedBackend: {
      database: "mongodb://127.0.0.1:27017/jbd_commerce",
      products: products.length,
      orders: orders.length,
      cartItems: cartLines.reduce((sum, line) => sum + line.qty, 0),
      events: events.length,
      notifications: notifications.length,
    },
    checkedAt: new Date().toISOString(),
  });
}
