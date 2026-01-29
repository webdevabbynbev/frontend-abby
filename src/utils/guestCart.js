/**
 * Guest Cart Storage Utility
 * Manages cart for users who are not logged in using localStorage
 */

const GUEST_CART_KEY = "abby_guest_cart";

export const getGuestCart = () => {
  if (typeof window === "undefined") return [];
  try {
    const cart = localStorage.getItem(GUEST_CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
};

export const saveGuestCart = (cart) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  } catch (error) {
    // Failed to save guest cart
  }
};

export const addToGuestCart = (product, variant, quantity = 1) => {
  const cart = getGuestCart();
  
  // Generate temporary ID for guest cart items
  const tempId = Date.now() + Math.random();
  
  // Check if item already exists (same product and variant)
  const existingIndex = cart.findIndex(
    (item) =>
      item.product?.id === product?.id &&
      item.variant?.id === variant?.id
  );

  if (existingIndex >= 0) {
    // Update quantity
    cart[existingIndex].qty = (cart[existingIndex].qty || 0) + quantity;
  } else {
    // Add new item
    const newItem = {
      id: tempId,
      product,
      variant,
      variant_id: variant?.id,
      qty: quantity,
      unit_price: variant?.price || product?.price || 0,
      isGuest: true,
    };
    cart.push(newItem);
  }

  saveGuestCart(cart);
  
  // Verify save
  const savedCart = getGuestCart();
  
  return cart;
};

export const updateGuestCartItem = (itemId, updates) => {
  const cart = getGuestCart();
  const index = cart.findIndex((item) => item.id === itemId);
  
  if (index >= 0) {
    cart[index] = { ...cart[index], ...updates };
    saveGuestCart(cart);
  }
  
  return cart;
};

export const removeFromGuestCart = (itemId) => {
  const cart = getGuestCart();
  const filtered = cart.filter((item) => item.id !== itemId);
  saveGuestCart(filtered);
  return filtered;
};

export const clearGuestCart = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_CART_KEY);
};

export const getGuestCartCount = () => {
  const cart = getGuestCart();
  return cart.reduce((total, item) => total + (item.qty || 0), 0);
};

export const getGuestCartTotal = () => {
  const cart = getGuestCart();
  return cart.reduce((total, item) => {
    const price = item.unit_price || item.variant?.price || item.product?.price || 0;
    const qty = item.qty || 0;
    return total + (price * qty);
  }, 0);
};
