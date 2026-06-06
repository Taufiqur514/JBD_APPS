import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getDb } from "@/lib/db";
import { ensureSeed } from "@/lib/mvp-store";
import { redirectResponse } from "@/lib/redirect-response";

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function POST(request: Request) {
  await ensureSeed();
  const formData = await request.formData();
  const db = await getDb();
  const type = String(formData.get("type") ?? "recipe");
  const title = String(formData.get("title") ?? "Resep Baru JBD");
  const placement = String(formData.get("placement") ?? "Live/Reel + Resep");
  const productSlug = String(formData.get("productSlug") ?? "chocolate-premium-500g");
  const keyword = String(formData.get("keyword") ?? title);
  const uploadedMedia = formData.get("media");
  let mediaUrl = String(formData.get("mediaUrl") ?? "").trim();
  const now = new Date().toISOString();

  if (uploadedMedia instanceof File && uploadedMedia.size > 0) {
    if (uploadedMedia.size > 50 * 1024 * 1024) {
      return new Response("Ukuran media maksimal 50 MB.", { status: 413 });
    }
    const extension = path.extname(uploadedMedia.name).toLowerCase();
    const safeName = `${Date.now()}-${slugify(path.basename(uploadedMedia.name, extension))}${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, safeName), Buffer.from(await uploadedMedia.arrayBuffer()));
    mediaUrl = `/uploads/${safeName}`;
  }

  await db.collection("assets").insertOne({
    id: `${type}-${slugify(title)}-${Date.now()}`,
    type,
    title,
    placement,
    productSlug,
    mediaUrl: mediaUrl || undefined,
    status: "published",
    createdAt: now,
  });

  if (type === "recipe") {
    await db.collection("recipes").insertOne({
      title,
      keyword,
      productSlug,
      product: title.includes("Matcha") ? "JBD Matcha Latte 1kg" : title.includes("Taro") ? "JBD Taro Signature 500g" : "JBD Chocolate Premium 500g",
      time: "3 menit",
      margin: "Admin publish",
      tone: "bg-emerald-100",
      type: "recipe",
      status: "published",
      createdAt: now,
    });
  }

  return redirectResponse("/admin/assets", request);
}
