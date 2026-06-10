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

export default async function StorefrontLivePage() {
  const [assets, recipes] = await Promise.all([getAssets(), getRecipes()]);
  const feed: ReelItem[] = [
    ...assets.filter((asset) => asset.type !== "recipe").map((asset, index) => ({
      id: String(asset.id ?? `asset-${index}`),
      title: String(asset.title),
      subtitle: String(asset.placement ?? "Konten JBD"),
      tag: String(asset.type).toUpperCase(),
      href: asset.type === "banner" ? "/storefront" : `/storefront/products/${asset.productSlug ?? "chocolate-premium-500g"}`,
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
