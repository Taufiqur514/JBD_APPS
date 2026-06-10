import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import {
  absoluteUrlForHost,
  hostFromHeaders,
  isAdminHost,
  isApiHost,
  isConsolePath,
  isMediaHost,
  isProductionSurfaceHost,
  isStorefrontAliasPath,
  isStorefrontHost,
  preferredHostForRole,
  productionDomains,
  roleHomePath,
  storefrontInternalPath,
  stripStorefrontPrefix,
} from "@/lib/domain-routing";
import { allowedRolesForArea, securityHeaders } from "@/lib/security-policy";

const guardedAreas = [
  { prefix: "/admin", area: "admin" },
  { prefix: "/operations", area: "operations" },
  { prefix: "/insights", area: "insights" },
  { prefix: "/finance", area: "finance" },
] as const;

export async function proxy(request: NextRequest) {
  const session = await verifySessionToken(request.cookies.get("jbd_session")?.value);
  const host = hostFromHeaders(request.headers, request.url);
  const pathname = request.nextUrl.pathname;
  const responseHeaders = securityHeaders();

  if (isApiHost(host) && !pathname.startsWith("/api")) {
    const response = pathname === "/"
      ? NextResponse.json({ app: "jbd-commerce-api", status: "ok", health: "/api/health" })
      : NextResponse.redirect(absoluteUrlForHost(request.url, productionDomains.api, "/api/health"));
    Object.entries(responseHeaders).forEach(([key, value]) => response.headers.set(key, value));
    return response;
  }

  if (isMediaHost(host) && !pathname.startsWith("/api") && !pathname.startsWith("/_next")) {
    const response = NextResponse.json({ app: "jbd-commerce-media", status: "reserved", note: "Media CDN endpoint" });
    Object.entries(responseHeaders).forEach(([key, value]) => response.headers.set(key, value));
    return response;
  }

  if (isStorefrontHost(host)) {
    if (session && session.role !== "customer") {
      const targetHost = preferredHostForRole(session.role, host);
      const response = NextResponse.redirect(absoluteUrlForHost(request.url, targetHost, roleHomePath(session.role)));
      Object.entries(responseHeaders).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }

    if (isConsolePath(pathname)) {
      const response = NextResponse.redirect(absoluteUrlForHost(request.url, host, "/"));
      Object.entries(responseHeaders).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }

    if (pathname === "/frontstore" || pathname.startsWith("/storefront")) {
      const url = request.nextUrl.clone();
      url.pathname = stripStorefrontPrefix(pathname);
      const response = NextResponse.redirect(url);
      Object.entries(responseHeaders).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }

    if (pathname === "/" || isStorefrontAliasPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = storefrontInternalPath(pathname);
      const response = NextResponse.rewrite(url);
      Object.entries(responseHeaders).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }
  }

  if (isAdminHost(host)) {
    if (session?.role === "customer") {
      const targetHost = preferredHostForRole(session.role, host);
      const response = NextResponse.redirect(absoluteUrlForHost(request.url, targetHost, roleHomePath(session.role)));
      Object.entries(responseHeaders).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }

    if (pathname === "/") {
      if (!session) {
        const response = NextResponse.redirect(absoluteUrlForHost(request.url, host, "/login", "?next=%2F"));
        Object.entries(responseHeaders).forEach(([key, value]) => response.headers.set(key, value));
        return response;
      }

      const url = request.nextUrl.clone();
      url.pathname = roleHomePath(session.role);
      const response = NextResponse.rewrite(url);
      Object.entries(responseHeaders).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }

    if (pathname === "/frontstore" || pathname.startsWith("/storefront") || isStorefrontAliasPath(pathname)) {
      const response = NextResponse.redirect(absoluteUrlForHost(request.url, host, "/admin"));
      Object.entries(responseHeaders).forEach(([key, value]) => response.headers.set(key, value));
      return response;
    }
  }

  const guard = guardedAreas.find((item) => pathname.startsWith(item.prefix));

  if (guard && (!session || !allowedRolesForArea(guard.area).includes(session.role))) {
    const url = isProductionSurfaceHost(host)
      ? absoluteUrlForHost(request.url, host, session ? "/access-denied" : "/login")
      : request.nextUrl.clone();
    url.pathname = session ? "/access-denied" : "/login";
    url.search = session ? `?area=${guard.area}` : `?next=${encodeURIComponent(pathname)}`;
    const response = NextResponse.redirect(url);
    Object.entries(responseHeaders).forEach(([key, value]) => response.headers.set(key, value));
    return response;
  }

  const response = NextResponse.next();
  Object.entries(responseHeaders).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt|xml)$).*)"],
};
