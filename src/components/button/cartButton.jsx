"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios.js";
import Link from "next/link";
import { BtnIcon } from "..";
import { countCartItems, readCartCache, updateCartCache } from "@/utils/cartCache";

export default function CartButton() {
  const [totalQty, setTotalQty] = useState(0);

  const loadCartCount = async () => {
    try {
      const res = await axios.get("/cart");
      const items = res.data?.data?.items || res.data?.data || res.data?.serve || [];
      const list = Array.isArray(items) ? items : [];
      if (list.length > 0) {
        updateCartCache(list);
        setTotalQty(countCartItems(list));
      } else {
        const cached = readCartCache();
        setTotalQty(countCartItems(cached));
      }
    } catch (err) {
      console.log("Error load cart:", err);
      const cached = readCartCache();
      setTotalQty(countCartItems(cached));
    }
  };

  useEffect(() => {
    loadCartCount();

    const handleCartUpdated = () => {
      const cached = readCartCache();
      setTotalQty(countCartItems(cached));
    };

    window.addEventListener("cart:updated", handleCartUpdated);
    window.addEventListener("storage", handleCartUpdated);
    return () => {
      window.removeEventListener("cart:updated", handleCartUpdated);
      window.removeEventListener("storage", handleCartUpdated);
    };
  }, []);

  return (
    <Link href="/cart" className="relative inline-flex items-center">
      <BtnIcon iconName="BasketShopping" variant="tertiary" size="sm" />

      {totalQty > 0 && (
        <span className="
          absolute -top-2 -right-2 
          bg-pink-600 text-white text-xs
          px-2 py-[1px] rounded-full
        ">
          {totalQty}
        </span>
      )}
    </Link>
  );
}