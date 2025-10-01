"use client";
import clsx from "clsx";
import { useState } from "react";
import { FaBriefcase } from "react-icons/fa";
import { BtnIcon, Button, Chip } from ".";
import Link from "next/link";

export function AddressCard({selectedCard = true}) {

  const [active, setActive] = useState(false);


  return (
    <div className="bg-white rounded-xl flex-row space-y-4 p-4 w-full">
      <div className="flex justify-between space-x-0">
        <div className="flex items-center justify-between space-x-2 text-neutral-950">
          <FaBriefcase />
          <span className="text-sm font-bold">Office</span>
        </div>
        <Button variant="primary" size="sm">
          Choose
        </Button>
      </div>
      <div className="flex-row space-y-2 p-4 bg-neutral-50 rounded-xl border-1 border-neutral-100">
        <div className="text space-y-2">
          <h3 className="title">SJA Textile</h3>
          <span className="text-neutral-500 text-sm">
            <p>Jalan Jendral Soedirman no.xx kec.cc kel.dd</p>
            <p>Bandung</p>
            <p>40231</p>
          </span>
        </div>
        <div className="phone-number text-sm">0877283612387</div>
      </div>
      <div className="flex w-full items-center justify-start space-x-4">
      <Chip isActive={active} onClick={() => setActive((prev) => !prev)}>
        {active ? "Main address" : "Set as main address"}
      </Chip>
      <Button variant="tertiary" size="sm">Edit address</Button>
      <Button variant="tertiary" size="sm">Delete</Button>
      </div>
    </div>
  );
}
