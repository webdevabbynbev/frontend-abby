"use client";

import { useEffect, useState } from "react";
import { Navbar } from ".";
import { LoginRegisModalForm } from "@/components";

export function NavbarClientGate({
  categories = [],
  concerns = [],
  brands = [],
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-16 sticky top-0" />;
  }

  return (
    <>
      <Navbar
        categories={categories}
        concerns={concerns}
        brands={brands}
      />
      <LoginRegisModalForm />
    </>
  );
}
