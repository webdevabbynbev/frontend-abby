"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import {
  MobileCartActionBar,
  Button,
  Checkbox,
} from "@/components";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import { formatToRupiah } from "@/utils";
import { readCartCache, updateCartCache } from "@/utils/cartCache";
import {
  getGuestCart,
  saveGuestCart,
  removeFromGuestCart,
} from "@/utils/guestCart";
import {
  getQuantity,
  getLineTotal,
  extractProductId,
  extractProductSlug,
} from "@/utils/cartHelpers";

export default function CartClient({ initialCart = [] }) {
  const router = useRouter();
  const { user } = useAuth();
  const isGuest = !user;
  const hasLoadedRef = useRef(false); // Track if cart has been loaded

  // Don't use localStorage in initial state to avoid hydration mismatch
  // Use initialCart from SSR, then sync with localStorage in useEffect
  const [cart, setCart] = useState(() => {
    return Array.isArray(initialCart) ? initialCart : [];
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [loadingItemId, setLoadingItemId] = useState(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [productVariants, setProductVariants] = useState({});
  const [changingVariantId, setChangingVariantId] = useState(null);

  const safeCart = Array.isArray(cart) ? cart : [];

  /* =========================
   * FETCH VARIANTS FOR ALL CART PRODUCTS
   * ========================= */
  useEffect(() => {
    if (safeCart.length === 0) return;

    let active = true;

    (async () => {
      // Extract unique products with their slugs
      const uniqueProducts = [
        ...new Map(
          safeCart
            .map((item) => {
              const productId = extractProductId(item);
              const slug = extractProductSlug(item);
              return [productId, { productId, slug }];
            })
            .filter(([id]) => id),
        ).values(),
      ];

      const variantsData = {};

      await Promise.all(
        uniqueProducts.map(async ({ productId, slug }) => {
          try {
            if (!slug) {
              return;
            }

            const productRes = await axios.get(`/products/${slug}`);
            const variants = productRes?.data?.serve?.variantItems || [];
            variantsData[String(productId)] = variants;
          } catch (error) {
            // Error fetching variants
          }
        }),
      );

      if (active) {
        setProductVariants(variantsData);
      }
    })();

    return () => {
      active = false;
    };
  }, [safeCart.length]);

  /* =========================
   * SYNC CART CACHE (FINAL)
   * ========================= */
  useEffect(() => {
    // For guest users, sync to guest cart storage
    if (isGuest && typeof window !== "undefined") {
      saveGuestCart(safeCart);
      // Also update badge cache
      updateCartCache(safeCart);
    } else if (!isGuest && typeof window !== "undefined") {
      // For authenticated users, only update badge cache
      updateCartCache(safeCart);
    }
  }, [safeCart, isGuest]);

  /* =========================
   * LOAD CART ON MOUNT
   * ========================= */
  useEffect(() => {
    // Only load once
    if (hasLoadedRef.current) {
      return;
    }
    hasLoadedRef.current = true;

    let active = true;

    (async () => {
      // Guest users: load from localStorage
      if (isGuest) {
        const guestCart = getGuestCart();

        if (active) {
          setCart(guestCart);

          // Fetch variants for guest cart products
          if (guestCart.length > 0) {
            // Try multiple paths to get product_id
            const uniqueProductIds = [
              ...new Set(
                guestCart
                  .map(
                    (item) =>
                      item?.product?.id || item?.product_id || item?.productId,
                  )
                  .filter(Boolean),
              ),
            ];
            const variantsData = {};

            await Promise.all(
              uniqueProductIds.map(async (productId) => {
                try {
                  const productRes = await axios.get(`/products/${productId}`);
                  const variants = productRes?.data?.serve?.variantItems || [];
                  variantsData[productId] = variants;
                } catch (error) {
                  console.error(
                    `Error fetching variants for product ${productId}:`,
                    error,
                  );
                }
              }),
            );

            if (active) {
              setProductVariants(variantsData);
            }
          }
        }
        return;
      }

      // Authenticated users: load from API
      try {
        const res = await axios.get("/cart");
        const items =
          res?.data?.serve?.data ||
          res?.data?.data?.items ||
          res?.data?.data ||
          [];

        if (active && Array.isArray(items)) {
          setCart(items);

          // Fetch variants for each unique product
          // Try multiple paths to get product_id
          const uniqueProductIds = [
            ...new Set(
              items
                .map((item) => {
                  // Try variant first since that's where productId appears in Lucid Model
                  const id =
                    item?.variant?.$attributes?.productId ||
                    item?.variant?.$original?.productId ||
                    item?.variant?.productId ||
                    item?.product?.id ||
                    item?.product?.$attributes?.id ||
                    item?.product?.$original?.id ||
                    item?.product_id ||
                    item?.productId;
                  return id;
                })
                .filter(Boolean),
            ),
          ];
          const variantsData = {};

          await Promise.all(
            uniqueProductIds.map(async (productId) => {
              try {
                const productRes = await axios.get(`/products/${productId}`);
                const variants = productRes?.data?.serve?.variantItems || [];
                // Store ALL variants, even if just 1 or 0
                variantsData[productId] = variants;
              } catch (error) {
                // Error fetching variants
              }
            }),
          );

          if (active) {
            setProductVariants(variantsData);
          }
        }
      } catch (error) {
        const is401 = error?.response?.status === 401;

        if (active) {
          // Jika 401, tetap gunakan cache jangan clear
          const cachedCart = readCartCache();
          if (Array.isArray(cachedCart) && cachedCart.length > 0) {
            setCart(cachedCart);
          } else if (is401) {
            // Jika 401 dan cache kosong, kemungkinan user sudah logout
            // Redirect ke guest mode
            setCart([]);
          } else {
            setCart([]);
          }

          // Try to fetch variants even if cart API fails
          if (Array.isArray(cachedCart) && cachedCart.length > 0) {
            const uniqueProductIds = [
              ...new Set(
                cachedCart
                  .map(
                    (item) =>
                      item?.product?.id || item?.product_id || item?.productId,
                  )
                  .filter(Boolean),
              ),
            ];
            const variantsData = {};

            await Promise.all(
              uniqueProductIds.map(async (productId) => {
                try {
                  const productRes = await axios.get(`/products/${productId}`);
                  const variants = productRes?.data?.serve?.variantItems || [];
                  variantsData[productId] = variants;
                } catch (error) {
                  // Error fetching variants
                }
              }),
            );

            if (active) {
              setProductVariants(variantsData);
            }
          }
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []); // ⬅️ ONLY RUN ONCE on mount, don't re-run when isGuest changes

  /* =========================
   * LISTEN TO CART UPDATES (for guest users when adding products)
   * ========================= */
  useEffect(() => {
    if (!isGuest) return;

    const handleCartUpdate = () => {
      const guestCart = getGuestCart();
      setCart(guestCart);
    };

    window.addEventListener("cart:updated", handleCartUpdate);
    window.addEventListener("storage", handleCartUpdate);

    return () => {
      window.removeEventListener("cart:updated", handleCartUpdate);
      window.removeEventListener("storage", handleCartUpdate);
    };
  }, [isGuest]);

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
  
  const toggleSelectBrandGroup = useCallback((groupItems, checked) => {
    const groupItemIds = groupItems.map(item => Number(item.id));
    setSelectedIds((prev) => {
      const set = new Set(prev);
      if (checked) {
        // Add all group items to selection
        groupItemIds.forEach(id => set.add(id));
      } else {
        // Remove all group items from selection
        groupItemIds.forEach(id => set.delete(id));
      }
      return Array.from(set);
    });
  }, []);

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
  const handleUpdateQty = useCallback(
    async (item, nextQty) => {
      const id = Number(item?.id);
      if (!id || nextQty <= 0) return;

      const quantity = getQuantity(item);
      const safeQty = Math.max(1, Math.floor(nextQty));
      if (safeQty === quantity) return;

      const previousCart = cart;
      const updatedCart = cart.map((x) =>
        Number(x.id) === id
          ? { ...x, qty: safeQty, quantity: safeQty, qtyCheckout: safeQty }
          : x,
      );

      setCart(updatedCart);

      if (isGuest) {
        saveGuestCart(updatedCart);
        return;
      }

      try {
        setLoadingItemId(id);
        await axios.put(`/cart/${id}`, { qty: safeQty });
      } catch (error) {
        setCart(previousCart);
      } finally {
        setLoadingItemId(null);
      }
    },
    [cart, isGuest],
  );

  /* =========================
   * CHANGE VARIANT
   * ========================= */
  const handleChangeVariant = useCallback(
    async (cartItemId, newVariantId) => {
      const id = Number(cartItemId);
      if (!id || !newVariantId || changingVariantId === id) return;

      const previousCart = cart;
      const currentItem = cart.find((x) => Number(x.id) === id);
      if (!currentItem) return;

      const productId = extractProductId(currentItem);
      const variants = productVariants[String(productId)] || [];
      const newVariant = variants.find(
        (v) => Number(v.id) === Number(newVariantId),
      );

      if (!newVariant) return;

      const updatedCart = cart.map((x) =>
        Number(x.id) === id
          ? {
              ...x,
              variant_id: Number(newVariantId),
              variant: newVariant,
              unit_price: newVariant?.price || x.unit_price,
            }
          : x,
      );

      setCart(updatedCart);

      if (isGuest) {
        saveGuestCart(updatedCart);
        const { toast } = await import("sonner");
        toast.success("Varian berhasil diubah");
        return;
      }

      try {
        setChangingVariantId(id);

        const attributeValues =
          newVariant?.attribute_values || newVariant?.attributeValues || [];
        const attributes = attributeValues.map((av) => ({
          attribute_id: av.attribute_id || av.attributeId,
          value: av.value || av.name,
        }));

        const payload = {
          product_id: productId,
          variant_id: Number(newVariantId),
          qty: getQuantity(currentItem),
          attributes: attributes,
          is_buy_now: false,
        };

        await axios.put(`/cart/${id}`, payload);

        const { toast } = await import("sonner");
        toast.success("Varian berhasil diubah");
      } catch (error) {
        setCart(previousCart);
        const { toast } = await import("sonner");
        toast.error("Gagal mengubah varian");
      } finally {
        setChangingVariantId(null);
      }
    },
    [cart, productVariants, changingVariantId, isGuest],
  );

  /* =========================
   * DELETE ITEM
   * ========================= */
  const handleDelete = useCallback(
    async (item) => {
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
              <div className="text-warning-600 text-xl flex-shrink-0 mt-0.5">
                ⚠️
              </div>
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
                  const updatedCart = cart.filter((x) => Number(x.id) !== id);
                  setCart(updatedCart);

                  // Guest users: update localStorage
                  if (isGuest) {
                    saveGuestCart(updatedCart);
                    updateCartCache(updatedCart);
                    toast.success(`${productName} berhasil dihapus`);
                    setDeletingItemId(null);
                    return;
                  }

                  // Authenticated users: delete via API
                  try {
                    await axios.delete(`/cart/${id}`);
                    updateCartCache(updatedCart);
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
          },
        },
      );
    },
    [deletingItemId],
  );

  /* =========================
   * BULK DELETE
   * ========================= */
  const handleBulkDelete = useCallback(async () => {
    if (!selectedIds.length) return;

    const { toast } = await import("sonner");
    const itemCount = selectedIds.length;

    // Show confirmation toast with action buttons
    toast.custom(
      (t) => (
        <div className="flex flex-col gap-3 bg-warning-50 p-4 rounded-lg border-2 border-warning-300 shadow-lg max-w-sm">
          <div className="flex gap-3 items-start">
            <div className="text-warning-600 text-xl flex-shrink-0 mt-0.5">
              ⚠️
            </div>
            <div className="flex-1">
              <p className="font-semibold text-neutral-900">
                Hapus {itemCount} produk terpilih?
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

                // Optimistic UI - remove selected items from list
                const updatedCart = cart.filter(
                  (x) => !selectedIds.includes(Number(x.id)),
                );
                setCart(updatedCart);
                setSelectedIds([]);

                // Guest users: update localStorage
                if (isGuest) {
                  selectedIds.forEach((id) => {
                    removeFromGuestCart(id);
                  });
                  // Update cart cache to sync with guest cart
                  updateCartCache(updatedCart);
                  toast.success(`${itemCount} produk berhasil dihapus`);
                  return;
                }

                // Authenticated users: delete via API
                try {
                  await Promise.all(
                    selectedIds.map((id) => axios.delete(`/cart/${id}`)),
                  );
                  toast.success(`${itemCount} produk berhasil dihapus`);
                  updateCartCache(updatedCart);
                } catch (error) {
                  toast.error("Gagal menghapus beberapa produk");
                  // Reload cart on error
                  try {
                    const res = await axios.get("/cart");
                    const items =
                      res.data?.serve?.data ||
                      res.data?.data?.items ||
                      res.data?.data ||
                      [];
                    setCart(Array.isArray(items) ? items : []);
                  } catch (err) {
                    // Error reloading cart
                  }
                }
              }}
              className="flex-1"
            >
              Hapus
            </Button>
          </div>
        </div>
      ),
      { duration: Infinity },
    );
  }, [selectedIds, cart, isGuest]);

  /* =========================
   * CHECKOUT
   * ========================= */
  const handleCheckout = useCallback(async () => {
    if (!selectedIds.length) return;

    setLoadingCheckout(true);

    // Guest users: save selected items to localStorage and redirect
    if (isGuest) {
      const selectedItems = cart.filter((item) =>
        selectedIds.includes(Number(item.id)),
      );
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "abby_guest_checkout",
          JSON.stringify(selectedItems),
        );
      }
      router.push("/checkout?guest=true");
      setLoadingCheckout(false);
      return;
    }

    // Authenticated users: update selection via API
    try {
      await axios.post("/cart/update-selection", {
        cart_ids: selectedIds,
        is_checkout: 2,
      });
      router.push("/checkout");
    } finally {
      setLoadingCheckout(false);
    }
  }, [selectedIds, router, isGuest, cart]);

  const displaySubtotal = selectedIds.length ? selectedSubtotal : totalSubtotal;
  
  /* =========================
   * GROUP CART ITEMS BY BRAND
   * ========================= */
  const groupedCart = useMemo(() => {
    const groups = {};
    
    safeCart.forEach((item) => {
      // Extract brand from multiple possible paths
      const brandName = 
        item?.product?.brand?.name || 
        item?.brand?.name || 
        item?.product?.$attributes?.brand?.name ||
        item?.product?.$preloaded?.brand?.name ||
        "No Brand";
      const brandSlug = 
        item?.product?.brand?.slug || 
        item?.brand?.slug || 
        item?.product?.$attributes?.brand?.slug ||
        item?.product?.$preloaded?.brand?.slug ||
        null;
      
      if (!groups[brandName]) {
        groups[brandName] = {
          brandName,
          brandSlug,
          items: [],
        };
      }
      
      groups[brandName].items.push(item);
    });
    
    return Object.values(groups);
  }, [safeCart]);
  
  /* =========================
   * RENDER
   * ========================= */
  return (
    <div className="mx-auto px-3 md:px-4 py-6 md:py-10 max-w-6xl pb-24 md:pb-10">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-neutral-900">
            Keranjang Belanja
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {safeCart.length} produk
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg">
            <Checkbox
              checked={
                selectedIds.length > 0 && selectedIds.length === allIds.length
              }
              onCheckedChange={(v) => toggleSelectAll(v === true)}
            />
            <span className="text-sm font-medium text-neutral-700">
              Pilih semua
            </span>
          </div>
          <button
            onClick={handleBulkDelete}
            disabled={selectedIds.length === 0}
            className="flex items-center gap-2 bg-error-50 px-4 py-2 rounded-lg border border-error-100 hover:bg-error-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <i className="fa-solid fa-trash-can w-4 h-4 text-error-600"></i>
            <span className="text-sm font-medium text-neutral-700">
              Hapus {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-4">
          {safeCart.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 md:p-10 text-center text-neutral-500 shadow-sm">
              <p className="text-lg">😢 Keranjang kamu masih kosong</p>
              <p className="text-sm mt-2">
                Mulai belanja sekarang untuk menambahkan produk
              </p>
            </div>
          ) : (
            groupedCart.map((group, idx) => {
              // Check if all items in this group are selected
              const groupItemIds = group.items.map(item => Number(item.id));
              const allGroupSelected = groupItemIds.length > 0 && groupItemIds.every(id => selectedIds.includes(id));
              const someGroupSelected = groupItemIds.some(id => selectedIds.includes(id));
              
              return (
                <div key={group.brandName}>
                  {/* Single white container for all items from same brand */}
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-150 relative">
                    {/* Brand header with checkbox and badge */}
                    <div className="flex items-center gap-3 px-4 pt-4 pb-2">
                      <Checkbox
                        checked={allGroupSelected}
                        onCheckedChange={(v) => toggleSelectBrandGroup(group.items, v === true)}
                      />
                      {group.brandSlug ? (
                        <Link
                          href={`/brand/${group.brandSlug}`}
                          className="text-xs text-primary-600 hover:text-primary-700 font-semibold bg-primary-50 px-2 py-1 rounded transition-colors"
                        >
                          {group.brandName}
                        </Link>
                      ) : (
                        <div className="text-xs text-gray-600 font-semibold bg-gray-50 px-2 py-1 rounded">
                          {group.brandName}
                        </div>
                      )}
                    </div>
                    
                    {/* Items without individual containers */}
                    <div className="divide-y divide-gray-100">
                      {group.items.map((item) => (
                        <CartItem
                          key={item.id}
                          item={item}
                          isSelected={selectedIds.includes(Number(item.id))}
                          isBusy={loadingItemId === Number(item.id)}
                          isDeleting={deletingItemId === Number(item.id)}
                          isChangingVariant={changingVariantId === Number(item.id)}
                          productVariants={productVariants}
                          onToggleSelect={toggleSelect}
                          onUpdateQty={handleUpdateQty}
                          onChangeVariant={handleChangeVariant}
                          onDelete={handleDelete}
                          isGrouped={true}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="hidden lg:block">
          <CartSummary
            selectedCount={selectedIds.length}
            displaySubtotal={displaySubtotal}
            loadingCheckout={loadingCheckout}
            onCheckout={handleCheckout}
          />
        </div>
      </div>

      {/* Mobile Summary & Checkout - Fixed at bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 safe-area-inset-bottom shadow-xl">
        <div className="mx-auto max-w-6xl space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">
              Subtotal ({selectedIds.length})
            </span>
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
        selectedCount={selectedIds.length}
        subtotal={selectedSubtotal}
        loadingCheckout={loadingCheckout}
        onToggleSelectAll={toggleSelectAll}
        onCheckout={handleCheckout}
        onBulkDelete={handleBulkDelete}
      />
    </div>
  );
}
