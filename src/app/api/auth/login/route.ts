import { cookies } from "next/headers";
import { createSessionToken, type JbdRole } from "@/lib/auth";
import { redirectResponse } from "@/lib/redirect-response";

const roleHome = {
  customer: "/storefront",
  admin: "/admin",
  finance: "/finance",
  warehouse: "/operations",
  seller: "/admin",
} as const;

export async function POST(request: Request) {
  const formData = await request.formData();
  const role = String(formData.get("role") ?? "customer") as JbdRole;
  const userId = String(formData.get("userId") ?? role);
  const cookieStore = await cookies();
  const sessionToken = await createSessionToken(role, userId);
  cookieStore.set("jbd_session", sessionToken, { path: "/", sameSite: "lax", httpOnly: true, maxAge: 8 * 60 * 60 });
  cookieStore.set("jbd_role", role, { path: "/", sameSite: "lax" });
  cookieStore.set("jbd_user", userId, { path: "/", sameSite: "lax" });
  return redirectResponse(roleHome[role] ?? "/storefront", request);
}
