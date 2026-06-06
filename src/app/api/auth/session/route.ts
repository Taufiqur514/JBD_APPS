import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get("jbd_session")?.value);
  return NextResponse.json({
    authenticated: Boolean(session),
    role: session?.role ?? null,
    userId: session?.userId ?? null,
  });
}
