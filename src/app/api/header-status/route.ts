import { NextResponse } from "next/server";
import { getCartLines, getNotifications } from "@/lib/mvp-store";

export async function GET() {
  const [cartLines, notifications] = await Promise.all([getCartLines(), getNotifications()]);
  return NextResponse.json({
    cart: cartLines.reduce((sum, line) => sum + line.qty, 0),
    notifications: notifications.filter((item) => item.status === "queued").length,
  });
}
