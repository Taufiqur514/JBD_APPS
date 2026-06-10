import { getDb, demoUserId } from "@/lib/db";
import { ensureSeed, invalidateMvpCache } from "@/lib/mvp-store";
import { addProductionAddress } from "@/lib/production-commerce";
import { redirectResponse } from "@/lib/redirect-response";
import { isSupabaseConfigured } from "@/lib/supabase-server";

export async function POST(request: Request) {
  await ensureSeed();
  const formData = await request.formData();
  if (isSupabaseConfigured()) {
    await addProductionAddress(formData);
    invalidateMvpCache();
    return redirectResponse("/storefront/profile/addresses", request);
  }
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (name && phone && address) {
    const db = await getDb();
    await db.collection("addresses").insertOne({
      id: `addr-${Date.now()}`,
      userId: demoUserId,
      name,
      phone,
      address: city ? `${address}, ${city}` : address,
      note,
      primary: false,
      createdAt: new Date().toISOString(),
    });
    invalidateMvpCache();
  }

  return redirectResponse("/storefront/profile/addresses", request);
}
