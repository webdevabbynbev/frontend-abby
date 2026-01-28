"use client";

import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import * as FaIcons from "react-icons/fa";
import { useRouter } from "next/navigation";
import MegaDropdown from "./megaDropdown";
import { useState } from "react";

import {
  BtnIcon,
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SearchBar,
} from "@/components";

import CartButton from "@/components/button/cartButton";
import { concernHref } from "./adapters/concern.adapter";
import { categoryHref } from "./adapters/category.adapter";
import BrandDropdown from "./brandDropdown";
import { buildconcernsItems } from "./utils";

export function NavbarLoggedIn({
  pathname,
  user,
  links,
  linksidebar,
  isNavActive,
  search,
  setSearch,
  onSearch,
  onLogout,
  categories = [],
  concerns = [],
  brands = [],
  categoriesLoading = false,
}) {
  const router = useRouter();

  // category dari DB
  const categoryTypes = Array.isArray(categories) ? categories : [];
  const catLoading = Boolean(categoriesLoading);
  const concernsItems = buildconcernsItems(concerns);
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* ===================== MOBILE ( < lg ) ===================== */}
      <div className="flex items-center gap-3 lg:hidden">
        <div className="flex-1 min-w-0">
          <SearchBar
            className="w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={onSearch}
          />
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <CartButton />

          <BtnIcon
            iconName="Bell"
            variant="tertiary"
            size="sm"
            onClick={() => router.push("/notification")}
          />
        </div>
      </div>

      {/* ===================== DESKTOP ( >= lg ) ===================== */}
      <div className="hidden lg:flex items-center justify-between gap-6">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/Logoabby-text.svg"
              alt="Logo"
              width={160}
              height={80}
            />
          </Link>

          {/* DROPDOWN MENUS */}
          <div className="flex items-center gap-1">
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
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3">
          <SearchBar
            className="max-w-75"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={onSearch}
          />

          <CartButton />

          <Link href="/notification">
            <BtnIcon as="span" iconName="Bell" variant="tertiary" size="sm" />
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <BtnIcon
                as="span"
                iconName="User"
                variant="tertiary"
                size="sm"
                onClick={() => setOpen(true)}
              />
            </SheetTrigger>

            {/* ✅ Hide account menu untuk Google login users */}
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <img
                    src={
                      user?.photoProfile
                        ? user.photoProfile
                        : "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                    }
                    alt="user"
                    className="h-8 w-8 rounded-full"
                  />
                  <div className="text-sm">
                    {user?.firstName
                      ? `${user?.firstName} ${user?.lastName}`
                      : "User"}
                  </div>
                </SheetTitle>

                <SheetDescription className="py-1">
                  Account menu
                </SheetDescription>
              </SheetHeader>

              <div className="mt-4 space-y-4">
                {linksidebar.map((item) => {
                  const Icon = FaIcons[item.icon] || null;

                  return (
                    <button
                      key={item.href}
                      className={clsx(
                        "flex items-center gap-2 text-sm",
                        pathname === item.href
                          ? "text-primary-700"
                          : "text-neutral-600 hover:text-primary-700",
                      )}
                      onClick={() => router.push(item.href)}
                    >
                      {Icon && <Icon />}
                      <span>{item.label}</span>
                    </button>
                  );
                })}

                <div className="border-t pt-4">
                  <Button
                    variant="error"
                    size="sm"
                    onClick={onLogout}
                    className="w-full"
                  >
                    Log out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}
