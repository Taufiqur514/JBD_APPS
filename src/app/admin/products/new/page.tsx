import { AdminProductForm } from "./product-form";
import { getProductCategories } from "@/lib/mvp-store";

export default async function NewAdminProductPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const categories = await getProductCategories();
  return <AdminProductForm mode="create" activeTab={params.tab} categoryOptions={categories} />;
}
