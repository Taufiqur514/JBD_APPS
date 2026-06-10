import { featuredProducts } from "@/lib/prototype-data";
import { getProduct, getProductCategories } from "@/lib/mvp-store";
import { AdminProductForm } from "../new/product-form";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return featuredProducts.map((product) => ({ slug: product.slug }));
}

export default async function EditAdminProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const [product, categories] = await Promise.all([getProduct(slug), getProductCategories()]);
  return <AdminProductForm mode="edit" slug={slug} activeTab={query.tab} initialProduct={JSON.parse(JSON.stringify(product))} categoryOptions={categories} />;
}
