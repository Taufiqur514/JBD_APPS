import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await verifySessionToken(request.cookies.get("jbd_session")?.value);
  const isFinanceRoute =
    request.nextUrl.pathname.startsWith("/finance") ||
    request.nextUrl.pathname.startsWith("/admin/finance") ||
    request.nextUrl.pathname.startsWith("/insights/finance");

  if (isFinanceRoute && session?.role !== "finance") {
    const url = request.nextUrl.clone();
    url.pathname = session ? "/access-denied" : "/login";
    url.search = session ? "?area=finance" : "?next=/finance";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/finance/:path*", "/admin/finance/:path*", "/insights/finance/:path*"],
};
