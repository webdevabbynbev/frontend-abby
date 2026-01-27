"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  BtnIcon,
  ChatkitWidget,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components";
import { useAuth } from "@/context/AuthContext";
import { useLoginModal } from "@/context/LoginModalContext";

export function MobileBottomNav({ className = "" }) {
  const pathname = usePathname();

  /* ===================== STATE ===================== */
  const [mounted, setMounted] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  /* ===================== AUTH ===================== */
  const { user } = useAuth();
  const { openLoginModal } = useLoginModal();
  const isAuthed = Boolean(user);

  /* ===================== SAFE PATHNAME ===================== */
  useEffect(() => {
    setMounted(true);
  }, []);

  const pathnameSafe = mounted ? pathname : "";

  /* ===================== ROUTE LOGIC ===================== */
  const singleSegmentRoutes = new Set([
    "/",
    "/best-seller",
    "/sale",
    "/new-arrival",
    "/notification",
    "/search",
    "/sign-in",
    "/beauty-and-tips",
    "/checkout",
    "/ramadan-checkin",
    "/vouchers",
  ]);

  const isSingleSegment =
    pathnameSafe && pathnameSafe !== "/" && /^\/[^/]+$/.test(pathnameSafe);

  const isProductDetailRoute =
    isSingleSegment && !singleSegmentRoutes.has(pathnameSafe);

  const hiddenRoutes = new Set(["/cart"]);
  const shouldHideNav = isProductDetailRoute || hiddenRoutes.has(pathnameSafe);

  if (shouldHideNav) {
    return null;
  }

  /* ===================== HELPERS ===================== */
  const isActive = (href) => {
    if (!href || href.startsWith("http")) return false;
    if (!mounted) return false;
    if (href === "/") return pathnameSafe === "/";
    return pathnameSafe === href || pathnameSafe.startsWith(href + "/");
  };

  const navItemBase =
    "flex flex-col items-center justify-center gap-1 w-full";
  const pillBase = "rounded-xl px-1 py-1 transition-colors";

  /* ===================== DATA ===================== */
  const shopLinks = [
    { href: "/sale", label: "Sale" },
    { href: "/best-seller", label: "Best Seller" },
    { href: "/new-arrival", label: "New Arrival" },
  ];

  const shopActive = mounted && shopLinks.some((l) => isActive(l.href));

  const profileLinks = [
    { href: "/account/profile", label: "Profile" },
    { href: "/account/wishlists", label: "Wishlist" },
    { href: "/account/order-history", label: "Order history" },
    { href: "/vouchers", label: "Voucher" },
  ];

  const profileActive =
    mounted && pathnameSafe.startsWith("/account");

  /* ===================== RENDER ===================== */
  return (
    <div
      className={clsx(
        "lg:hidden fixed inset-x-0 bottom-0 z-50",
        "pb-[env(safe-area-inset-bottom)]",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-130 px-2 py-2">
        <div className="border border-primary-500 rounded-xl bg-white px-2 py-2">
          <nav className="relative grid grid-cols-5 items-center">
            {/* HOME */}
            <Link href="/" aria-label="Home" className={navItemBase}>
              <div
                className={clsx(
                  pillBase,
                  isActive("/")
                    ? "bg-primary-100"
                    : "hover:bg-primary-50",
                )}
              >
                <BtnIcon iconName="House" variant="tertiary" size="sm" />
              </div>
              <span
                className={clsx(
                  "text-[10px] leading-none",
                  isActive("/")
                    ? "text-primary-700 font-bold"
                    : "text-primary-700 font-normal",
                )}
              >
                Home
              </span>
            </Link>

            {/* SHOP */}
            <Sheet open={shopOpen} onOpenChange={setShopOpen}>
              <SheetTrigger asChild>
                <button type="button" className={navItemBase}>
                  <div
                    className={clsx(
                      pillBase,
                      shopActive ? "bg-primary-100" : null,
                    )}
                  >
                    <BtnIcon
                      as="span"
                      iconName="Shop"
                      variant="tertiary"
                      size="sm"
                    />
                  </div>
                  <span
                    className={clsx(
                      "text-[10px] leading-none",
                      shopActive
                        ? "text-primary-700 font-bold"
                        : "text-primary-700 font-normal",
                    )}
                  >
                    Shop
                  </span>
                </button>
              </SheetTrigger>

              <SheetContent side="bottom" className="rounded-xl">
                <SheetHeader>
                  <SheetTitle className="text-primary-700">
                    Shop
                  </SheetTitle>
                </SheetHeader>

                <div className="py-4 space-y-2">
                  {shopLinks.map((l) => {
                    const active = isActive(l.href);
                    return (
                      <Link
                        key={l.href}
                        href={l.href}
                        onClick={() => setShopOpen(false)}
                        className={clsx(
                          "block rounded-xl px-4 py-3 font-medium transition-colors",
                          active
                            ? "bg-primary-100 text-primary-700"
                            : "hover:bg-primary-50",
                        )}
                      >
                        {l.label}
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>

            {/* CHAT */}
            <Sheet open={chatOpen} onOpenChange={setChatOpen}>
              <SheetTrigger asChild>
                <button type="button" className={navItemBase}>
                  <div className={clsx(pillBase, "hover:bg-primary-50")}>
                    <BtnIcon
                      as="span"
                      iconName="Comment"
                      variant="primary"
                      size="sm"
                      
                    />
                  </div>
                </button>
              </SheetTrigger>

              <SheetContent
                side="bottom"
                className="rounded-2xl p-0 h-[100vh] flex flex-col"
              >
                <SheetHeader className="px-4 pt-4 shrink-0">
                  <SheetTitle className="text-primary-700">
                    Chat dengan Abby
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-hidden pb-4">
                  <ChatkitWidget
                    variant="sheet"
                    onClose={() => setChatOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* BLOG */}
            <a
              href="https://abbynbev.com/blog/"
              target="_blank"
              rel="noreferrer"
              className={navItemBase}
            >
              <div className={clsx(pillBase, "hover:bg-primary-50")}>
                <BtnIcon iconName="Newspaper" variant="tertiary" size="sm" />
              </div>
              <span className="text-[10px] leading-none text-primary-700">
                Blog
              </span>
            </a>

            {/* PROFILE / SIGN IN */}
            {isAuthed ? (
              <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
                <SheetTrigger asChild>
                  <button type="button" className={navItemBase}>
                    <div
                      className={clsx(
                        pillBase,
                        profileActive ? "bg-primary-100" : null,
                      )}
                    >
                      <BtnIcon
                        as="span"
                        iconName="User"
                        variant="tertiary"
                        size="sm"
                      />
                    </div>
                    <span
                      className={clsx(
                        "text-[10px] leading-none",
                        profileActive
                          ? "text-primary-700 font-bold"
                          : "text-primary-700 font-normal",
                      )}
                    >
                      Account
                    </span>
                  </button>
                </SheetTrigger>

                <SheetContent side="bottom" className="rounded-xl">
                  <SheetHeader>
                    <SheetTitle className="text-primary-700">
                      Account
                    </SheetTitle>
                  </SheetHeader>

                  <div className="py-4 space-y-2">
                    {profileLinks.map((l) => {
                      const active = isActive(l.href);
                      return (
                        <Link
                          key={l.href}
                          href={l.href}
                          onClick={() => setProfileOpen(false)}
                          className={clsx(
                            "block rounded-xl px-4 py-3 font-medium transition-colors",
                            active
                              ? "bg-primary-100 text-primary-700"
                              : "hover:bg-primary-50",
                          )}
                        >
                          {l.label}
                        </Link>
                      );
                    })}
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <button
                type="button"
                className={navItemBase}
                onClick={openLoginModal}
              >
                <div className={clsx(pillBase, "hover:bg-primary-50")}>
                  <BtnIcon
                    as="span"
                    iconName="RightToBracket"
                    variant="tertiary"
                    size="sm"
                  />
                </div>
                <span className="text-[10px] leading-none text-primary-700">
                  Sign In
                </span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
