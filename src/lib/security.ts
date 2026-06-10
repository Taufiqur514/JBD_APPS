import { cookies, headers } from "next/headers";
import { verifySessionToken, type JbdRole } from "@/lib/auth";
export { allowedRolesForArea, securityHeaders, type AppArea } from "@/lib/security-policy";

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export async function currentSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get("jbd_session")?.value);
}

export async function requireRole(allowed: JbdRole[], message = "Akses tidak diizinkan.") {
  const session = await currentSession();
  if (!session || !allowed.includes(session.role)) {
    return { session: null, response: new Response(message, { status: session ? 403 : 401 }) };
  }
  return { session, response: null };
}

export async function clientFingerprint(scope: string) {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headerStore.get("x-real-ip") || "local";
  const userAgent = headerStore.get("user-agent") || "unknown";
  return `${scope}:${ip}:${userAgent.slice(0, 80)}`;
}

export async function enforceRateLimit({
  scope,
  limit,
  windowMs,
}: {
  scope: string;
  limit: number;
  windowMs: number;
}) {
  const key = await clientFingerprint(scope);
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  if (entry.count >= limit) {
    return new Response("Terlalu banyak request. Coba lagi beberapa saat.", {
      status: 429,
      headers: { "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)) },
    });
  }
  entry.count += 1;
  return null;
}
