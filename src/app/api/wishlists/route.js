import { addWishlist, getWishlist, removeWishlist } from "@/services/api/wishlist.services";
import { NextResponse } from "next/server";

// sesuaikan path file service kamu

export async function GET() {
  try {
    const res = await getWishlist();
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
    const body = await req.json().catch(() => ({}));
    const productId = body?.product_id;

    if (productId === undefined || productId === null || productId === "") {
      return NextResponse.json(
        { message: "product_id is required" },
        { status: 400 },
      );
    }

    await addWishlist({ product_id: String(productId) });
    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (err) {
    const msg = err?.message || "Failed";
    const status = msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ message: msg }, { status });
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const productId = body?.product_id;

    if (productId === undefined || productId === null || productId === "") {
      return NextResponse.json(
        { message: "product_id is required" },
        { status: 400 },
      );
    }

    await removeWishlist({ product_id: String(productId) });
    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (err) {
    const msg = err?.message || "Failed";
    const status = msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ message: msg }, { status });
  }
}
