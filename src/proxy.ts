import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { allowedRolesForArea, securityHeaders } from "@/lib/security-policy";

const guardedAreas = [
  { prefix: "/admin", area: "admin" },
  { prefix: "/operations", area: "operations" },
  { prefix: "/insights", area: "insights" },
  { prefix: "/finance", area: "finance" },
] as const;

export async function proxy(request: NextRequest) {
  const session = await verifySessionToken(request.cookies.get("jbd_session")?.value);
  const guard = guardedAreas.find((item) => request.nextUrl.pathname.startsWith(item.prefix));

  if (guard && (!session || !allowedRolesForArea(guard.area).includes(session.role))) {
    const url = request.nextUrl.clone();
    url.pathname = session ? "/access-denied" : "/login";
    url.search = session ? `?area=${guard.area}` : `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  Object.entries(securityHeaders()).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/operations/:path*", "/insights/:path*", "/finance/:path*"],
};
