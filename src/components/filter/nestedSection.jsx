"use client";
import React, { memo } from "react";
import clsx from "clsx";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components";
import { FaPlusCircle, FaMinusCircle, FaChevronDown } from "react-icons/fa";

function NestedSectionComponent({
  title,
  items = [],
  render,
  mode = "nested", // ⬅️ default aman
  outerClassName,
}) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <Accordion
      type="single"
      collapsible
      className={clsx(
        "rounded-2xl w-full bg-white px-4 transition-all outline-1 outline-neutral-100",
        outerClassName
      )}
    >
      <AccordionItem value={`sec-${title}`}>
        <AccordionTrigger className="flex justify-between items-center group">
          <span className="font-bold text-sm">{title}</span>
          <FaPlusCircle className="h-4 w-4 group-data-[state=open]:hidden text-primary-700" />
          <FaMinusCircle className="h-4 w-4 hidden group-data-[state=open]:block text-primary-700" />
        </AccordionTrigger>

        <AccordionContent>
          {/* MODE 1 — FLAT (Shop by brand) */}
          {mode === "flat" && render && (
            <div className="px-4">{render()}</div>
          )}

          {/* MODE 2 — NESTED (Category, Concern, Rating) */}
          {mode === "nested" && (
            <Accordion
              type="single"
              collapsible
              className="w-auto px-4 transition-all justify-between rounded-r-[12px] space-y-4"
            >
              {safeItems.map(({ value, label, leftBar = true, render }) => (
                <AccordionItem key={value} value={value}>
                  <AccordionTrigger className="relative">
                    {leftBar && (
                      <div className="absolute -left-4 h-full w-1 bg-primary-700" />
                    )}
                    <span className="text-xs">{label}</span>
                    <FaChevronDown className="h-3 w-3 text-neutral-400" />
                  </AccordionTrigger>
                  <AccordionContent>{render?.()}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export const NestedSection = memo(NestedSectionComponent);
