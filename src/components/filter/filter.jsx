"use client";
import React, { useMemo, useState } from "react";
import { useDebounce } from "@/app/hooks/useDebounce";

import {
  Button,
  TxtField,
  Chip,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components";

import { NestedSection } from "./nestedSection";
import { SubList } from "..";
import { FaChevronDown } from "react-icons/fa6";
import { formatToRupiah } from "@/utils";

/* ---------------- helpers ---------------- */

const normalize = (v = "") =>
  String(v)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();

const groupConcerns = (items = []) => {
  const groups = {
    skin: [],
    body: [],
    hair: [],
  };

  items.forEach((item) => {
    if (!item?.id || !item?.name) return;

    const type = String(item.concernId);

    if (type === "1") groups.skin.push(item);
    if (type === "2") groups.body.push(item);
    if (type === "3") groups.hair.push(item);
  });

  return groups;
};

/* ---------------- component ---------------- */

export function Filter({
  brands = [],
  categories = [],
  concerns = [],
  ratings = [],
  categoriesLoading = false,
  showBrandFilter = true,
  className = "",
}) {
  /* ---------- state UI ---------- */
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [brandSearch, setBrandSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showTooltipMin, setShowTooltipMin] = useState(false);
  const [showTooltipMax, setShowTooltipMax] = useState(false);

  const debouncedBrandSearch = useDebounce(brandSearch, 250);

  /* ---------- memo ---------- */
  const filteredBrands = useMemo(() => {
    const q = normalize(debouncedBrandSearch);
    if (!q) return brands;
    return brands.filter((b) => normalize(b.brandname || b.name).includes(q));
  }, [brands, debouncedBrandSearch]);

  const groupedConcerns = useMemo(() => groupConcerns(concerns), [concerns]);
  const hasSubCategory = (node) =>
    Array.isArray(node?.children) && node.children.length > 0;

  const categoryRoots = useMemo(() => {
    if (!Array.isArray(categories)) return [];

    return categories
      .filter(hasSubCategory) // ⬅️ root harus punya child
      .map((root) => ({
        ...root,
        children: root.children.filter(hasSubCategory), // ⬅️ child juga harus punya subitem
      }))
      .filter((root) => root.children.length > 0);
  }, [categories]);

  /* ---------- handlers ---------- */
  const handleSelect = (prefix, id) => {
    const key = `${prefix}-${id}`;
    setSelectedFilters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleReset = () => {
    setSelectedFilters([]);
    setBrandSearch("");
    setMinPrice("");
    setMaxPrice("");
  };

  const handleChangePrice = (e, type) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    type === "min" ? setMinPrice(raw) : setMaxPrice(raw);

    const isNum = /^\d*$/.test(e.target.value);
    type === "min" ? setShowTooltipMin(!isNum) : setShowTooltipMax(!isNum);
  };

  /* ---------- render ---------- */
  return (
    <div className={`flex flex-col gap-2 p-2 bg-neutral-50 border-primary-700`}>
      <div className="flex flex-row items-center justify-between p-2">
        <span className="font-medium text-sm">Filter by</span>
        {/* RESET */}
        <Button
          variant="primary"
          size="sm"
          onClick={handleReset}
          disabled={
            !selectedFilters.length && !brandSearch && !minPrice && !maxPrice
          }
        >
          Reset filter
        </Button>
      </div>
      {/* BRAND */}
      {showBrandFilter && (
        <NestedSection
          title="Brands"
          mode="flat"
          render={() => (
            <div className="space-y-2">
              <TxtField
                placeholder="Search brand here..."
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
              />

              <div className="flex flex-wrap gap-3 max-h-64 overflow-y-auto">
                {filteredBrands.length === 0 ? (
                  <div>brand tidak ditemukan</div>
                ) : (
                  filteredBrands.map((b) => {
                    const active = selectedFilters.includes(`brand-${b.id}`);
                    return (
                      <Chip
                        key={b.id}
                        isActive={active}
                        onClick={() => handleSelect("brand", b.id)}
                      >
                        {b.brandname || b.name}
                      </Chip>
                    );
                  })
                )}
              </div>
            </div>
          )}
        />
      )}

      {/* CATEGORY */}
      <NestedSection
        title="Categories"
        mode="flat"
        render={() =>
          categoriesLoading ? null : (
            <Accordion type="single" collapsible className="space-y-2">
              {categoryRoots.map((root) => (
                <AccordionItem key={root.id} value={root.id}>
                  <AccordionTrigger>
                    {root.name}
                    <FaChevronDown className="h-3 w-3" />
                  </AccordionTrigger>
                  <AccordionContent>
                    <SubList
                      data={root.children}
                      prefix="category"
                      selectedFilters={selectedFilters}
                      onSelect={handleSelect}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )
        }
      />

      {/* PRICE */}
      <NestedSection
        title="Price"
        mode="flat"
        render={() => (
          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip open={showTooltipMin}>
                <TooltipTrigger asChild>
                  <TxtField
                    label="Min"
                    value={formatToRupiah(minPrice)}
                    onChange={(e) => handleChangePrice(e, "min")}
                  />
                </TooltipTrigger>
                <TooltipContent>Number only</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip open={showTooltipMax}>
                <TooltipTrigger asChild>
                  <TxtField
                    label="Max"
                    value={formatToRupiah(maxPrice)}
                    onChange={(e) => handleChangePrice(e, "max")}
                  />
                </TooltipTrigger>
                <TooltipContent>Number only</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      />

      {/* CONCERN */}
      <NestedSection
        title="Concerns"
        mode="flat"
        render={() => {
          const entries = Object.entries(groupedConcerns).filter(
            ([, list]) => list.length > 0,
          );

          if (!entries.length) {
            return (
              <div className="text-xs text-neutral-500">
                No concern available
              </div>
            );
          }

          return (
            <Accordion type="single" collapsible className="space-y-2">
              {entries.map(([key, list]) => (
                <AccordionItem key={key} value={key}>
                  <AccordionTrigger className="text-xs font-medium capitalize">
                    {key}
                    <FaChevronDown className="h-3 w-3 text-neutral-400" />
                  </AccordionTrigger>

                  <AccordionContent>
                    <SubList
                      data={list}
                      prefix="concern"
                      selectedFilters={selectedFilters}
                      onSelect={handleSelect}
                    />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          );
        }}
      />

      {/* RATING */}
      <NestedSection
        title="By rating"
        mode="flat"
        render={() => (
          <div className="flex flex-wrap gap-3">
            {ratings.map((r) => {
              const active = selectedFilters.includes(`rating-${r.id}`);
              return (
                <Chip
                  key={r.id}
                  label={r.star || r.label}
                  isActive={active}
                  onClick={() => handleSelect("rating", r.id)}
                />
              );
            })}
          </div>
        )}
      />
    </div>
  );
}
