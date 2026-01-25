"use client";

import { useEffect, useState } from "react";
import { Navbar } from ".";
import { LoginRegisModalForm } from "@/components";

export function NavbarClientGate({ categories = [] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-16 sticky top-0" />;

  return (
    <>
      <Navbar categories={categories} />
      <LoginRegisModalForm />
    </>
  );
}