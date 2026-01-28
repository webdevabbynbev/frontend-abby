"use client";

import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { BtnIcon, Button, SearchBar } from "@/components";
import BrandDropdown from "./brandDropdown";
import CartButton from "@/components/button/cartButton";
import { buildconcernsItems } from "./utils";
import { useLoginModal } from "@/context/LoginModalContext";
import MegaDropdown from "./megaDropdown";
import { categoryHref } from "./adapters/category.adapter";
import { concernHref } from "./adapters/concern.adapter";

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
          <div className="flex items-center gap-1 text-xs">
            <MegaDropdown
              label="Category"
              data={categories}
              buildHref={categoryHref}
              searchPlaceholder="Search category..."
              viewAllHref="/category"
              icon="Package"
            />

            <MegaDropdown
              label="Concern"
              data={concerns}
              buildHref={concernHref}
              searchPlaceholder="Search concern..."
              viewAllHref="/concern"
              icon="HeartHandshake"
            />
            <BrandDropdown label="Brand" brands={brands} />
          </div>
          {/* STATIC LINKS */}
          {links.map((link) => {
            const isExternal =
              typeof link.href === "string" && link.href.startsWith("http");
            const active = isNavActive(link.href);

            const className = clsx(
              "inline-flex items-center gap-1 px-3 py-2 text-xs font-medium transition-colors rounded-lg",
              active
                ? "text-primary-700 bg-primary-50"
                : "text-neutral-600 hover:text-primary-700 hover:bg-primary-50",
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
                  <span>✨</span>
                  {link.label}
                </a>
              );
            }

            return (
              <Link key={link.href} href={link.href} className={className}>
                <span>✨</span>
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
          <Button
            variant="primary"
            iconName="RightToBracket"
            size="md"
            onClick={openLoginModal}
          >
            Masuk
          </Button>
        </div>
      </div>
    </>
  );
}
