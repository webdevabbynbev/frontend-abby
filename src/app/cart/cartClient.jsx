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
  const [deletingItemId, setDeletingItemId] = useState(null);

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
          res?.data?.data?.items || res?.data?.data || res?.data?.serve || [];

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
  const getStock = (item) => {
    // Lucid Model stores actual data in $attributes or $original
    const stock = 
      Number(item?.variant?.$attributes?.stock) || 
      Number(item?.variant?.$original?.stock) ||
      Number(item?.variant?.stock) ||
      Number(item?.product?.$attributes?.stock) ||
      Number(item?.product?.$original?.stock) ||
      Number(item?.product?.stock);
    
    if (Number.isFinite(stock) && stock >= 0) return stock;
    
    // Fallback
    const candidates = [
      item?.stock,
      item?.available_stock,
      item?.stock_quantity,
      item?.max_stock,
      item?.maxStock,
    ];

    for (const v of candidates) {
      const n = Number(v);
      if (Number.isFinite(n) && n >= 0) return n;
    }
    return 0;
  };

  const toNumber = (v, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const getQuantity = (item) =>
    toNumber(item?.qtyCheckout ?? item?.qty ?? item?.quantity ?? 0);

  const getMaxQty = (item) => {
    // Gunakan getStock untuk consistency
    const stock = getStock(item);
    if (stock > 0) return stock;
    
    // Fallback ke maxStock candidates jika stock tidak ketemu
    const maxStock = toNumber(
      item?.max_stock ??
        item?.maxStock ??
        item?.product?.max_stock ??
        item?.product?.maxStock ??
        0,
      0,
    );
    if (maxStock > 0) return maxStock;
    return 100;
  };

  const getUnitPrice = (item) =>
    toNumber(
      item?.unit_price ??
        item?.unitPrice ??
        item?.price ??
        item?.product?.price ??
        0,
    );

  const getLineTotal = (item) => getUnitPrice(item) * getQuantity(item);

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

  const totalSubtotal = useMemo(
    () => safeCart.reduce((sum, item) => sum + getLineTotal(item), 0),
    [safeCart],
  );

  useEffect(() => {
    // Sync selectedIds ketika cart berubah - hapus item yang sudah tidak ada di cart
    const validIds = new Set(allIds);
    const syncedIds = selectedIds.filter((id) => validIds.has(id));
    if (syncedIds.length !== selectedIds.length) {
      setSelectedIds(syncedIds);
    }
  }, [safeCart, allIds]);

  /* =========================
   * UPDATE QTY (OPTIMISTIC)
   * ========================= */
  const handleUpdateQty = useCallback(async (item, nextQty) => {
    const id = Number(item?.id);
    if (!id || nextQty <= 0) return;

    const maxQty = getMaxQty(item);
    const currentQty = getQuantity(item);
    const safeQty = Math.max(1, Math.min(Math.floor(nextQty), maxQty));
    if (safeQty === currentQty) return;

    // Store previous state untuk rollback jika ada error
    const previousCart = cart;

    setCart((prev) =>
      prev.map((x) =>
        Number(x.id) === id
          ? {
              ...x,
              qty: safeQty,
              quantity: safeQty,
              qtyCheckout: safeQty,
            }
          : x,
      ),
    );

    try {
      setLoadingItemId(id);
      await axios.put(`/cart/${id}`, { qty: safeQty });
    } catch (error) {
      // Rollback state jika ada error
      setCart(previousCart);
      console.error("Error updating quantity:", error?.message);
    } finally {
      setLoadingItemId(null);
    }
  }, [cart]);

  /* =========================
   * DELETE ITEM
   * ========================= */
  const handleDelete = useCallback(async (item) => {
    const id = Number(item?.id);
    if (!id || deletingItemId === id) return;

    const productName = item?.product?.name || "Produk";
    const { toast } = await import("sonner");

    setDeletingItemId(id);

    // Show confirmation toast with action buttons (modal-like)
    toast.custom(
      (t) => (
        <div className="flex flex-col gap-3 bg-warning-50 p-4 rounded-lg border-2 border-warning-300 shadow-lg max-w-sm">
          <div className="flex gap-3 items-start">
            <div className="text-warning-600 text-xl flex-shrink-0 mt-0.5">⚠️</div>
            <div className="flex-1">
              <p className="font-semibold text-neutral-900">
                Hapus {productName}?
              </p>
              <p className="text-sm text-neutral-600 mt-1">
                Tindakan ini tidak dapat dibatalkan
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                toast.dismiss(t);
                setDeletingItemId(null);
              }}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              variant="error"
              size="md"
              onClick={async () => {
                toast.dismiss(t);
                // Optimistic UI - remove from list
                setCart((prev) => prev.filter((x) => Number(x.id) !== id));

                try {
                  await axios.delete(`/cart/${id}`);
                  toast.success(`${productName} berhasil dihapus`);
                } catch (error) {
                  // Rollback if delete fails
                  setCart((prev) => [...prev, item]);
                  toast.error("Gagal menghapus produk");
                } finally {
                  setDeletingItemId(null);
                }
              }}
              className="flex-1"
            >
              Hapus
            </Button>
          </div>
        </div>
      ),
      { 
        duration: Infinity,
        onClick: () => {
          toast.dismiss(t);
          setDeletingItemId(null);
        }
      }
    );
  }, [deletingItemId]);

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

  const displaySubtotal = selectedIds.length ? selectedSubtotal : totalSubtotal;
  /* =========================
   * RENDER
   * ========================= */
  return (
    <div className="mx-auto px-3 md:px-4 py-6 md:py-10 max-w-6xl pb-24 md:pb-10">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
            Keranjang Belanja
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {safeCart.length} produk
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3 bg-primary-50 px-4 py-2 rounded-lg border border-primary-100">
          <Checkbox
            checked={
              selectedIds.length > 0 && selectedIds.length === allIds.length
            }
            onCheckedChange={(v) => toggleSelectAll(v === true)}
          />
          <span className="text-sm font-medium text-neutral-700">Pilih semua</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-4">
          {safeCart.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 md:p-10 text-center text-neutral-500 shadow-sm">
              <p className="text-lg">😢 Keranjang kamu masih kosong</p>
              <p className="text-sm mt-2">Mulai belanja sekarang untuk menambahkan produk</p>
            </div>
          ) : (
            safeCart.map((item) => {
              const quantity = getQuantity(item);
              const maxQty = getMaxQty(item);
              const isBusy =
                loadingItemId !== null && loadingItemId === Number(item?.id);
              const productName =
                item?.product?.name || item?.product_name || "-";
              const variantName =
                item?.variant?.name ||
                item?.variant_name ||
                item?.variant?.sku ||
                "-";

              return (
                <div
                  key={item.id}
                  className="bg-white border border-gray-100 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow duration-150"
                >
                  {/* Mobile: Compact layout */}
                  <div className="md:hidden space-y-3">
                    {/* Checkbox + Image + Product Info */}
                    <div className="flex gap-3">
                      <Checkbox
                        checked={selectedIds.includes(Number(item.id))}
                        onCheckedChange={(v) =>
                          toggleSelect(Number(item.id), v === true)
                        }
                      />
                      <Image
                        src={getImageUrl(item?.product?.image)}
                        width={64}
                        height={64}
                        alt={productName}
                        className="rounded-lg border border-gray-100 object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-neutral-900 text-sm line-clamp-2">
                          {productName}
                        </p>
                        <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                          {variantName}
                        </p>
                        <p className="text-xs text-primary-700 font-semibold mt-1">
                          {formatToRupiah(getUnitPrice(item))}
                        </p>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-neutral-200" />

                    {/* Stock, Quantity, Price, Delete */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-500">
                          Stok: {getStock(item)}
                        </span>
                        <span className="text-sm font-bold text-primary-700">
                          {formatToRupiah(getLineTotal(item))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <QuantityInput
                          value={quantity}
                          min={1}
                          max={maxQty}
                          disabled={isBusy}
                          onChange={(v) => handleUpdateQty(item, v)}
                        />
                        <button
                          className="text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors disabled:opacity-50"
                          onClick={() => handleDelete(item)}
                          disabled={isBusy || deletingItemId === Number(item?.id)}
                          type="button"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop: Full layout */}
                  <div className="hidden md:block">
                    <div className="flex gap-4 items-start">
                      <Checkbox
                        checked={selectedIds.includes(Number(item.id))}
                        onCheckedChange={(v) =>
                          toggleSelect(Number(item.id), v === true)
                        }
                      />
                      <div className="flex gap-4 flex-1">
                        <Image
                          src={getImageUrl(item?.product?.image)}
                          width={80}
                          height={80}
                          alt={productName}
                          className="rounded-lg border border-gray-100 object-cover flex-shrink-0"
                        />
                        <div className="space-y-2 flex-1">
                          <p className="font-semibold text-neutral-900 line-clamp-2">
                            {productName}
                          </p>
                          <p className="text-xs text-neutral-500">
                            {variantName}
                          </p>
                          <p className="text-sm font-semibold text-primary-700">
                            {formatToRupiah(getUnitPrice(item))}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-4">
                        <QuantityInput
                          value={quantity}
                          min={1}
                          max={maxQty}
                          disabled={isBusy}
                          onChange={(v) => handleUpdateQty(item, v)}
                        />
                        <div className="text-right">
                          <p className="text-xs text-neutral-500">
                            Stok: {getStock(item)}
                          </p>
                          <p className="text-lg font-bold text-primary-700 mt-1">
                            {formatToRupiah(getLineTotal(item))}
                          </p>
                        </div>
                        <button
                          className="text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors disabled:opacity-50"
                          onClick={() => handleDelete(item)}
                          disabled={isBusy || deletingItemId === Number(item?.id)}
                          type="button"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="hidden lg:block">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm sticky top-20">
            <h2 className="text-lg font-bold text-neutral-900 mb-6">
              Ringkasan Belanja
            </h2>
            <div className="space-y-3 pb-6 border-b border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Produk dipilih</span>
                <span className="font-semibold text-neutral-900">{selectedIds.length} item</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-semibold text-neutral-900">{formatToRupiah(displaySubtotal)}</span>
              </div>
            </div>
            <Button
              className="w-full mt-6"
              disabled={!selectedIds.length || loadingCheckout}
              onClick={handleCheckout}
            >
              {loadingCheckout ? "Memproses..." : `Checkout (${selectedIds.length})`}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Summary & Checkout - Fixed at bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 safe-area-inset-bottom shadow-xl">
        <div className="mx-auto max-w-6xl space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">Subtotal ({selectedIds.length})</span>
            <span className="text-lg font-bold text-primary-700">
              {formatToRupiah(displaySubtotal)}
            </span>
          </div>
          <Button
            className="w-full"
            disabled={!selectedIds.length || loadingCheckout}
            onClick={handleCheckout}
          >
            {loadingCheckout ? "Memproses..." : "Checkout"}
          </Button>
        </div>
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
