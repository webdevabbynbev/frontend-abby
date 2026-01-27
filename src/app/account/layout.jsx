"use client";

import AccountTabs from "./AccountTabs";
import { useRequireAuth } from "../hooks/useRequireAuth";

export default function AccountLayout({ children }) {
  const { loading } = useRequireAuth("/login");

  // ⛔ Jangan render apa pun sebelum auth selesai dicek
  if (loading) {
    return null; // atau spinner/skeleton layout
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 lg:px-10 py-6 pb-28">
      <div className="flex">
        {/* Tabs — desktop only */}
        <aside className="hidden lg:block w-64 shrink-0">
          <AccountTabs />
        </aside>

        {/* Content — protected */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
