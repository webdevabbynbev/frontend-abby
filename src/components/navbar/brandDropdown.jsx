"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronRightIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { getImageUrl } from "@/utils/getImageUrl";
import { normalizeBrands } from "./utils";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function useCanHover() {
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(!!mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  return canHover;
}

const contentClass =
  "z-50 rounded-2xl border border-gray-200 bg-white/95 backdrop-blur " +
  "shadow-2xl shadow-black/10 outline-none " +
  "data-[state=open]:opacity-100 data-[state=closed]:opacity-0 " +
  "data-[state=open]:scale-100 data-[state=closed]:scale-[0.98] " +
  "transition duration-150 will-change-[transform,opacity]";

const letters = ["#", ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))];

function groupByLetter(list = []) {
  return list.reduce((acc, item) => {
    const first = item.name?.trim()?.[0]?.toUpperCase() || "#";
    const letter = letters.includes(first) ? first : "#";
    acc[letter] = acc[letter] ? [...acc[letter], item] : [item];
    return acc;
  }, {});
}

function BrandCard({ brand }) {
  const logo = brand.logo ? getImageUrl(brand.logo) : null;
  return (
    <Link
      href={`/brand/${encodeURIComponent(brand.slug)}`}
      className="group flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-primary-200 hover:shadow-sm"
    >
      {logo ? (
        <img
          src={logo}
          alt={brand.name}
          className="h-14 w-20 object-contain"
        />
      ) : (
        <span className="text-sm font-semibold text-gray-700">{brand.name}</span>
      )}
    </Link>
  );
}

export default function BrandDropdown({
  label = "Brand",
  brands = [],
  popularCount = 6,
}) {
  const canHover = useCanHover();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const closeTimer = useRef(null);

  const normalized = useMemo(() => normalizeBrands(brands), [brands]);

  const popularBrands = useMemo(() => {
    const featured = normalized.filter((b) => b.isPopular);
    if (featured.length) return featured.slice(0, popularCount);
    return normalized.slice(0, popularCount);
  }, [normalized, popularCount]);

  const filteredBrands = useMemo(() => {
    if (!query) return normalized;
    const q = query.toLowerCase().trim();
    return normalized.filter((brand) => brand.name.toLowerCase().includes(q));
  }, [normalized, query]);

  const grouped = useMemo(() => groupByLetter(filteredBrands), [filteredBrands]);
  const availableLetters = useMemo(
    () => letters.filter((letter) => grouped[letter]?.length),
    [grouped]
  );

  const [activeLetter, setActiveLetter] = useState(availableLetters[0] || "#");

  useEffect(() => {
    if (!availableLetters.includes(activeLetter)) {
      setActiveLetter(availableLetters[0] || "#");
    }
  }, [availableLetters, activeLetter]);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => setOpen(false), 140);
  };

  const hoverHandlers = useMemo(() => {
    if (!canHover) return {};
    return {
      onMouseEnter: () => {
        clearCloseTimer();
        setOpen(true);
      },
      onMouseLeave: scheduleClose,
    };
  }, [canHover]);

  const activeBrands = grouped[activeLetter] || [];

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cx(
            "inline-flex items-center gap-1 rounded-md px-3 py-2 text-xs font-medium",
            "text-neutral-600 hover:text-neutral-950 transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
          )}
          aria-label={`${label} menu`}
          {...hoverHandlers}
        >
          <span className="whitespace-nowrap">{label}</span>
          <ChevronRightIcon
            className={cx(
              "h-4 w-4 rotate-90 text-gray-400 transition-transform",
              open && "-rotate-90"
            )}
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cx(contentClass, "w-[92vw] max-w-360")}
          sideOffset={10}
          align="start"
          collisionPadding={16}
          {...(canHover
            ? {
                onMouseEnter: clearCloseTimer,
                onMouseLeave: scheduleClose,
              }
            : {})}
        >
          <div className="grid gap-0 px-2 pb-2 pt-4 md:grid-cols-[260px_1fr]">
            <div className="border-b border-gray-100 px-4 pb-4 md:border-b-0 md:border-r md:pr-5">
              <div className="text-sm font-semibold text-gray-900">
                Popular Brands
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {popularBrands.map((brand) => (
                  <BrandCard key={brand.id} brand={brand} />
                ))}
              </div>
            </div>

            <div className="px-4 pt-4">
              <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-3">
                {letters.map((letter) => {
                  const isDisabled = !grouped[letter]?.length;
                  const isActive = letter === activeLetter;
                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => setActiveLetter(letter)}
                      disabled={isDisabled}
                      className={cx(
                        "h-8 w-8 rounded-md text-sm font-semibold transition",
                        isActive
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-600 hover:bg-gray-50",
                        isDisabled && "cursor-not-allowed opacity-40"
                      )}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari berdasarkan nama brand"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-50"
                  >
                    Clear
                  </button>
                ) : null}
              </div>

              <div className="mt-5 max-h-[55vh] overflow-auto pr-2">
                {activeBrands.length ? (
                  <div className="space-y-4">
                    <div className="text-2xl font-semibold text-gray-800">
                      {activeLetter}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {activeBrands.map((brand) => (
                        <Link
                          key={brand.id}
                          href={`/brand/${encodeURIComponent(brand.slug)}`}
                          className="rounded-lg px-2 py-1 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          {brand.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                    Brand tidak ditemukan.
                  </div>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu.Arrow className="fill-white" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
