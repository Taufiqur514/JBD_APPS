import { PrototypeShell } from "@/components/prototype-shell";
import { ReelFeed, type ReelItem } from "@/components/reel-feed";
import { getAssets, getRecipes } from "@/lib/mvp-store";

export const dynamic = "force-dynamic";

function isVideoMedia(value?: string, mimeType?: string) {
  const media = value?.toLowerCase() ?? "";
  return Boolean(
    mimeType?.startsWith("video/") ||
      media.includes(".mp4") ||
      media.includes(".webm") ||
      media.includes(".mov") ||
      media.includes("video"),
  );
}

function isDemoPlaceholder(value?: string) {
  if (!value) return true;
  return value.includes("example.com/") || value.includes("placeholder");
}

export default async function StorefrontLivePage() {
  const [assets, recipes] = await Promise.all([getAssets(), getRecipes()]);
  const reelAssets = assets.filter((asset) => {
    const mediaUrl = typeof asset.mediaUrl === "string" ? asset.mediaUrl : undefined;
    if (asset.status === "draft" || isDemoPlaceholder(mediaUrl)) return false;
    if (asset.type === "banner" || asset.type === "recipe") return false;
    if (asset.type === "product-video") return Boolean(mediaUrl && isVideoMedia(mediaUrl, asset.mimeType));
    if (asset.type === "video") return Boolean(mediaUrl && isVideoMedia(mediaUrl, asset.mimeType));
    if (asset.type === "image") return Boolean(mediaUrl);
    return false;
  });
  const feed: ReelItem[] = [
    ...reelAssets.map((asset, index) => ({
      id: String(asset.id ?? `asset-${index}`),
      title: String(asset.title),
      subtitle: asset.type === "product-video" ? "Video dari detail produk" : String(asset.placement ?? "Konten manual admin"),
      tag: String(asset.type).toUpperCase(),
      href: `/storefront/products/${asset.productSlug ?? "chocolate-premium-500g"}`,
      mediaUrl: typeof asset.mediaUrl === "string" ? asset.mediaUrl : undefined,
      mediaType: isVideoMedia(typeof asset.mediaUrl === "string" ? asset.mediaUrl : undefined, asset.mimeType) ? "video" as const : "image" as const,
    })),
    ...recipes.map((recipe, index) => ({
      id: `recipe-${index}-${recipe.productSlug}`,
      title: recipe.title,
      subtitle: recipe.product ?? recipe.keyword,
      tag: "RESEP",
      href: `/storefront/products/${recipe.productSlug}`,
      mediaUrl: recipe.mediaUrl,
      mediaType: recipe.mediaUrl ? (isVideoMedia(recipe.mediaUrl, recipe.mimeType) ? "video" as const : "image" as const) : "recipe" as const,
    })),
  ];

  return (
    <PrototypeShell compact eyebrow="Live & Reel" title="Feed Konten JBD" description="">
      <ReelFeed items={feed} />
    </PrototypeShell>
  );
}
