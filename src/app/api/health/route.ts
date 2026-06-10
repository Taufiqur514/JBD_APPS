import { isSupabaseConfigured, queryPostgres } from "@/lib/supabase-server";
import { securityHeaders } from "@/lib/security";

export const dynamic = "force-dynamic";

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("health_timeout")), timeoutMs);
    }),
  ]);
}

export async function GET() {
  const startedAt = Date.now();
  let database = "not_configured";
  if (isSupabaseConfigured()) {
    try {
      await withTimeout(queryPostgres("select 1 as ok"), 2500);
      database = "ok";
    } catch {
      database = "error";
    }
  }
  const status = database === "error" ? 503 : 200;
  return Response.json(
    {
      app: "jbd-commerce",
      status: status === 200 ? "ok" : "degraded",
      database,
      storage: process.env.NEXT_PUBLIC_SUPABASE_URL ? "configured" : "not_configured",
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
    },
    { status, headers: securityHeaders() },
  );
}
