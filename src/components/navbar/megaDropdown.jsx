"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import SearchBarDropdown from "@/components/input/searchBarDropdown";

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

export default function MegaDropdown({
  label,
  data = [], // ← hasil adapter
  buildHref, // ← fn routing
  searchPlaceholder,
  viewAllHref,
  icon = "→",
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [activeKey, setActiveKey] = useState(data[0]?.key);
  const [query, setQuery] = useState("");

  const activeGroup = data.find((g) => g.key === activeKey);
  
  useEffect(() => {
    setQuery("");
  }, [activeKey]);

  const filteredItems = useMemo(() => {
    if (!query) return activeGroup?.items || [];
    const q = query.toLowerCase();
    return activeGroup?.items.filter((i) => i.name.toLowerCase().includes(q));
  }, [query, activeGroup]);

  useEffect(() => {
    if (!data.length) return;
    const hasActive = data.some((g) => g.key === activeKey);
    if (!hasActive) {
      setActiveKey(data[0].key);
    }
  }, [data, activeKey]);

  const closeTimer = useRef(null);

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          onMouseEnter={() => {
            clearCloseTimer();
            setOpen(true);
          }}
          onMouseLeave={scheduleClose}
          className={cx(
            "inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150",
            open
              ? "bg-primary-50 text-primary-700"
              : "text-neutral-600 hover:bg-primary-50 hover:text-primary-700"
          )}
        >
          {label}
          <ChevronRightIcon
            className={cx(
              "h-4 w-4 rotate-90 transition-transform",
              open && "-rotate-90",
            )}
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <DropdownMenu.Content
            className="z-50 w-[90vw] max-w-5xl rounded-2xl bg-white shadow-xl pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300"
            sideOffset={0}
            side="bottom"
            align="center"
            onMouseEnter={clearCloseTimer}
            onMouseLeave={scheduleClose}
          >
          {/* HEADER & SEARCH */}
          <div className="border-b border-gray-100 px-6 pt-6 pb-4">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="text-lg font-bold text-gray-900">{label}</div>
                <div className="text-sm text-gray-500 mt-1">
                  Browse available options
                </div>
              </div>
              <div className="flex-1 max-w-xs" onKeyDown={(e) => e.stopPropagation()}>
                <SearchBarDropdown
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                />
              </div>
              {viewAllHref && (
                <DropdownMenu.Item asChild>
                  <a href={viewAllHref} className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors whitespace-nowrap">
                    View all
                  </a>
                </DropdownMenu.Item>
              )}
            </div>
          </div>

          {/* BODY */}
          <div className="grid grid-cols-[220px_1fr] gap-6 px-6 py-4 pb-6">
            {/* LEFT */}
            <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-3">
              {data.map((g) => (
                <button
                  key={g.key}
                  onMouseEnter={() => setActiveKey(g.key)}
                  className={cx(
                    "w-full rounded-lg px-4 py-3 text-sm text-left font-semibold transition-all duration-150 border",
                    activeKey === g.key
                      ? "bg-primary-50 text-primary-700 border-primary-200 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 border-transparent hover:border-gray-100",
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>

            {/* RIGHT */}
            <div className="max-h-[55vh] overflow-y-auto pr-3">
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {filteredItems.map((item) => (
                    <DropdownMenu.Item
                      key={`${activeKey}-${item.id ?? item.slug}`}
                      asChild
                    >
                      <button
                        className="rounded-lg px-4 py-3 text-sm text-gray-700 text-left hover:bg-primary-50 transition-all duration-150 hover:text-primary-700 font-medium hover:shadow-sm border border-transparent hover:border-primary-100"
                        onClick={() => {
                          router.push(buildHref(item));
                          setOpen(false);
                        }}
                      >
                        {item.name}
                      </button>
                    </DropdownMenu.Item>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  <p className="text-sm">Tidak ada hasil ditemukan</p>
                </div>
              )}
            </div>
          </div>
          </DropdownMenu.Content>
        </div>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
