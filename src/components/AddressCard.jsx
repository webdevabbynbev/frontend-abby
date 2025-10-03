"use client";
import { useState } from "react";
import { FaBriefcase } from "react-icons/fa6";
import { Button, Chip } from ".";

export function AddressCard({ label, line, city, province, postalCode, phone, isActive }) {
  const [active, setActive] = useState(!!isActive);

  return (
    <div className="bg-white rounded-xl space-y-4 p-4 w-full">
      <div className="flex justify-between">
        <div className="flex items-center gap-2 text-neutral-950">
          <FaBriefcase />
          <span className="text-sm font-bold">{label}</span>
        </div>
        <Button variant="primary" size="sm">Choose</Button>
      </div>

      <div className="space-y-2 p-4 bg-muted rounded-xl border">
        <div className="space-y-2">
          <h3 className="title">{label}</h3>
          <span className="text-neutral-500 text-sm block">
            <p>{line || "—"}</p>
            <p>{[city, province].filter(Boolean).join(", ") || "—"}</p>
            <p>{postalCode || "—"}</p>
          </span>
        </div>
        <div className="text-sm">{phone || "—"}</div>
      </div>

      <div className="flex gap-4">
        <Chip isActive={active} onClick={() => setActive((p) => !p)}>
          {active ? "Main address" : "Set as main address"}
        </Chip>
        <Button variant="tertiary" size="sm">Edit address</Button>
        <Button variant="tertiary" size="sm">Delete</Button>
      </div>
    </div>
  );
}
