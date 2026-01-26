"use client";

import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { BtnIcon, Button, SearchBar } from "@/components";
import MegaDropdown from "./megaDropdown";
import ShopByCategoryDropdown from "./categoryDropdown";
import BrandDropdown from "./brandDropdown";
import CartButton from "@/components/button/cartButton";
import { buildconcernsItems } from "./utils";
import { useLoginModal } from "@/context/LoginModalContext";

/* ===================== COMPONENT ===================== */
export function NavbarGuest({
  links = [],
  isNavActive = () => false,
  search,
  setSearch,
  onSearch,
  categories = [],
  concerns = [],
  brands = [],
  categoriesLoading = false,
}) {
  const categoryTypes = Array.isArray(categories) ? categories : [];
  const catLoading = Boolean(categoriesLoading);
  const concernsItems = buildconcernsItems(concerns);
  const { openLoginModal } = useLoginModal();

  return (
    <>
      {/* ===================== MOBILE (< lg) ===================== */}
      <div className="flex items-center gap-3 lg:hidden">
        <div className="min-w-0 flex-1">
          <SearchBar
            className="w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={onSearch}
          />
        </div>
        <CartButton />
      </div>

      {/* ===================== DESKTOP (>= lg) ===================== */}
      <div className="hidden lg:flex items-center justify-between gap-2">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-2 shrink-0">
          {/* LOGO */}
          <Link href="/" className="shrink-0">
            <Image
              src="/Logoabby-text.svg"
              alt="Abby n Bev"
              width={140}
              height={60}
              priority
            />
          </Link>
          {/* DROPDOWN MENUS */}
          <div className="flex items-center text-xs">
            <ShopByCategoryDropdown
              label="Category"
              categories={categoryTypes}
              loading={catLoading}
            />

            <MegaDropdown label="concerns" items={concernsItems} />
            <BrandDropdown label="Brand" brands={brands} />
          </div>
          {/* STATIC LINKS */}
          {links.map((link) => {
            const isExternal =
              typeof link.href === "string" && link.href.startsWith("http");
            const active = isNavActive(link.href);

            const className = clsx(
              "whitespace-nowrap text-xs font-medium transition-colors",
              active
                ? "text-primary-700"
                : "text-neutral-600 hover:text-neutral-950",
            );

            if (isExternal) {
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={className}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.label}
                </a>
              );
            }

            return (
              <Link key={link.href} href={link.href} className={className}>
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-1 min-w-0 items-center gap-4 justify-end">
          <SearchBar
            className="max-w-75"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={onSearch}
          />
          <CartButton />
          <Button variant="primary" size="md" onClick={openLoginModal}>
            Masuk
          </Button>
        </div>
      </div>
    </>
  );
}
