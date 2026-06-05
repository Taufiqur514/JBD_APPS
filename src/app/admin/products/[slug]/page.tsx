import { featuredProducts } from "@/lib/prototype-data";
import { AdminProductForm } from "../new/product-form";

export function generateStaticParams() {
  return featuredProducts.map((product) => ({ slug: product.slug }));
}

export default async function EditAdminProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <AdminProductForm mode="edit" slug={slug} />;
}
