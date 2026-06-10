import { expect, test } from "@playwright/test";

const productSlug = "bubuk-minuman-premium-taro-jakarta-bubble-drink-bpom-halal";

test.use({ channel: "msedge", viewport: { width: 720, height: 900 } });

test("saved product media appears in admin catalog and storefront detail", async ({ page }) => {
  await page.goto("http://127.0.0.1:3001/login", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Masuk sebagai Admin Commerce" }).click();
  await page.waitForURL("**/admin", { waitUntil: "domcontentloaded" });
  await page.goto("http://127.0.0.1:3001/admin/products", { waitUntil: "domcontentloaded" });
  const adminProductRow = page.locator(`a[href="/admin/products/${productSlug}"]`);
  await expect(adminProductRow.locator(`img[src*="${productSlug}"]`)).toHaveCount(1);

  await page.goto(`http://127.0.0.1:3001/storefront/products/${productSlug}`, { waitUntil: "domcontentloaded" });
  await expect(page.locator(`img[src*="${productSlug}"]`).first()).toBeVisible();
  await page.locator('[data-product-media-kind="video"]').first().click();
  await expect(page.locator("[data-product-media-video]")).toBeVisible();
});
