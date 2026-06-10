import { cookies } from "next/headers";
import * as XLSX from "xlsx";
import { verifySessionToken } from "@/lib/auth";

export const runtime = "nodejs";

const productHeaders = [
  "sku",
  "nama_produk",
  "slug_opsional",
  "kategori",
  "deskripsi",
  "rasa_taste",
  "komposisi_pisah_koma",
  "cara_penyajian",
  "harga",
  "stok_total",
  "rating_opsional",
  "terjual_opsional",
  "status",
  "variant_1_nama",
  "variant_1_harga",
  "variant_1_berat_gram",
  "variant_1_stok",
  "variant_2_nama",
  "variant_2_harga",
  "variant_2_berat_gram",
  "variant_2_stok",
  "variant_3_nama",
  "variant_3_harga",
  "variant_3_berat_gram",
  "variant_3_stok",
  "variant_4_nama",
  "variant_4_harga",
  "variant_4_berat_gram",
  "variant_4_stok",
  "variant_5_nama",
  "variant_5_harga",
  "variant_5_berat_gram",
  "variant_5_stok",
  ...Array.from({ length: 10 }, (_, index) => `image_${index + 1}_url`),
  ...Array.from({ length: 3 }, (_, index) => `video_${index + 1}_url`),
];

export async function GET() {
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get("jbd_session")?.value);
  if (!session || !["admin", "seller"].includes(session.role)) {
    return new Response("Akses template hanya untuk Admin Commerce.", { status: 403 });
  }

  const workbook = XLSX.utils.book_new();
  const productRows = [
    productHeaders,
    [
      "JBD-CHO-500",
      "JBD Chocolate Premium 500g",
      "jbd-chocolate-premium-500g",
      "Chocolate",
      "Powder drink chocolate premium untuk cafe, booth, reseller, dan distributor.",
      "Dark chocolate, creamy finish",
      "Cocoa powder, creamer, sugar, flavor",
      "Campur 35g powder dengan 150ml air panas, tambah es sesuai kebutuhan.",
      89000,
      120,
      4.9,
      240,
      "published",
      "500g",
      89000,
      500,
      80,
      "1kg",
      168000,
      1000,
      40,
      "Bundle 3 pcs",
      249000,
      1500,
      15,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "https://example.com/jbd-chocolate-cover.jpg",
      "https://example.com/jbd-chocolate-2.jpg",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "https://example.com/jbd-chocolate-reel.mp4",
      "",
      "",
    ],
    [
      "JBD-TAR-500",
      "JBD Taro Signature 500g",
      "",
      "Taro",
      "Powder minuman taro wangi dengan profil creamy untuk menu hot dan iced.",
      "Sweet taro aroma",
      "Taro powder, creamer, sugar",
      "Larutkan 35g powder dengan 150ml air, aduk rata, sajikan.",
      99000,
      90,
      4.8,
      180,
      "published",
      "500g",
      99000,
      500,
      50,
      "1kg",
      188000,
      1000,
      40,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
  ];

  const productSheet = XLSX.utils.aoa_to_sheet(productRows);
  productSheet["!cols"] = productHeaders.map((header) => ({
    wch: Math.max(14, Math.min(32, header.length + 2)),
  }));
  XLSX.utils.book_append_sheet(workbook, productSheet, "Produk");

  const instructionRows = [
    ["Instruksi Bulk Upload Produk JBD"],
    [""],
    ["1. Isi data pada sheet Produk. Baris pertama adalah header dan tidak diimpor."],
    ["2. Kolom wajib: nama_produk, kategori, harga, stok_total atau stok varian."],
    ["3. Jika slug_opsional kosong, sistem membuat slug otomatis dari nama produk."],
    ["4. Jika sku kosong, sistem membuat SKU otomatis dari slug."],
    ["5. Kategori baru otomatis dibuat dan langsung aktif di storefront/admin."],
    ["6. Jika varian diisi, stok_total dihitung dari total stok setiap varian."],
    ["7. image_1_url menjadi cover produk; image_2_url sampai image_10_url menjadi carousel."],
    ["8. video_1_url sampai video_3_url masuk ke PDP dan Live/Reel sebagai product video."],
    ["9. Status yang diterima: published, draft, inactive. Selain itu dianggap published."],
    ["10. Maksimal 10.000 baris per upload."],
  ];
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(instructionRows), "Instruksi");

  const referenceRows = [
    ["status", "arti"],
    ["published", "Produk aktif di storefront"],
    ["draft", "Produk tersimpan namun tidak aktif"],
    ["inactive", "Produk nonaktif"],
    [""],
    ["contoh_kategori"],
    ["Chocolate"],
    ["Thai Tea"],
    ["Matcha"],
    ["Taro"],
    ["Coffee"],
    ["Smoothies"],
  ];
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(referenceRows), "Referensi");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const body = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
  return new Response(body, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="template-bulk-upload-produk-jbd.xlsx"',
    },
  });
}
