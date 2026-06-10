import type { JbdRole } from "@/lib/auth";

export type AppArea = "storefront" | "admin" | "operations" | "insights" | "finance" | "api";

const roleAccess: Record<AppArea, JbdRole[]> = {
  storefront: ["customer", "admin", "seller"],
  admin: ["admin", "seller"],
  operations: ["admin", "warehouse"],
  insights: ["admin", "seller"],
  finance: ["finance"],
  api: ["admin", "seller", "warehouse", "finance", "customer"],
};

export function allowedRolesForArea(area: AppArea) {
  return roleAccess[area];
}

export function securityHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "X-XSS-Protection": "0",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  };
}
