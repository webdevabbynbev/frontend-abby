import BestSellerClient from "./bestSellerClient";
import { getBrands } from "@/services/api/brands.services";
import { getCategories } from "@/services/api/category.services";
import { getProducts } from "@/services/api/product.services";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Best Seller",

  description:
    "Ini dia produk best seller Abby n Bev yang paling sering diburu. Makeup dan skincare favorit yang sudah lolos kurasi beauty store Abby n Bev dan jadi andalan banyak orang.",

  openGraph: {
    title: "Abby n Bev - Situs Belanja Online Makeup dan Skincare Terbaik Di Indonesia",
    description:
      "Ini dia produk best seller Abby n Bev yang paling sering diburu. Makeup dan skincare favorit yang sudah lolos kurasi beauty store Abby n Bev dan jadi andalan banyak orang.",
    siteName: "Abby n Bev",
    type: "website",
  },
};

export default async function BestSeller({ searchParams }) {
  const params = await searchParams;
  const currentPage = Number(params?.page || 1);
  const perPage = Number(params?.per_page || 20);
  const search = String(params?.q || "").trim();

  const [productsRes, brandsRes, categoriesRes] = await Promise.all([
    getProducts({
      page: currentPage,
      per_page: perPage,
      name: search,
    }),
    getBrands(),
    getCategories(),
  ]);

  const categories = Array.isArray(categoriesRes?.serve)
    ? categoriesRes.serve
    : Array.isArray(categoriesRes?.data)
      ? categoriesRes.data
      : Array.isArray(categoriesRes)
        ? categoriesRes
        : [];

  return (
    <BestSellerClient
      products={productsRes?.data || []}
      meta={productsRes?.meta || {}}
      brands={brandsRes?.data || []}
      categories={categories}
      currentPage={currentPage}
      search={search}
      itemsPerPage={perPage}
    />
  );
}
