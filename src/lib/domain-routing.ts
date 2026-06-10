import type { JbdRole } from "@/lib/auth";

export const productionDomains = {
  storefrontWeb: "shop.jbd.co.id",
  storefrontApp: "app.ptskb.co.id",
  adminWeb: "admin.ptskb.co.id",
  adminApp: "admin-app.ptskb.co.id",
  api: "api.ptskb.co.id",
  media: "media.ptskb.co.id",
} as const;

const storefrontHosts = new Set<string>([productionDomains.storefrontWeb, productionDomains.storefrontApp]);
const adminHosts = new Set<string>([productionDomains.adminWeb, productionDomains.adminApp]);
const apiHosts = new Set<string>([productionDomains.api]);
const mediaHosts = new Set<string>([productionDomains.media]);

export const storefrontAliasPrefixes = [
  "/cart",
  "/chat",
  "/checkout",
  "/live",
  "/loyalty",
  "/notifications",
  "/orders",
  "/payment",
  "/products",
  "/profile",
  "/recipes",
  "/review",
  "/search",
  "/success",
] as const;

export const consolePrefixes = ["/admin", "/operations", "/insights", "/finance"] as const;

export function normalizedHost(value?: string | null) {
  return String(value ?? "")
    .split(",")[0]
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "");
}

export function hostFromHeaders(headers: Headers, fallbackUrl: string) {
  const forwardedHost = headers.get("x-forwarded-host");
  const host = headers.get("host");
  return normalizedHost(forwardedHost || host || new URL(fallbackUrl).host);
}

export function isStorefrontHost(host: string) {
  return storefrontHosts.has(normalizedHost(host));
}

export function isAdminHost(host: string) {
  return adminHosts.has(normalizedHost(host));
}

export function isApiHost(host: string) {
  return apiHosts.has(normalizedHost(host));
}

export function isMediaHost(host: string) {
  return mediaHosts.has(normalizedHost(host));
}

export function isProductionSurfaceHost(host: string) {
  const normalized = normalizedHost(host);
  return isStorefrontHost(normalized) || isAdminHost(normalized) || isApiHost(normalized) || isMediaHost(normalized);
}

export function isStorefrontAliasPath(pathname: string) {
  return storefrontAliasPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isConsolePath(pathname: string) {
  return consolePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function stripStorefrontPrefix(pathname: string) {
  if (pathname === "/storefront") return "/";
  if (pathname.startsWith("/storefront/")) return pathname.slice("/storefront".length);
  return pathname;
}

export function storefrontInternalPath(pathname: string) {
  if (pathname === "/") return "/storefront";
  if (pathname === "/frontstore") return "/storefront";
  if (pathname.startsWith("/storefront")) return pathname;
  if (isStorefrontAliasPath(pathname)) return `/storefront${pathname}`;
  return pathname;
}

export function roleHomePath(role: JbdRole) {
  if (role === "customer") return "/";
  if (role === "warehouse") return "/operations";
  if (role === "finance") return "/finance";
  return "/admin";
}

export function preferredHostForRole(role: JbdRole, currentHost?: string) {
  const host = normalizedHost(currentHost);
  if (host && !isProductionSurfaceHost(host)) return host;
  if (role === "customer") {
    return host === productionDomains.storefrontWeb ? productionDomains.storefrontWeb : productionDomains.storefrontApp;
  }
  if (role === "finance" || role === "warehouse" || role === "admin" || role === "seller") {
    return host === productionDomains.adminApp ? productionDomains.adminApp : productionDomains.adminWeb;
  }
  return productionDomains.storefrontApp;
}

export function absoluteUrlForHost(requestUrl: string, host: string, pathname = "/", search = "") {
  const current = new URL(requestUrl);
  const protocol = host.includes("localhost") || host.startsWith("127.") ? current.protocol : "https:";
  const target = new URL(`${protocol}//${host}`);
  target.pathname = pathname;
  target.search = search;
  return target;
}

export function sameRegistrableCookieDomain(host: string) {
  const normalized = normalizedHost(host);
  if (normalized === "ptskb.co.id" || normalized.endsWith(".ptskb.co.id")) return ".ptskb.co.id";
  return undefined;
}
