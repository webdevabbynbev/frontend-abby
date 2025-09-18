export async function getBanners() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banner`, {
    cache: "no-store", // kalau mau selalu fresh data
  });

  if (!res.ok) throw new Error("Failed to fetch banners");

  return res.json();
}
