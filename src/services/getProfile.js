export async function getProfile () {

const res = await fetch (`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
    cache: "no-store"
}) 
if (!res.ok) throw new Error ("Failed to fetch profile");

  return res.json();
}

