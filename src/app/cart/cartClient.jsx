"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "@/lib/axios";
import {
  MobileCartActionBar,
  Button,
  QuantityInput,
  Checkbox,
} from "@/components";
import { formatToRupiah } from "@/utils";
import { getImageUrl } from "@/utils/getImageUrl";
import { readCartCache, updateCartCache } from "@/utils/cartCache";

export default function CartClient({ initialCart = [] }) {
  const router = useRouter();

  const [cart, setCart] = useState(
    Array.isArray(initialCart) ? initialCart : [],
  );
  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingItemId, setLoadingItemId] = useState(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const safeCart = Array.isArray(cart) ? cart : [];

  /* =========================
   * SYNC CART CACHE (FINAL)
   * ========================= */
  useEffect(() => {
    updateCartCache(safeCart);
  }, [safeCart]);

  /* =========================
   * LOAD CART ON MOUNT
   * ========================= */
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await axios.get("/cart");
        const items =
          res?.data?.data?.items ||
          res?.data?.data ||
          res?.data?.serve ||
          [];

        if (active && Array.isArray(items)) {
          setCart(items);
        }
      } catch {
        if (active) {
          setCart(readCartCache());
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  /* =========================
   * HELPERS
   * ========================= */
  const toNumber = (v, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const getQuantity = (item) =>
    toNumber(item?.qtyCheckout ?? item?.qty ?? item?.quantity ?? 0);

  const getUnitPrice = (item) =>
    toNumber(
      item?.unit_price ??
        item?.unitPrice ??
        item?.price ??
        item?.product?.price ??
        0,
    );

  const getLineTotal = (item) =>
    getUnitPrice(item) * getQuantity(item);

  /* =========================
   * SELECTION LOGIC
   * ========================= */
  const allIds = useMemo(
    () => safeCart.map((x) => Number(x?.id)).filter(Boolean),
    [safeCart],
  );

  const toggleSelect = useCallback((id, checked) => {
    setSelectedIds((prev) => {
      const set = new Set(prev);
      checked ? set.add(id) : set.delete(id);
      return Array.from(set);
    });
  }, []);

  const toggleSelectAll = useCallback(
    (checked) => setSelectedIds(checked ? allIds : []),
    [allIds],
  );

  const selectedSubtotal = useMemo(() => {
    const set = new Set(selectedIds);
    return safeCart
      .filter((item) => set.has(Number(item.id)))
      .reduce((sum, item) => sum + getLineTotal(item), 0);
  }, [safeCart, selectedIds]);

  /* =========================
   * UPDATE QTY (OPTIMISTIC)
   * ========================= */
  const handleUpdateQty = useCallback(async (item, nextQty) => {
    const id = Number(item?.id);
    if (!id || nextQty <= 0) return;

    setCart((prev) =>
      prev.map((x) =>
        Number(x.id) === id
          ? {
              ...x,
              qty: nextQty,
              quantity: nextQty,
              qtyCheckout: nextQty,
            }
          : x,
      ),
    );

    try {
      setLoadingItemId(id);
      await axios.put(`/cart/${id}`, { qty: nextQty });
    } finally {
      setLoadingItemId(null);
    }
  }, []);

  /* =========================
   * DELETE ITEM
   * ========================= */
  const handleDelete = useCallback(async (item) => {
    const id = Number(item?.id);
    if (!id) return;

    setCart((prev) => prev.filter((x) => Number(x.id) !== id));

    try {
      await axios.delete(`/cart/${id}`);
    } catch {}
  }, []);

  /* =========================
   * CHECKOUT
   * ========================= */
  const handleCheckout = useCallback(async () => {
    if (!selectedIds.length) return;

    try {
      setLoadingCheckout(true);
      await axios.post("/cart/update-selection", {
        cart_ids: selectedIds,
        is_checkout: 2,
      });
      router.push("/checkout");
    } finally {
      setLoadingCheckout(false);
    }
  }, [selectedIds, router]);

  /* =========================
   * RENDER
   * ========================= */
  return (
    <div className="mx-auto px-4 py-10 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div className="bg-white border rounded-xl p-6">
          {safeCart.map((item) => (
            <div key={item.id} className="flex justify-between border-b pb-4 mb-4">
              <Checkbox
                checked={selectedIds.includes(Number(item.id))}
                onCheckedChange={(v) =>
                  toggleSelect(Number(item.id), v === true)
                }
              />

              <div className="flex gap-4">
                <Image
                  src={getImageUrl(item?.product?.image)}
                  width={60}
                  height={60}
                  alt=""
                />
                <div>
                  <p>{item?.product?.name}</p>
                  <QuantityInput
                    value={getQuantity(item)}
                    onChange={(v) => handleUpdateQty(item, v)}
                  />
                </div>
              </div>

              <p className="font-bold text-primary-700">
                {formatToRupiah(getLineTotal(item))}
              </p>
            </div>
          ))}
        </div>

        <Button
          disabled={!selectedIds.length || loadingCheckout}
          onClick={handleCheckout}
        >
          Checkout ({selectedIds.length})
        </Button>
      </div>

      <MobileCartActionBar
        allSelected={selectedIds.length === allIds.length}
        subtotal={selectedSubtotal}
        onToggleSelectAll={toggleSelectAll}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
