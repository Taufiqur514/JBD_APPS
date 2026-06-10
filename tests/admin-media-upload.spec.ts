import { expect, test } from "@playwright/test";

test.use({ channel: "msedge", viewport: { width: 720, height: 900 } });

test("admin product media upload renders image and video previews", async ({ page }) => {
  await page.goto("http://127.0.0.1:3001/login", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Masuk sebagai Admin Commerce" }).click();
  await page.waitForURL("**/admin", { waitUntil: "domcontentloaded" });
  await page.goto("http://127.0.0.1:3001/admin/products/bubuk-minuman-premium-taro-jakarta-bubble-drink-bpom-halal?tab=media", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-product-image-input]")).toHaveAttribute("data-media-ready", "true");
  await expect(page.locator("[data-product-video-input]")).toHaveAttribute("data-media-ready", "true");
  const initialImageCount = await page.locator("[data-product-image-slots] img").count();

  await page.locator("[data-product-image-input]").setInputFiles([
    "C:/Users/LENOVO/Downloads/JBD Taro Embossed Logo Packaging.jpg",
    "C:/Users/LENOVO/Downloads/LupLup Label Taro Dengan Elemen Dekoratif.png",
  ]);

  if (initialImageCount < 10) {
    await expect.poll(async () => page.locator("[data-product-image-slots] img").count()).toBeGreaterThan(initialImageCount);
  }
  await expect.poll(async () => page.locator("[data-product-image-slots] img").count()).toBeLessThanOrEqual(10);

  await page.locator("[data-product-video-input]").setInputFiles("C:/Users/LENOVO/Downloads/4.4 LEBARAN SALE .mp4");

  await expect(page.locator("[data-product-video-preview] video")).toHaveCount(1);
  await expect(page.getByText("Media tersimpan otomatis")).toBeVisible({ timeout: 20_000 });
});
