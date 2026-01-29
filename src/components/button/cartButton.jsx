"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios.js";
import Link from "next/link";
import { BtnIcon } from "..";
import { countCartItems, readCartCache, updateCartCache } from "@/utils/cartCache";

export default function CartButton() {
  const [totalQty, setTotalQty] = useState(0);

  const loadCartCount = async () => {
    console.log('🔵 loadCartCount called');
    try {
      const res = await axios.get("/cart");
      const items = res.data?.serve?.data || res.data?.data?.items || res.data?.data || [];
      const list = Array.isArray(items) ? items : [];
      console.log('🔢 Cart badge: loaded', list.length, 'items from API');
      console.log('📊 Items:', list.map(item => ({ id: item.id, qty: item.qty, quantity: item.quantity })));
      
      if (list.length > 0) {
        updateCartCache(list);
        const count = countCartItems(list);
        console.log('✅ Setting totalQty to:', count);
        setTotalQty(count);
      } else {
        const cached = readCartCache();
        console.log('🔢 Cart badge: using cached', cached.length, 'items');
        const count = countCartItems(cached);
        console.log('✅ Setting totalQty to:', count);
        setTotalQty(count);
      }
    } catch (err) {
      console.log("Error load cart:", err);
      const cached = readCartCache();
      console.log('🔢 Cart badge: error, using cached', cached.length, 'items');
      const count = countCartItems(cached);
      console.log('✅ Setting totalQty to:', count);
      setTotalQty(count);
    }
  };

  useEffect(() => {
    loadCartCount();

    const handleCartUpdated = () => {
      console.log('🔔 Cart updated event received');
      const cached = readCartCache();
      console.log('� Cached items:', cached.map(item => ({ id: item.id || item.cart_id, qty: item.qty || item.quantity })));
      const count = countCartItems(cached);
      console.log('🔢 Cart badge updated from cache:', cached.length, 'items, total qty:', count);
      console.log('✅ Setting totalQty to:', count);
      setTotalQty(count);
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