"use client";

import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { LoginButton, LoginRegisModalForm, SearchBar } from "@/components";
import MegaDropdown from "./megaDropdown";
import ShopByCategoryDropdown from "./categoryDropdown";

/* ===================== DROPDOWN DATA ===================== */
export const shopByConcern = [
  {
    label: "Acne",
    children: [
      {
        label: "Oily Skin",
        children: [{ label: "Acne Cleanser", href: "/concern/acne-cleanser" }],
      },
    ],
  },
];

export const shopByBrand = [
  {
    label: "Local Brand",
    children: [
      {
        label: "Skincare",
        children: [
          { label: "Somethinc", href: "/brand/somethinc" },
          { label: "Avoskin", href: "/brand/avoskin" },
        ],
      },
    ],
  },
];

/* ===================== COMPONENT ===================== */
export function NavbarGuest({
  links = [],
  isNavActive = () => false,
  search,
  setSearch,
  onSearch,
  categories = [],
  categoriesLoading = false,
}) {
  const categoryTypes = Array.isArray(categories) ? categories : [];
  const catLoading = Boolean(categoriesLoading);

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

        <div className="shrink-0">
          <LoginButton />
        </div>
      </div>

      {/* ===================== DESKTOP (>= lg) ===================== */}
      <div className="hidden items-center justify-between gap-6 lg:flex">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-5">
          {/* LOGO */}
          <Link href="/" className="shrink-0">
            <Image
              src="/Logoabby-text.svg"
              alt="Abby n Bev"
              width={160}
              height={80}
              priority
            />
          </Link>

          {/* STATIC LINKS */}
          {links.map((link) => {
            const isExternal =
              typeof link.href === "string" && link.href.startsWith("http");
            const active = isNavActive(link.href);

            const className = clsx(
              "whitespace-nowrap text-sm font-medium transition-colors",
              active
                ? "text-primary-700"
                : "text-gray-700 hover:text-primary-500",
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

          {/* DROPDOWN MENUS */}
          <div className="flex items-center">
            <ShopByCategoryDropdown
              label="Shop By Category"
              categories={categoryTypes}
              loading={catLoading}
            />

            <MegaDropdown label="Shop by Concern" items={shopByConcern} />
            <MegaDropdown label="Shop by Brand" items={shopByBrand} />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">
          <SearchBar
            className="max-w-75"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={onSearch}
          />

          <LoginButton />
        </div>
      </div>
    </>
  );
}
