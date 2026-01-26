const CART_CACHE_KEY = "guest_cart_items_v1";

export const readCartCache = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const writeCartCache = (items = []) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_CACHE_KEY, JSON.stringify(items));
  } catch {}
};

export const notifyCartUpdated = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("cart:updated"));
};

export const updateCartCache = (items = []) => {
  writeCartCache(items);
  notifyCartUpdated();
};

export const countCartItems = (items = []) =>
  (Array.isArray(items) ? items : []).reduce((sum, item) => {
    const qty = Number(item?.qty ?? item?.quantity ?? item?.qtyCheckout ?? 0);
    return sum + (Number.isFinite(qty) ? qty : 0);
  }, 0);
