"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronRightIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

export default function MegaDropdown({
  label,
  data = [], // ← hasil adapter
  buildHref, // ← fn routing
  searchPlaceholder,
  viewAllHref,
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
          className="inline-flex items-center gap-1 px-3 py-2 text-xs"
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
        <DropdownMenu.Content
          className="z-50 w-[90vw] max-w-5xl rounded-2xl bg-white shadow-xl"
          sideOffset={10}
          align="start"
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
        >
          {/* HEADER */}
          <div className="flex justify-between px-4 pt-4">
            <div>
              <div className="font-semibold">{label}</div>
              <div className="text-xs text-gray-500">
                Browse available options
              </div>
            </div>
            {viewAllHref && (
              <DropdownMenu.Item asChild>
                <a href={viewAllHref} className="text-xs text-primary-700">
                  View all
                </a>
              </DropdownMenu.Item>
            )}
          </div>

          {/* SEARCH */}
          <div className="px-4 pt-3">
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full text-sm outline-none"
              />
            </div>
          </div>

          {/* BODY */}
          <div className="grid grid-cols-[220px_1fr] gap-4 px-4 py-4">
            {/* LEFT */}
            <div className="max-h-[55vh] space-y-1 overflow-y-auto pr-2">
              {data.map((g) => (
                <button
                  key={g.key}
                  onMouseEnter={() => setActiveKey(g.key)}
                  className={cx(
                    "w-full rounded-lg px-3 py-2 text-sm text-left",
                    activeKey === g.key
                      ? "bg-gray-100 font-semibold"
                      : "hover:bg-gray-50",
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>

            {/* RIGHT */}
            <div className="max-h-[55vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-2">
                {filteredItems.map((item) => (
                  <DropdownMenu.Item
                    key={`${activeKey}-${item.id ?? item.slug}`}
                    asChild
                  >
                    <button
                      className="rounded-lg px-3 py-2 text-sm text-left hover:bg-gray-50"
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
            </div>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
