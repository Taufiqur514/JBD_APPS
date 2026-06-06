import { featuredProducts } from "@/lib/prototype-data";
import { getProduct } from "@/lib/mvp-store";
import { AdminProductForm } from "../new/product-form";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return featuredProducts.map((product) => ({ slug: product.slug }));
}

export default async function EditAdminProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  return <AdminProductForm mode="edit" slug={slug} initialProduct={JSON.parse(JSON.stringify(product))} />;
}
