import CartClient from "./cartClient";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic"; // pastikan selalu fresh (user-specific)

async function getCart() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    const res = await fetch(`${baseUrl}/cart`, {
      headers: {
        cookie: cookieHeader,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.log('[SSR] Cart fetch failed:', res.status);
      return [];
    }
    
    const json = await res.json();
    console.log('[SSR] Cart fetched successfully');

    const items = json?.serve?.data || json?.data?.items || json?.data || [];
    return Array.isArray(items) ? items : [];
  } catch (error) {
    console.error('[SSR] Cart fetch error:', error);
    return [];
  }
}

export default async function CartPage() {
  const initialCart = await getCart();
  return <CartClient initialCart={initialCart} />;
}