import { addWishlist, getWishlist, removeWishlist } from "@/services/api/wishlists.services.js";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// sesuaikan path file service kamu

async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value;
}

export async function GET() {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized", serve: [] },
        { status: 401 },
      );
    }

    const res = await getWishlist(token);
    // normalize: pastiin bentuknya konsisten
    const serve = Array.isArray(res?.serve)
      ? res.serve
      : Array.isArray(res?.data?.serve)
        ? res.data.serve
        : [];
    return NextResponse.json({ message: "Success", serve }, { status: 200 });
  } catch (err) {
    const msg = err?.message || "Failed";
    const status = msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ message: msg, serve: [] }, { status });
  }
}

export async function POST(req) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json().catch(() => ({}));
    const productId = body?.product_id;

    if (productId === undefined || productId === null || productId === "") {
      return NextResponse.json(
        { message: "product_id is required" },
        { status: 400 },
      );
    }

    await addWishlist(token, { product_id: String(productId) });
    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (err) {
    const msg = err?.message || "Failed";
    const status = msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ message: msg }, { status });
  }
}

export async function DELETE(req) {
  try {
     const token = await getAuthToken();
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json().catch(() => ({}));
    const productId = body?.product_id;

    if (productId === undefined || productId === null || productId === "") {
      return NextResponse.json(
        { message: "product_id is required" },
        { status: 400 },
      );
    }

    await removeWishlist(token, { product_id: String(productId) });
    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (err) {
    const msg = err?.message || "Failed";
    const status = msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ message: msg }, { status });
  }
}
