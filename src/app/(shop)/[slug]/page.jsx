import { getProductByPath } from "@/services/api/product.services";
import ProductDetailClient from "./ProductDetailClient";
import { slugify } from "@/utils";
import { notFound } from "next/navigation";

const norm = (s) => slugify(decodeURIComponent(String(s || "")).trim());

export async function generateMetadata(props) {
  const params = await props.params;
  const slugParam = norm(params.slug);
  
  try {
    const resByPath = await getProductByPath(slugParam);
    const product = resByPath?.data;

    if (!product) return { title: "Produk Tidak Ditemukan | Abby n Bev" };

    return {
      title: `${product.name} | Abby n Bev`,
      description: product.shortDescription || `Beli ${product.name} di Abby n Bev`,
    };
  } catch {
    return { title: "Abby n Bev" };
  }
}

export default async function Page({ params }) {
  const awaitedParams = await params;
  const slugParam = norm(awaitedParams.slug);

  // 1. Ambil data secara spesifik (Server Side)
  const resByPath = await getProductByPath(slugParam);
  const product = resByPath?.data || null;

  // 2. Jika tidak ada, langsung 404 (Jangan lakukan fetch 500 produk di sini)
  if (!product) {
    notFound();
  }

  return (
    <>
      <h1 className="sr-only">{product.name}</h1>
      <ProductDetailClient product={product} />
    </>
  );
}