import { PrototypeShell } from "@/components/prototype-shell";
import { CategoryForm } from "../category-form";

export default function NewProductCategoryPage() {
  return (
    <PrototypeShell compact eyebrow="Admin Commerce" title="Tambah Kategori" description="">
      <CategoryForm />
    </PrototypeShell>
  );
}
