"use client";
import { useDebounce } from "@/app/hooks/useDebounce";
import React, { useMemo, useState } from "react";

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
import { FaChevronDown, FaStar } from "react-icons/fa6";

import { formatToRupiah } from "@/utils";

// import data filter lain (tetap dipakai)
import {
  DataSkinConcern,
  DataBodyConcern,
  DataHairConcern,
  DataRating,
} from "@/data";

export function Filter({
  brands = [],
  categories = [],
  categoriesLoading = false,
  showBrandFilter = true,
  className = "",
}) {
  // state pilihan filter
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showTooltipMin, setShowTooltipMin] = useState(false);
  const [showTooltipMax, setShowTooltipMax] = useState(false);

  // category dari DB
  const categoryTypes = Array.isArray(categories) ? categories : [];
  const catLoading = Boolean(categoriesLoading);

  // brand (opsional)
  const [brandSearch, setBrandSearch] = useState("");
  const debouncedSearch = useDebounce(brandSearch, 250);

  const norm = (s = "") =>
    s
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/\s+/g, " ")
      .trim();

  const brandOptions = Array.isArray(brands) && brands.length > 0 ? brands : [];

  const filteredBrands = useMemo(() => {
    const q = norm(debouncedSearch);
    if (!q) return brandOptions;
    return brandOptions.filter((b) => norm(b.brandname || b.name).includes(q));
  }, [brandOptions, debouncedSearch]);

  const handleSelect = (prefix, id) => {
    const key = `${prefix}-${id}`;
    setSelectedFilters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleReset = () => {
    setSelectedFilters([]);
    setMinPrice("");
    setMaxPrice("");
    setBrandSearch("");
  };

  const handleChangePrice = (e, type) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    if (type === "min") setMinPrice(raw);
    else setMaxPrice(raw);

    const isNum = /^\d*$/.test(e.target.value);
    type === "min" ? setShowTooltipMin(!isNum) : setShowTooltipMax(!isNum);
  };

  // concern sections (tetap sama)
  const concern_sections = useMemo(
    () => [
      {
        key: "skincareconcern",
        title: "Skincare concern",
        items: [
          {
            value: "skinconcern",
            label: "Skincare concern",
            leftBar: false,
            list: DataSkinConcern,
            prefix: "skinconcern",
            getLabel: (row) => row.skinconcern,
          },
        ],
      },
      {
        key: "bodyconcern",
        title: "Body concern",
        items: [
          {
            value: "bodyconcern",
            label: "Body concern",
            leftBar: false,
            list: DataBodyConcern,
            prefix: "bodyconcern",
            getLabel: (row) => row.bodyconcern,
          },
        ],
      },
      {
        key: "hairconcern",
        title: "Hair concern",
        items: [
          {
            value: "hairconcern",
            label: "Hair concern",
            leftBar: false,
            list: DataHairConcern,
            prefix: "hairconcern",
            getLabel: (row) => row.hairconcern,
          },
        ],
      },
    ],
    [selectedFilters],
  );

  const sections = useMemo(() => {
    const roots = Array.isArray(categoryTypes) ? categoryTypes : [];
    if (roots.length === 0) return [];

    return roots.map((root) => {
      const children = Array.isArray(root?.children) ? root.children : [];

      const source = children.length ? children : [root];
      const list = source.flatMap((child) => {
        const grand = Array.isArray(child?.children) ? child.children : [];

        return grand.length
          ? grand.map((g) => ({ id: g.id, label: g.name }))
          : [{ id: child.id, label: child.name }];
      });

      return {
        key: `cat-root-${root.id}`,
        title: root?.name || "Category",
        list,
      };
    });
  }, [categoryTypes, selectedFilters]);
  return (
    <div className={`flex-row space-y-6 h-full max-w-75 ${className}`}>
      {showBrandFilter && (
        <NestedSection
          title="Shop by brand"
          items={[
            {
              value: "brand-list",
              label: "Brand",
              leftBar: false,
              render: () => (
                <div className="TitleCat-4 flex-row w-full space-y-2 justify-between">
                  <TxtField
                    placeholder="Search brand here..."
                    iconLeftName="MagnifyingGlass"
                    variant="outline"
                    className="w-full"
                    value={brandSearch ?? ""}
                    onChange={(e) => setBrandSearch(e.target.value)}
                  />

                  <div>
                    {brandSearch && (
                      <Button
                        variant="tertiary"
                        size="sm"
                        onClick={() => setBrandSearch("")}
                      >
                        Clear
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 w-full py-2 px-1 h-auto max-h-64 overflow-y-auto custom-scrollbar">
                    {filteredBrands.length === 0 ? (
                      <div>brand tidak ditemukan</div>
                    ) : (
                      filteredBrands.map((item) => {
                        const uniqueId = `brand-${item.id}`;
                        const isActive = selectedFilters.includes(uniqueId);
                        return (
                          <Chip
                            key={item.id}
                            label={item.brandname || item.name}
                            onClick={() => handleSelect("brand", item.id)}
                            isActive={isActive}
                          >
                            {item.brandname || item.name}
                          </Chip>
                        );
                      })
                    )}
                  </div>
                </div>
              ),
            },
          ]}
        />
      )}

      <NestedSection
        title={`Shop by category${catLoading ? " (loading...)" : ""}`}
        items={[
          {
            value: "category-list",
            label: "Category",
            leftBar: false,
            render: () => (
              <div className="TitleCat-1 flex-row w-full space-y-4">
                {catLoading ? null : sections.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    No categories found
                  </div>
                ) : (
                  <Accordion type="single" collapsible className="space-y-2">
                    {sections.map((section) => (
                      <AccordionItem key={section.key} value={section.key}>
                        <AccordionTrigger className="text-xs font-medium">
                          <span>{section.title}</span>
                          <FaChevronDown className="h-3 w-3 text-neutral-400" />
                        </AccordionTrigger>
                        <AccordionContent>
                          <SubList
                            data={section.list || []}
                            prefix="category_type"
                            selectedFilters={selectedFilters}
                            onSelect={handleSelect}
                          />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            ),
          },
        ]}
      />

      <NestedSection
        title="By price"
        items={[
          {
            value: "price-range",
            label: "Price range",
            leftBar: false,
            render: () => (
              <div className="TitleCat-2 flex-row w-full space-y-4">
                <div className="Price flex-row w-full space-y-2 items-center">
                  <div className="textfieldmin w-full">
                    <TooltipProvider>
                      <Tooltip open={showTooltipMin}>
                        <TooltipTrigger asChild>
                          <TxtField
                            label="minimum price"
                            value={formatToRupiah(minPrice)}
                            onChange={(e) => handleChangePrice(e, "min")}
                            placeholder="Rp.0"
                            variant="outline"
                            className="w-full"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>You can only enter a number</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="textfieldmax w-full">
                    <TooltipProvider>
                      <Tooltip open={showTooltipMax}>
                        <TooltipTrigger asChild>
                          <TxtField
                            label="maximum price"
                            value={formatToRupiah(maxPrice)}
                            onChange={(e) => handleChangePrice(e, "max")}
                            placeholder="Rp.0"
                            variant="outline"
                            className="w-full"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>You can only enter a number</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            ),
          },
        ]}
      />

      <div className="TitleCat-3 flex-row w-full space-y-2">
        <h3 className="w-36.5 font-medium text-base">By concern</h3>
        <Accordion type="single" collapsible className="space-y-2">
          {concern_sections.map((section) => {
            const entry = section.items?.[0];
            return (
              <AccordionItem key={section.key} value={section.key}>
                <AccordionTrigger className="text-xs font-medium">
                  <span>{section.title}</span>
                  <FaChevronDown className="h-3 w-3 text-neutral-400" />
                </AccordionTrigger>
                <AccordionContent>
                  <SubList
                    data={entry?.list || []}
                    prefix={entry?.prefix}
                    selectedFilters={selectedFilters}
                    onSelect={handleSelect}
                  />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      <NestedSection
        title="By rating"
        items={[
          {
            value: "rating-list",
            label: "Rating",
            leftBar: false,
            render: () => (
              <div className="TitleCat-5 flex-row w-full space-x-4 justify-between items-center">
                <div className="flex flex-wrap gap-4 w-full py-2 px-1">
                  {DataRating.map((item) => {
                    const uniqueId = `rating-${item.id}`;
                    const isActive = selectedFilters.includes(uniqueId);
                    return (
                      <Chip
                        key={item.id}
                        label={item.star}
                        onClick={() => handleSelect("rating", item.id)}
                        isActive={isActive}
                      >
                        {item.star}
                      </Chip>
                    );
                  })}
                </div>
              </div>
            ),
          },
        ]}
      />
      {/* Reset */}
      <div className="w-auto flex justify-between space-x-4">
        <Button
          onClick={handleReset}
          variant="primary"
          size="sm"
          disabled={
            selectedFilters.length === 0 &&
            !minPrice &&
            !maxPrice &&
            !brandSearch
          }
        >
          Reset filter
        </Button>
      </div>
    </div>
  );
}
