"use client";

import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import * as FaIcons from "react-icons/fa";
import { useRouter } from "next/navigation";

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
import ShopByCategoryDropdown from "./categoryDropdown";
import MegaDropdown from "./megaDropdown";

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

export function NavbarLoggedIn({
  pathname,
  user,
  links,
  linksidebar,
  isNavActive,
  search,
  setSearch,
  onSearch,
  open,
  setOpen,
  onLogout,
  categories = [],
  categoriesLoading = false,
}) {
  const router = useRouter();

  // category dari DB
  const categoryTypes = Array.isArray(categories) ? categories : [];
  const catLoading = Boolean(categoriesLoading);

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
              <BtnIcon as="span" iconName="User" variant="tertiary" size="sm" />
            </SheetTrigger>

            {/* ✅ Hide account menu untuk Google login users */}
            {user?.photoProfile?.includes("googleusercontent") ? (
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Account</SheetTitle>
                  <SheetDescription>
                    Google login users tidak dapat akses profile management di sini. 
                    Gunakan <Link href="/account/profile" className="text-primary-700 underline">profile page</Link> untuk mengelola akun.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4">
                  <Button
                    variant="error"
                    size="sm"
                    onClick={onLogout}
                    className="w-full"
                  >
                    Log out
                  </Button>
                </div>
              </SheetContent>
            ) : (
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
                  <SheetDescription className="py-1">Account menu</SheetDescription>
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

                <SheetDescription />
              </SheetContent>
            )}
          </Sheet>
        </div>
      </div>
    </>
  );
}
