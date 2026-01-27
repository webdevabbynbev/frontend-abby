import { Plus_Jakarta_Sans, Damion } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { Footer, MobileBottomNav, ChatkitWidget } from "../components";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { LoginModalProvider } from "@/context/LoginModalContext";
import { NavbarClientGate } from "@/components/navbar";
import { getCategories } from "@/services/api/category.services";
import { getconcern } from "@/services/api/concern.services";
import { getBrands } from "@/services/api/brands.services";
import { Toaster } from "sonner";
import GAListener from "@/components/GAListener";

export const dynamic = "force-dynamic";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const damion = Damion({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-damion",
});

/* ✅ GLOBAL SEO (DEFAULT) */
export const metadata = {
  metadataBase: new URL("https://abbynbev.com"),

  icons: {
    icon: "/favicon.svg",
  },

  title: {
    default:
      "Abby n Bev | Situs Belanja Online Makeup dan Skincare Terbaik Di Indonesia",
    template: "%s | Abby n Bev",
  },

  description:
    "Lebih dari sekedar Beauty Store atau Toko Kosmetik, di Abby n Bev kamu bisa konsultasi gratis bersama AI Beauty Advisor buat tahu jenis kulit, skintone, undertone, biar belanja makeup dan skincare nggak salah pilih",

  openGraph: {
    siteName: "Abby n Bev",
    type: "website",
  },

  keywords: [
    "beauty store",
    "toko kosmetik",
    "beauty advisor",
    "jenis kulit",
    "abby n bev",
    "skintone",
    "undertone",
    "belanja makeup",
    "belanja skincare",
  ],
};

export default async function RootLayout({ children }) {
  let categories = [];
  let concerns = [];
  let brands = [];

  try {
    const res = await getCategories();
    categories = Array.isArray(res?.serve)
      ? res.serve
      : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];
  } catch (error) {
    console.error("Failed to load categories for navbar:", error);
  }

  try {
    const res = await getconcern();
    concerns = Array.isArray(res?.serve)
      ? res.serve
      : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];
  } catch (error) {
    console.error("Failed to load concerns for navbar:", error);
  }

  try {
    brands = await getBrands({ page: 1, per_page: 200 });
  } catch (error) {
    console.error("Failed to load brands for navbar:", error);
  }

  return (
    <html
      lang="id"
      className={`${plusJakarta.variable} ${damion.variable}`}
      suppressHydrationWarning
    >
      <body
        className="flex flex-col min-h-screen font-sans bg-main"
        suppressHydrationWarning
      >
        {/* GA4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-99NCXMEG24"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-99NCXMEG24', {
              send_page_view: true
            });
          `}
        </Script>
        <GAListener />
        <AuthProvider>
          <LoginModalProvider>
            <WishlistProvider>
              <NavbarClientGate
                categories={categories}
                concerns={concerns}
                brands={brands}
              />

              <main className="flex-1">
                {children}
                <div className="lg:hidden h-24" />
              </main>

              <Toaster position="top-center" />
              <MobileBottomNav />
              <ChatkitWidget />
              <Footer />
            </WishlistProvider>
          </LoginModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
