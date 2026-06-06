import { getDb, demoUserId } from "@/lib/db";
import { ensureSeed, trackEvent } from "@/lib/mvp-store";
import { redirectResponse } from "@/lib/redirect-response";

export async function POST(request: Request) {
  await ensureSeed();
  const formData = await request.formData();
  const orderId = String(formData.get("orderId") ?? "review-demo");
  const productSlug = String(formData.get("productSlug") ?? "chocolate-premium-500g");
  const rating = Number(formData.get("rating") ?? 5);
  const text = String(formData.get("text") ?? "").trim();
  const now = new Date().toISOString();
  const db = await getDb();

  await db.collection("reviews").insertOne({
    id: `REV-${Date.now()}`,
    orderId,
    userId: demoUserId,
    productSlug,
    rating,
    text,
    photoStatus: formData.get("photo") ? "uploaded" : "none",
    createdAt: now,
  });
  await db.collection("crmProfiles").updateOne({ userId: demoUserId }, { $inc: { points: 50 } });
  await db.collection("notifications").insertOne({
    id: `NTF-${Date.now()}-REVIEW`,
    channel: "in-app",
    recipient: demoUserId,
    title: "+50 poin dari review",
    template: "review_reward",
    status: "queued",
    relatedId: orderId,
    createdAt: now,
  });
  await trackEvent("review_submitted", demoUserId, "storefront", rating, { orderId, productSlug });

  return redirectResponse("/storefront/loyalty", request);
}
