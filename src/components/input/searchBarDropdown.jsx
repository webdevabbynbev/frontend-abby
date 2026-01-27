"use client";

import clsx from "clsx";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

export default function SearchBarDropdown({
  className = "",
  placeholder = "Cari disini . . .",
  value = "",
  onChange = () => {},
}) {
  return (
    <div className={clsx("relative", className)}>
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
        <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e)}
          onKeyDown={(e) => {
              // Only block Enter to prevent form submission
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
          className="w-full text-sm outline-none bg-transparent placeholder:text-gray-400"
        />

        {value ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onChange({ target: { value: "" } })}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        ) : null}
      </div>
    </div>
  );
}
