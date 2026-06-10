import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { verifySessionToken } from "@/lib/auth";
import { createProductCategory, removeProductCategory, renameProductCategory } from "@/lib/mvp-store";
import { redirectResponse } from "@/lib/redirect-response";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get("jbd_session")?.value);
  if (!session || !["admin", "seller"].includes(session.role)) {
    return new Response("Akses kategori hanya untuk Admin Commerce.", { status: 403 });
  }

  const formData = await request.formData();
  const action = String(formData.get("action") ?? "save");
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const back = String(formData.get("back") ?? "/admin/products/categories");

  if (action === "delete") {
    if (!categoryId) return new Response("ID kategori wajib diisi.", { status: 400 });
    try {
      await removeProductCategory(categoryId);
    } catch (error) {
      return new Response(error instanceof Error ? error.message : "Kategori gagal dihapus.", { status: 409 });
    }
  } else if (categoryId) {
    if (!name) return new Response("Nama kategori wajib diisi.", { status: 400 });
    await renameProductCategory(categoryId, name);
  } else {
    if (!name) return new Response("Nama kategori wajib diisi.", { status: 400 });
    await createProductCategory(name);
  }

  revalidatePath("/admin/products");
  revalidatePath("/admin/products/categories");
  revalidatePath("/storefront");
  revalidatePath("/storefront/search");
  revalidatePath("/storefront/recipes");
  return redirectResponse(back, request);
}
