import RamadanCheckinClient from "./ramadhanCheckinClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ramadhan Check-in",

  description:
    "Rayakan bulan Ramadhan bareng Abby n Bev beauty store. Check-in puasa harian, isi tabel ceklis, dan menangkan Grand Prize spesial up to Rp900.000 untuk 1 orang yang beruntung.",

  openGraph: {
    title: "Abby n Bev - Situs Belanja Online Makeup dan Skincare Terbaik Di Indonesia",
    description:
      "Rayakan bulan Ramadhan bareng Abby n Bev beauty store. Check-in puasa harian, isi tabel ceklis, dan menangkan Grand Prize spesial up to Rp900.000 untuk 1 orang yang beruntung.",
    siteName: "Abby n Bev",
    type: "website",
  },
};

export default function RamadanCheckinPage() {
  return <RamadanCheckinClient />;
}
