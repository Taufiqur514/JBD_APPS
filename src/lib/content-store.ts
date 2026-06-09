import { queryPostgres } from "./supabase-server";

export type ProductionContentAsset = {
  id: string;
  title: string;
  slug: string;
  type: "image" | "banner" | "video" | "product_video" | "recipe";
  status: "draft" | "scheduled" | "published" | "archived";
  placement: string;
  productSlug?: string;
  storageBucket: string;
  storagePath?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  mimeType?: string;
  fileSize?: number;
  caption: string;
  keywords: string[];
  publishedAt?: string;
  createdAt: string;
};

export type ProductionRecipe = {
  id: string;
  title: string;
  slug: string;
  productSlug?: string;
  mediaUrl?: string;
  description: string;
  ingredients: string[];
  steps: string[];
  preparationMinutes: number;
  keywords: string[];
  status: "draft" | "scheduled" | "published" | "archived";
  publishedAt?: string;
  createdAt: string;
};

type ContentRow = {
  id: string;
  title: string;
  slug: string;
  type: ProductionContentAsset["type"];
  status: ProductionContentAsset["status"];
  placement: string;
  product_slug: string | null;
  storage_bucket: string;
  storage_path: string | null;
  media_url: string | null;
  thumbnail_url: string | null;
  mime_type: string | null;
  file_size: string | null;
  caption: string;
  keywords: string[];
  published_at: Date | null;
  created_at: Date;
};

type RecipeRow = {
  id: string;
  title: string;
  slug: string;
  product_slug: string | null;
  media_url: string | null;
  description: string;
  ingredients: unknown;
  steps: unknown;
  preparation_minutes: number;
  keywords: string[];
  status: ProductionRecipe["status"];
  published_at: Date | null;
  created_at: Date;
};

function stringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String) : [];
}

export async function listContentAssets(options: { publishedOnly?: boolean } = {}) {
  const publishedClause = options.publishedOnly ? "where status = 'published'" : "";
  const result = await queryPostgres<ContentRow>(
    `select id, title, slug, type, status, placement, product_slug, storage_bucket,
      storage_path, media_url, thumbnail_url, mime_type, file_size, caption,
      keywords, published_at, created_at
     from public.content_assets
     ${publishedClause}
     order by coalesce(published_at, created_at) desc`,
  );
  return result.rows.map(
    (row): ProductionContentAsset => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      type: row.type,
      status: row.status,
      placement: row.placement,
      productSlug: row.product_slug ?? undefined,
      storageBucket: row.storage_bucket,
      storagePath: row.storage_path ?? undefined,
      mediaUrl: row.media_url ?? undefined,
      thumbnailUrl: row.thumbnail_url ?? undefined,
      mimeType: row.mime_type ?? undefined,
      fileSize: row.file_size ? Number(row.file_size) : undefined,
      caption: row.caption,
      keywords: row.keywords ?? [],
      publishedAt: row.published_at?.toISOString(),
      createdAt: row.created_at.toISOString(),
    }),
  );
}

export async function listProductionRecipes(options: { publishedOnly?: boolean } = {}) {
  const publishedClause = options.publishedOnly ? "where recipes.status = 'published'" : "";
  const result = await queryPostgres<RecipeRow>(
    `select recipes.id, recipes.title, recipes.slug, recipes.product_slug,
      content_assets.media_url, recipes.description, recipes.ingredients, recipes.steps,
      recipes.preparation_minutes, recipes.keywords, recipes.status,
      recipes.published_at, recipes.created_at
     from public.recipes
     left join public.content_assets on content_assets.id = recipes.content_asset_id
     ${publishedClause}
     order by coalesce(recipes.published_at, recipes.created_at) desc`,
  );
  return result.rows.map(
    (row): ProductionRecipe => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      productSlug: row.product_slug ?? undefined,
      mediaUrl: row.media_url ?? undefined,
      description: row.description,
      ingredients: stringArray(row.ingredients),
      steps: stringArray(row.steps),
      preparationMinutes: row.preparation_minutes,
      keywords: row.keywords ?? [],
      status: row.status,
      publishedAt: row.published_at?.toISOString(),
      createdAt: row.created_at.toISOString(),
    }),
  );
}
