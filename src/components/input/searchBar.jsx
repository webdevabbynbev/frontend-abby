"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { formatToRupiah } from "@/utils";
import { getImageUrl } from "@/utils/getImageUrl";
import { Metronome } from "ldrs/react";
import "ldrs/react/Metronome.css";

export function SearchBar({
  className = "",
  placeholder = "Cari disini . . .",
  per_page = 10,
  enableSuggestions = true,
  suggestCount = 3,
}) {
  const router = useRouter();
  const wrapRef = useRef(null);

  const [value, setValue] = useState("");
  const [items, setItems] = useState([]);
  const [brands, setBrands] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  const trimmed = useMemo(() => value.trim(), [value]);

  const goSearchPage = () => {
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    setOpen(false);
  };

  useEffect(() => {
    const onDown = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    // nothing here; suggestion fetching handled by fetchSuggestions
  }, []);

  // Shared debounced fetch function, can be called from onFocus or when trimmed changes
  const sample = (arr, n) => {
    if (!Array.isArray(arr) || arr.length === 0) return [];
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out.slice(0, n);
  };

  const fetchSuggestions = (q) => {
    if (!enableSuggestions) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();

        const url = `/api/products/suggest?limit=${Math.max(per_page, suggestCount * 4)}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
        const res = await fetch(url, { signal: abortRef.current.signal });
        const json = await res.json();
        const fetchedItems = Array.isArray(json?.data) ? json.data : [];
        const fetchedBrands = Array.isArray(json?.brands) ? json.brands : [];

        // pick random samples for friendly suggestions when query is empty,
        // otherwise show top results but limit to suggestCount
        const itemsToShow = q ? fetchedItems.slice(0, suggestCount) : sample(fetchedItems, suggestCount);
        const brandsToShow = q ? fetchedBrands.slice(0, suggestCount) : sample(fetchedBrands, suggestCount);

        setItems(itemsToShow);
        setBrands(brandsToShow);
        setOpen(true);
      } catch (e) {
        // ignore abort/errors
      } finally {
        setLoading(false);
      }
    }, 250);
  };

  // Trigger suggestions when query changes
  useEffect(() => {
    // Only fetch suggestions if input is focused (open is true) and there's a query
    if (open && trimmed) {
      fetchSuggestions(trimmed);
    }
    return () => clearTimeout(debounceRef.current);
  }, [trimmed, per_page, open]);

  const getProductHref = (p) => {
    if (p?.slug) return `/${p.slug}`;
    if (p?.id) return `/${p.id}`;
    return "#";
  };

  const getBrandHref = (brand) => {
    if (brand?.slug) return `/brand/${encodeURIComponent(brand.slug)}`;
    const brandParam = brand?.id || brand?.name || "";
    const brandQuery = brandParam
      ? `&brand=${encodeURIComponent(brandParam)}`
      : "";
    return `/search?q=${encodeURIComponent(trimmed)}${brandQuery}`;
  };

  return (
    <div ref={wrapRef} className={clsx("relative", className)}>
      <div
        className={clsx(
          "flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 transition-all duration-150",
          value ? "shadow-sm" : "",
        )}
      >
        <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <input
          id="global-search-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => {
            fetchSuggestions(trimmed);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") goSearchPage();
            if (e.key === "Escape") setOpen(false);
          }}
          className="w-full text-sm outline-none bg-transparent placeholder:text-gray-400"
        />
        {value ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setValue("");
              setItems([]);
              setBrands([]);
              setOpen(false);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        ) : null}
      </div>

      {open && (
        <div className="absolute left-0 right-0 mt-2 z-50 rounded-xl border bg-white overflow-hidden">
          <div className="px-3 py-2 text-xs text-neutral-500 border-b">
            {loading
              ? "Mencari..."
              : trimmed
              ? `Hasil untuk "${trimmed}"`
              : "Rekomendasi untukmu"}
          </div>

          {loading ? (
            <div className="flex p-4 text-sm w-full justify-center">
              <Metronome size="30" speed="1.2" color="#AE2D68" />
            </div>
          ) : items.length === 0 && brands.length === 0 ? (
            <div className="p-3 text-sm">Tidak ada suggestion.</div>
          ) : (
            <ul className="max-h-80 overflow-auto">
              {brands.length > 0 && (
                <>
                  <li className="px-3 py-2 text-xs font-semibold text-neutral-500 bg-neutral-50">
                    Brand
                  </li>

                  {brands.map((brand) => (
                    <li key={brand.id || brand.slug || brand.name}>
                      <button
                        type="button"
                        className="w-full px-3 py-3 text-left hover:bg-neutral-50 flex gap-3"
                        onClick={() => {
                          router.push(getBrandHref(brand));
                          setOpen(false);
                        }}
                      >
                        <img
                          src={getImageUrl(
                            brand?.logo?.url ||
                              brand?.logo ||
                              brand?.image?.url ||
                              brand?.image,
                          )}
                          alt={brand.name}
                          className="w-10 h-10 rounded-md object-cover border bg-neutral-100"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://d2ntedlnuwws1k.cloudfront.net/Products/abby-product-placeholder-image.png";
                          }}
                        />

                        <div className="min-w-0 flex flex-col justify-center">
                          <div className="text-sm font-medium text-primary-700 truncate">
                            {brand.name}
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </>
              )}

              <li className="px-3 py-2 text-xs font-semibold text-neutral-500 bg-neutral-50">
                Produk
              </li>

              {items.map((p) => (
                <li key={p.id || p.slug || p.name}>
                  <button
                    type="button"
                    className="w-full px-3 py-3 text-left hover:bg-neutral-50 flex gap-3"
                    onClick={() => {
                      router.push(getProductHref(p));
                      setOpen(false);
                    }}
                  >
                    <img
                      src={getImageUrl(p?.image?.url || p?.image)}
                      alt={p.name}
                      className="w-10 h-10 rounded-md object-cover border"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://d2ntedlnuwws1k.cloudfront.net/Products/abby-product-placeholder-image.png";
                      }}
                    />

                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {p.name}
                      </div>
                      <div className="flex flex-row gap-2 items-center text-xs text-neutral-500 truncate">
                        {p.price ? (
                          <span className="text-sm font-medium text-primary-700">
                            {formatToRupiah(p.price)}
                          </span>
                        ) : null}
                        <div className="block items-center w-1 h-1 rounded-full bg-neutral-400" />
                        <span className="truncate">{p.category}</span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}

              <li className="border-t">
                <button
                  type="button"
                  className="w-full px-3 py-3 text-sm font-medium hover:bg-neutral-50"
                  onClick={goSearchPage}
                >
                  Lihat semua hasil
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
