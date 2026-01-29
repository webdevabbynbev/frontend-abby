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

// ⬅️ PENTING: async dispatch (hindari setState saat render)
export const notifyCartUpdated = () => {
  if (typeof window === "undefined") return;
  queueMicrotask(() => {
    window.dispatchEvent(new CustomEvent("cart:updated"));
  });
};

export const updateCartCache = (items = []) => {
  writeCartCache(items);
  notifyCartUpdated();
};

export const countCartItems = (items = []) => {
  console.log('🧮 countCartItems called with', items.length, 'items');
  
  // Count number of unique items, not total quantity
  const result = Array.isArray(items) ? items.length : 0;
  
  console.log('🧮 Total unique items:', result);
  return result;
};
