import { cartItems, featuredProducts, orderSummary } from "./prototype-data";

export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getProduct(slug: string) {
  return featuredProducts.find((product) => product.slug === slug) ?? featuredProducts[0];
}

export function getCartLines() {
  return cartItems.map((item) => {
    const product = getProduct(item.productSlug);
    return {
      ...item,
      product,
      lineTotal: product.numericPrice * item.qty,
    };
  });
}

export function getOrderSummary() {
  return orderSummary;
}
