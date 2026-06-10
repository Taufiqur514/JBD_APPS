import { cookies } from "next/headers";
import { createSessionToken, type JbdRole } from "@/lib/auth";
import { absoluteUrlForHost, hostFromHeaders, preferredHostForRole, roleHomePath, sameRegistrableCookieDomain } from "@/lib/domain-routing";

export async function POST(request: Request) {
  const formData = await request.formData();
  const role = String(formData.get("role") ?? "customer") as JbdRole;
  const userId = String(formData.get("userId") ?? role);
  const host = hostFromHeaders(request.headers, request.url);
  const cookieStore = await cookies();
  const sessionToken = await createSessionToken(role, userId);
  const secure = process.env.NODE_ENV === "production";
  const domain = sameRegistrableCookieDomain(host);
  const cookieOptions = { path: "/", sameSite: "lax" as const, httpOnly: true, secure, maxAge: 8 * 60 * 60, ...(domain ? { domain } : {}) };
  cookieStore.set("jbd_session", sessionToken, cookieOptions);
  cookieStore.set("jbd_role", role, cookieOptions);
  cookieStore.set("jbd_user", userId, cookieOptions);

  const targetHost = preferredHostForRole(role, host);
  const target = absoluteUrlForHost(request.url, targetHost, roleHomePath(role));
  return new Response(null, { status: 303, headers: { Location: target.toString() } });
}
