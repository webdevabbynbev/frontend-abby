"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "@/lib/axios.js";

function HeartToggle({ initial = true, onToggle }) {
  const [active, setActive] = useState(initial);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        const next = !active;
        setActive(next);
        onToggle?.(next);
      }}
      className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
    >
      ❤️
    </button>
  );
}

function WishlistSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white border rounded-xl p-3">
          <div className="mb-3 h-45 w-full rounded-lg bg-gray-100 animate-pulse" />
          <div className="h-3 w-24 bg-gray-100 rounded animate-pulse mb-2" />
          <div className="h-4 w-40 bg-gray-100 rounded animate-pulse mb-2" />
          <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    perPage: 10,
    currentPage: 1,
    lastPage: 1,
    nextPageUrl: null,
    previousPageUrl: null,
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const isEmpty = useMemo(
    () => !loading && !errorMsg && wishlistItems.length === 0,
    [loading, errorMsg, wishlistItems],
  );

  const fetchWishlist = useCallback(async (page = 1) => {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await axios.get("/api/wishlists");
      const json = res?.data ?? {};

      const serve = json?.serve ?? {};
      const arr = Array.isArray(serve?.data) ? serve.data : [];

      setWishlistItems(arr);

      setMeta({
        total: Number(serve?.total ?? 0),
        perPage: Number(serve?.perPage ?? 10),
        currentPage: Number(serve?.currentPage ?? page),
        lastPage: Number(serve?.lastPage ?? 1),
        nextPageUrl: serve?.nextPageUrl ?? null,
        previousPageUrl: serve?.previousPageUrl ?? null,
      });
    } catch (err) {
      setWishlistItems([]);
      setErrorMsg(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load wishlist",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchWishlist(controller.signal);
    return () => controller.abort();
  }, [fetchWishlist]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">Wishlist</h2>

        {!loading ? (
          <button
            type="button"
            onClick={() => fetchWishlist()}
            className="
                shrink-0
                px-4 py-2
                text-sm font-medium
                rounded-full
                border border-gray-200
                hover:border-pink-300
                bg-white
                text-gray-600
              "
          >
            Refresh
          </button>
        ) : null}
      </div>

      {/* Loading */}
      {loading ? <WishlistSkeleton /> : null}

      {/* Error */}
      {!loading && errorMsg ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="font-semibold mb-1">Oops, wishlist gagal dimuat.</div>
          <div className="mb-3">{errorMsg}</div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fetchWishlist()}
              className="rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
            >
              Coba lagi
            </button>

            {/* kalau 401, biasanya user belum login */}
            <Link
              href="/login"
              className="rounded-lg border border-red-200 bg-white px-3 py-2 hover:bg-red-50"
            >
              Login
            </Link>
          </div>
        </div>
      ) : null}

      {/* Empty */}
      {isEmpty ? (
        <div className="rounded-2xl border bg-white p-6 text-center">
          <div className="text-lg font-semibold mb-1">
            Wishlist kamu masih kosong 💔
          </div>
          <div className="text-sm text-gray-600 mb-4">
            Yuk mulai save produk favorit kamu biar gampang dicari lagi.
          </div>
          <Link
            href="/sale"
            className="inline-flex items-center justify-center rounded-lg bg-primary-700 px-4 py-2 text-white hover:bg-primary-800"
          >
            Browse products
          </Link>
        </div>
      ) : null}

      {/* Data */}
      {!loading && !errorMsg && wishlistItems.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {wishlistItems.map((item) => (
            <Link
              key={item.id}
              href={item?.href ?? `/product/${item?.slug ?? item?.id}`}
              className="bg-white border rounded-xl p-3 hover:shadow-sm transition-shadow"
            >
              <div className="relative mb-3">
                <div className="relative w-full aspect-4/5 rounded-lg overflow-hidden bg-gray-50">
                  <Image
                    src={item.image || "/placeholder.png"}
                    alt={item.name || "Product"}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                  />
                </div>

                <div className="absolute top-2 right-2">
                  <HeartToggle
                    initial
                    onToggle={(active) => {
                      // optional: kalau mau langsung remove/add, nanti sambungin ke /api/wishlist POST/DELETE
                      // console.log("toggle:", active, item.id);
                    }}
                  />
                </div>
              </div>

              <p className="text-xs text-gray-400 uppercase line-clamp-1">
                {item.brand || "-"}
              </p>
              <p className="font-semibold line-clamp-2">{item.name || "-"}</p>

              <p className="text-pink-600 font-semibold">
                {typeof item.price === "number"
                  ? `Rp${item.price.toLocaleString("id-ID")}`
                  : "—"}
              </p>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
