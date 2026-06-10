import { notFound } from "next/navigation";
import { PrototypeShell } from "@/components/prototype-shell";
import { getProductCategoryRows } from "@/lib/mvp-store";
import { CategoryForm } from "../category-form";

export const dynamic = "force-dynamic";

export default async function EditProductCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categories = await getProductCategoryRows();
  const category = categories.find((item) => item.id === id);
  if (!category) notFound();
  return (
    <PrototypeShell compact eyebrow="Admin Commerce" title="Edit Kategori" description="">
      <CategoryForm category={category} />
    </PrototypeShell>
  );
}
