import { getDb, demoUserId } from "@/lib/db";
import { ensureSeed, trackEvent } from "@/lib/mvp-store";
import { redirectResponse } from "@/lib/redirect-response";

type CartItem = { productSlug: string; qty: number; variant: string; note: string };

export async function POST(request: Request) {
  await ensureSeed();
  const formData = await request.formData();
  const slug = String(formData.get("slug") ?? "");
  const action = String(formData.get("action") ?? "inc");
  const db = await getDb();
  const cart = await db.collection<{ items?: CartItem[] }>("carts").findOne({ userId: demoUserId, status: "active" });

  if (cart && slug) {
    if (action === "remove") {
      await db
        .collection<{ items: CartItem[] }>("carts")
        .updateOne({ _id: cart._id }, { $pull: { items: { productSlug: slug } }, $set: { updatedAt: new Date().toISOString() } });
    }

    if (action === "inc") {
      await db.collection("carts").updateOne(
        { _id: cart._id, "items.productSlug": slug },
        { $inc: { "items.$.qty": 1 }, $set: { updatedAt: new Date().toISOString() } },
      );
    }

    if (action === "dec") {
      const item = cart.items?.find((entry) => entry.productSlug === slug);
      if ((item?.qty ?? 0) <= 1) {
        await db
          .collection<{ items: CartItem[] }>("carts")
          .updateOne({ _id: cart._id }, { $pull: { items: { productSlug: slug } }, $set: { updatedAt: new Date().toISOString() } });
      } else {
        await db.collection("carts").updateOne(
          { _id: cart._id, "items.productSlug": slug },
          { $inc: { "items.$.qty": -1 }, $set: { updatedAt: new Date().toISOString() } },
        );
      }
    }
  }

  await trackEvent("cart_update", demoUserId, "storefront", undefined, { product: slug, action });
  return redirectResponse("/storefront/cart", request);
}
