import SaleClient from "./saleClient";
import { getBrands } from "@/services/api/brands.services";
import { getCategories } from "@/services/api/category.services";
import { getSale } from "@/services/api/promo.services";
import { getApi } from "@/services/api/client";

export const metadata = {
  title: "Sale",

  description:
    "Waktunya checkout! Nikmati promo dan diskon makeup dan skincare di toko kosmetik Abby n Bev. Produk favorit dengan harga lebih hemat, tapi tetap sesuai kebutuhan kulit kamu.",

  openGraph: {
    title: "Abby n Bev - Situs Belanja Online Makeup dan Skincare Terbaik Di Indonesia",
    description:
      "Waktunya checkout! Nikmati promo dan diskon makeup dan skincare di toko kosmetik Abby n Bev. Produk favorit dengan harga lebih hemat, tapi tetap sesuai kebutuhan kulit kamu.",
    siteName: "Abby n Bev",
    type: "website",
  },
};

export default async function SalePage() {
  const [flashSaleRes, saleRes, brandRes, categoriesRes] = await Promise.all([
    getApi("/flashsale"),
    getSale(),
    getBrands(),
    getCategories(),
  ]);

  const flashSale = flashSaleRes?.serve ?? flashSaleRes ?? null;

  const saleItems =
    Array.isArray(saleRes?.list) && saleRes.list.length
      ? saleRes.list
      : saleRes?.serve
        ? [saleRes.serve]
        : Array.isArray(saleRes?.data)
          ? saleRes.data
          : [];

  const saleProducts = saleItems.flatMap((sale) =>
    Array.isArray(sale?.products) ? sale.products : []
  );

  const categories = Array.isArray(categoriesRes?.serve)
    ? categoriesRes.serve
    : Array.isArray(categoriesRes?.data)
      ? categoriesRes.data
      : Array.isArray(categoriesRes)
        ? categoriesRes
        : [];

  return (
    <SaleClient
      initialFlashSale={flashSale}
      initialSaleProducts={saleProducts}
      initialBrands={Array.isArray(brandRes?.data) ? brandRes.data : []}
      categories={categories}
    />
  )
}
