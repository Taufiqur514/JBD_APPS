import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { invalidateMvpCache } from "@/lib/mvp-store";
import {
  getPublicStorageUrl,
  getSupabaseAdminClient,
  queryPostgres,
} from "@/lib/supabase-server";
import { redirectResponse } from "@/lib/redirect-response";

const allowedContentTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const allowedTypes = new Set(["image", "recipe", "banner", "video", "product-video"]);
const allowedStatuses = new Set(["draft", "scheduled", "published"]);
const maxFileSize = 100 * 1024 * 1024;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function safeFileName(value: string) {
  const extension = value.includes(".") ? `.${value.split(".").pop()?.toLowerCase()}` : "";
  const baseName = slugify(value.replace(/\.[^.]+$/, "")) || "media";
  return `${baseName}${extension}`;
}

function keywordList(value: string) {
  return [...new Set(value.split(/[,\s]+/).map((item) => item.trim().toLowerCase()).filter(Boolean))].slice(0, 20);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get("jbd_session")?.value);
  if (!session || !["admin", "seller"].includes(session.role)) {
    return new Response("Akses upload hanya untuk Admin Commerce.", { status: 403 });
  }

  const formData = await request.formData();
  const requestedType = String(formData.get("type") ?? "recipe");
  const requestedStatus = String(formData.get("status") ?? "draft");
  const type = allowedTypes.has(requestedType) ? requestedType : "recipe";
  const status = allowedStatuses.has(requestedStatus) ? requestedStatus : "draft";
  const title = String(formData.get("title") ?? "").trim();
  const placement = String(formData.get("placement") ?? "Live/Reel + Resep").trim();
  const productSlug = String(formData.get("productSlug") ?? "").trim();
  const keyword = String(formData.get("keyword") ?? title).trim();
  const caption = String(formData.get("caption") ?? "").trim();
  const uploadedMedia = formData.get("media");
  const externalMediaUrl = String(formData.get("mediaUrl") ?? "").trim();

  if (!title) return new Response("Judul konten wajib diisi.", { status: 400 });
  if (externalMediaUrl && !externalMediaUrl.startsWith("https://")) {
    return new Response("URL media harus menggunakan HTTPS.", { status: 400 });
  }

  const contentSlug = `${slugify(title)}-${Date.now()}`;
  const storageBucket = "commerce-media";
  let storagePath: string | undefined;
  let mediaUrl = externalMediaUrl || undefined;
  let mimeType: string | undefined;
  let fileSize: number | undefined;

  if (uploadedMedia instanceof File && uploadedMedia.size > 0) {
    if (!allowedContentTypes.has(uploadedMedia.type)) {
      return new Response("Format file tidak didukung. Gunakan JPG, PNG, WebP, AVIF, MP4, WebM, atau MOV.", { status: 415 });
    }
    if (uploadedMedia.size > maxFileSize) {
      return new Response("Ukuran media maksimal 100 MB.", { status: 413 });
    }

    mimeType = uploadedMedia.type;
    fileSize = uploadedMedia.size;
    const folder = mimeType.startsWith("video/") ? "videos" : "images";
    const date = new Date();
    storagePath = `${folder}/${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${randomUUID()}-${safeFileName(uploadedMedia.name)}`;

    let supabase;
    try {
      supabase = getSupabaseAdminClient();
    } catch (error) {
      return new Response(error instanceof Error ? error.message : "Secret key Supabase belum tersedia.", { status: 503 });
    }

    const { error } = await supabase.storage
      .from(storageBucket)
      .upload(storagePath, uploadedMedia, {
        contentType: uploadedMedia.type,
        cacheControl: "31536000",
        upsert: false,
      });
    if (error) return new Response(`Upload Supabase gagal: ${error.message}`, { status: 502 });
    mediaUrl = getPublicStorageUrl(storagePath, storageBucket);
  }

  const databaseType = type === "product-video" ? "product_video" : type;
  const publishedAt = status === "published" ? new Date().toISOString() : null;
  const keywords = keywordList(keyword);

  try {
    const inserted = await queryPostgres<{ id: string }>(
      `insert into public.content_assets (
        title, slug, type, status, placement, product_id, product_slug,
        storage_bucket, storage_path, media_url, mime_type, file_size,
        caption, keywords, published_at
      )
      values (
        $1, $2, $3::public.content_type, $4::public.publish_status, $5,
        (select id from public.products where slug = $6 limit 1), $6,
        $7, $8, $9, $10, $11, $12, $13::text[], $14
      )
      returning id`,
      [
        title,
        contentSlug,
        databaseType,
        status,
        placement,
        productSlug || null,
        storageBucket,
        storagePath ?? null,
        mediaUrl ?? null,
        mimeType ?? null,
        fileSize ?? null,
        caption,
        keywords,
        publishedAt,
      ],
    );

    if (type === "recipe") {
      await queryPostgres(
        `insert into public.recipes (
          title, slug, product_id, product_slug, content_asset_id,
          description, ingredients, steps, preparation_minutes,
          keywords, status, published_at
        )
        values (
          $1, $2,
          (select id from public.products where slug = $3 limit 1), $3, $4,
          $5, '[]'::jsonb, '[]'::jsonb, 3, $6::text[],
          $7::public.publish_status, $8
        )`,
        [title, contentSlug, productSlug || null, inserted.rows[0].id, caption, keywords, status, publishedAt],
      );
    }
  } catch (error) {
    if (storagePath) {
      await getSupabaseAdminClient().storage.from(storageBucket).remove([storagePath]).catch(() => undefined);
    }
    console.error("Failed to publish content", error);
    return new Response("Metadata konten gagal disimpan ke PostgreSQL.", { status: 500 });
  }

  invalidateMvpCache();
  return redirectResponse("/admin/assets?published=1", request);
}
