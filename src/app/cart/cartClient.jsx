"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "@/lib/axios.js";
import {
  MobileCartActionBar,
  Button,
  QuantityInput,
  Checkbox,
} from "@/components";
import { formatToRupiah } from "@/utils";
import { getImageUrl } from "@/utils/getImageUrl";

const STORAGE_KEY = "checkout_selected_ids";

export default function CartClient({ initialCart }) {
  const router = useRouter();

  const [cart, setCart] = useState(
    Array.isArray(initialCart) ? initialCart : []
  );
  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingItemId, setLoadingItemId] = useState(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const toNumber = (v, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const safeCart = Array.isArray(cart) ? cart : [];

  const getQuantity = (item) =>
    toNumber(item?.qtyCheckout ?? item?.qty ?? item?.quantity ?? 0, 0);

  const getUnitPrice = (item) =>
    toNumber(
      item?.unit_price ??
        item?.unitPrice ??
        item?.price ??
        item?.product?.price ??
        0,
      0
    );

  const getLineTotal = (item, qty = getQuantity(item)) => {
    const amount = Number(item?.amount);
    if (Number.isFinite(amount)) return amount;
    return getUnitPrice(item) * toNumber(qty, 0);
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed))
        setSelectedIds(parsed.map(Number).filter(Boolean));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds));
    } catch {}
  }, [selectedIds]);

  useEffect(() => {
    const idsInCart = new Set(
      safeCart.map((x) => Number(x?.id)).filter(Boolean)
    );
    setSelectedIds((prev) =>
      prev.map(Number).filter((id) => idsInCart.has(id))
    );
  }, [safeCart]);

  const allIds = useMemo(
    () => safeCart.map((x) => Number(x?.id)).filter(Boolean),
    [safeCart]
  );

  const selectedCount = selectedIds.length;

  const selectedSubtotal = useMemo(() => {
    const set = new Set(selectedIds.map(Number));
    return safeCart
      .filter((item) => set.has(Number(item?.id)))
      .reduce((sum, item) => sum + getLineTotal(item), 0);
  }, [safeCart, selectedIds]);

  const allSelected = allIds.length > 0 && selectedIds.length === allIds.length;

  const isSelected = useCallback(
    (item) => selectedIds.includes(Number(item?.id)),
    [selectedIds]
  );

  const toggleSelect = useCallback((itemId, checked) => {
    const id = Number(itemId);
    if (!id) return;

    setSelectedIds((prev) => {
      const s = new Set(prev.map(Number));
      checked ? s.add(id) : s.delete(id);
      return Array.from(s);
    });
  }, []);

  const toggleSelectAll = useCallback(
    (checked) => setSelectedIds(checked ? allIds : []),
    [allIds]
  );

  const handleUpdateQty = useCallback(
    async (item, nextQty) => {
      if (!item?.id) return;

      const newQty = toNumber(nextQty, 0);
      if (newQty <= 0) return;

      const prevCart = cart;

      setCart((prev) =>
        prev.map((x) =>
          Number(x.id) === Number(item.id)
            ? {
                ...x,
                qty: newQty,
                quantity: newQty,
                qtyCheckout: newQty,
                amount: getUnitPrice(x) * newQty,
              }
            : x
        )
      );

      try {
        setLoadingItemId(Number(item.id));
        const res = await axios.put(`/cart/${item.id}`, { qty: newQty });
        const updated =
          res?.data?.data?.item || res?.data?.data || res?.data?.serve || null;
        if (updated?.id) {
          setCart((prev) =>
            prev.map((x) =>
              Number(x.id) === Number(updated.id) ? { ...x, ...updated } : x
            )
          );
        }
      } catch {
        setCart(prevCart);
      } finally {
        setLoadingItemId(null);
      }
    },
    [cart]
  );

  const handleDelete = useCallback(
    async (item) => {
      if (!item?.id) return;
      if (!window.confirm("Hapus produk ini dari keranjang?")) return;

      const prevCart = cart;

      setCart((prev) => prev.filter((x) => Number(x?.id) !== Number(item.id)));
      setSelectedIds((prev) =>
        prev.filter((id) => Number(id) !== Number(item.id))
      );

      try {
        setLoadingItemId(Number(item.id));
        await axios.delete(`/cart/${item.id}`);
      } catch {
        setCart(prevCart);
      } finally {
        setLoadingItemId(null);
      }
    },
    [cart]
  );

  const handleCheckout = useCallback(async () => {
    if (selectedCount === 0) return;

    const selected = selectedIds.map(Number).filter(Boolean);
    const selectedSet = new Set(selected);
    const unselected = allIds.filter((id) => !selectedSet.has(id));

    try {
      setLoadingCheckout(true);

      await Promise.all([
        axios.post("/cart/update-selection", {
          cart_ids: selected,
          is_checkout: 2,
        }),
        axios.post("/cart/update-selection", {
          cart_ids: unselected,
          is_checkout: 1,
        }),
      ]);

      router.push("/checkout");
    } finally {
      setLoadingCheckout(false);
    }
  }, [selectedCount, selectedIds, allIds, router]);

  return (
    <div className="mx-auto px-4 w-auto py-10 lg:max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          {safeCart.map((item, idx) => {
            const id = item?.id;
            const product = item.product || {};

            const variantImages = Array.isArray(item?.variant?.images)
              ? item.variant.images
              : Array.isArray(item?.variant?.medias)
              ? item.variant.medias.map((m) => m?.url).filter(Boolean)
              : [];

            const imageUrl = getImageUrl(
              variantImages[0] ||
                item?.variant?.media?.url ||
                product.thumbnail ||
                product.image
            );

            const quantity = getQuantity(item);
            const busy = loadingItemId === Number(id);

            return (
              <div
                key={id ?? `tmp-${idx}`}
                className="flex justify-between items-center border-b pb-4 mb-4"
              >
                <div className="flex gap-3 items-start">
                  <Checkbox
                    className="mt-2 w-4 h-4"
                    checked={!!id && isSelected(item)}
                    disabled={!id || busy || loadingCheckout}
                    onCheckedChange={(checked) =>
                      id && toggleSelect(id, checked === true)
                    }
                  />

                  <div className="flex gap-4">
                    <Image
                      src={imageUrl}
                      width={60}
                      height={60}
                      alt={product.name || "-"}
                      className="rounded-sm"
                      onError={(e) => {
                        e.currentTarget.src = getImageUrl(null);
                      }}
                    />

                    <div>
                      <p className="line-clamp-1">
                        {product.name || "-"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Variant:{" "}
                        {item?.variant?.name ||
                          item?.variant?.sku ||
                          "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <QuantityInput
                    min={1}
                    value={quantity}
                    disabled={busy || loadingCheckout}
                    onChange={(newQty) =>
                      handleUpdateQty(item, newQty)
                    }
                  />
                  <p className="font-semibold text-primary-700">
                    {formatToRupiah(getLineTotal(item, quantity))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="hidden lg:block bg-white border rounded-2xl p-6">
          <Button
            variant="primary"
            size="lg"
            onClick={handleCheckout}
            disabled={selectedCount === 0 || loadingCheckout}
            className="w-full"
          >
            {loadingCheckout
              ? "Processing..."
              : `Checkout (${selectedCount})`}
          </Button>
        </div>
      </div>

      <MobileCartActionBar
        allSelected={allSelected}
        selectedCount={selectedCount}
        subtotal={selectedSubtotal}
        loadingCheckout={loadingCheckout}
        onToggleSelectAll={toggleSelectAll}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
