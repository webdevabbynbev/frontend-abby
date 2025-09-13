"use client";
import Link from "next/link";
import Image from "next/image";
import { BtnIcon, Button, TxtField } from ".";
import { usePathname } from "next/navigation";
import clsx from "clsx";
export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "", label: "Shop" },
    { href: "/best-seller", label: "Best seller" },
    { href: "/sale", label: "Sale" },
    { href: "/new-arrival", label: "New arrival" },
    { href: "/beauty-and-tips", label: "Beauty & tips" },
  ];

  return (
    <nav className="Navbar flex h-auto px-10 py-5 sticky top-0 w-full bg-white border-b-[1px] border-primary-700 transition-all justify-between items-center z-50">
      <div className="content-wrapper flex justify-between w-full max-w-[1536px] mx-auto">
        <div className="content-left flex w-auto items-center justify-center space-x-6">
          <div className="Icon-wrapper h-auto w-auto flex justify-center space-x-3">
            <Image
              src="/logo-abby-circle.svg"
              alt="Logo-circle"
              height={45}
              width={45}
              className="justify-center"
            />
            <Image
              src="/Logoabby-text.svg"
              alt="Logo"
              height={0}
              width={0}
              className="w-[150px] h-auto justify-center"
            />
          </div>
          <div className="w-auto justify-center">
            <TxtField
              placeholder="Wardah, Maybeline, anything. . ."
              iconLeftName="MagnifyingGlass"
              variant="outline"
              size="md"
              className="min-w-[280px]"
            />
          </div>
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "items-center transition-colors",
                  isActive ? "text-primary-700" : "hover:text-primary-500"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="w-auto flex justify-between space-x-4">
          <Button variant="primary" size="sm">
            Sign in
          </Button>
          {/* <BtnIcon iconName="Bell" variant="tertiary" size="md" />
          <BtnIcon iconName="ShoppingBag" variant="tertiary" size="md"/>
          <BtnIcon iconName="User" variant="tertiary" size="md" /> */}
        </div>
      </div>
    </nav>
  );
}
