import HomeClient from "./homeClient";
import { getBanners } from "@/services/api/banners";
import { getCategories } from "@/services/api/category.services";
import { getProducts } from "@/services/api/product.services";
import { getApi } from "@/services/api/client";

export const metadata = {
  title: "Abby n Bev | Situs Belanja Online Makeup dan Skincare Terbaik Di Indonesia",

  description:
    "Abby n Bev itu gak cuma beauty store dan toko kosmetik yang jual makeup dan skincare. Di sini kamu bisa konsultasi dengan AI Beauty Advisor gratis, jadi belanja nggak asal viral—lebih tepat & aman buat kulit kamu.",

  openGraph: {
    title: "Abby n Bev - Situs Belanja Online Makeup dan Skincare Terbaik Di Indonesia",
    description:
      "Abby n Bev bukan sekadar beauty store. Konsultasi gratis dengan AI Beauty Advisor untuk menemukan makeup dan skincare yang sesuai dengan kondisi kulit kamu.",
    siteName: "Abby n Bev",
    type: "website",
  },
};

const attachApiExtraDiscounts = (normalizedItems, rawRows) => {
  if (!Array.isArray(normalizedItems)) return [];

  const extraById = new Map();
  if (Array.isArray(rawRows)) {
    rawRows.forEach((row) => {
      const source = row?.product ?? row;
      const key = Number(source?.id ?? source?.productId ?? source?._id ?? 0);
      if (!key) return;
      const extra =
        row?.product?.extraDiscount ??
        row?.extraDiscount ??
        source?.extraDiscount ??
        null;
      if (extra) {
        extraById.set(key, extra);
      }
    });
  }

  return normalizedItems.map((item) => {
    const key = Number(item?.id ?? item?.productId ?? item?._id ?? 0);
    const extra = extraById.get(key) ?? item?.extraDiscount ?? null;
    return extra ? { ...item, extraDiscount: extra } : item;
  });
};

export default async function Home() {
  const [bannersRes, categoriesRes, productsRes, bestSellersRes, flashSaleRes] =
    await Promise.all([
      getBanners(),
      getCategories(),
      getProducts({
        page: 1,
        per_page: 30,
        sort_by: "created_at",
        order: "desc",
      }),
      getProducts({
        page: 1,
        per_page: 15,
        sort_by: "sold",
        order: "desc",
      }),
      getApi("/flashsale"),
    ]);

  const banners = Array.isArray(bannersRes?.serve)
    ? bannersRes.serve
    : bannersRes?.serve?.data || [];

  const categoriesRaw = Array.isArray(categoriesRes?.serve)
    ? categoriesRes.serve
    : Array.isArray(categoriesRes?.serve?.data)
      ? categoriesRes.serve.data
      : Array.isArray(categoriesRes?.data)
        ? categoriesRes.data
        : Array.isArray(categoriesRes)
          ? categoriesRes
          : [];

  const categories = categoriesRaw.filter(
    (c) => c.level === 1 && (c.parentId == null || c.parent_id == null),
  );

  const products = attachApiExtraDiscounts(
    productsRes?.data || [],
    productsRes?.dataRaw || [],
  );

  const bestSellers = attachApiExtraDiscounts(
    bestSellersRes?.data || [],
    bestSellersRes?.dataRaw || [],
  );

  const flashSaleData = flashSaleRes?.serve ?? flashSaleRes;
  const flashSaleItems =
    flashSaleData?.products ??
    flashSaleData?.items ??
    flashSaleData?.list ??
    flashSaleData?.data ??
    [];

  return (
    <HomeClient
      banners={banners}
      categories={categories}
      products={products}
      bestSellers={bestSellers}
      flashSaleItems={Array.isArray(flashSaleItems) ? flashSaleItems : []}
    />
  );
}
