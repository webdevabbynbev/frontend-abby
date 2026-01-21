import NewArrivalClient from "./newArrivalClient";
import { getProducts } from "@/services/api/product.services";

export const metadata = {
  title: "New Arrival",

  description:
    "Produk baru sudah ready di beauty store Abby n Bev! Dari makeup sampai skincare terbaru yang siap kamu coba sebelum jadi viral.",

  openGraph: {
    title: "Abby n Bev - Situs Belanja Online Makeup dan Skincare Terbaik Di Indonesia",
    description:
      "Produk baru sudah ready di beauty store Abby n Bev! Dari makeup sampai skincare terbaru yang siap kamu coba sebelum jadi viral.",
    siteName: "Abby n Bev",
    type: "website",
  },
};

export default async function NewArrivalPage() {
  const { data } = await getProducts({ page: 1, per_page: 16 });

  return <NewArrivalClient products={data || []} />;
}
