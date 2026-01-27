"use client";

import { createContext, useContext, useState, useEffect } from "react";

const WishlistsContext = createContext();

export function WishlistsProvider({ children }) {
  const [Wishlists, setWishlists] = useState([]);

  // Load Wishlists dari localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("Wishlists");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setWishlists(parsed);
        }
      }
    } catch (e) {
      console.log("Wishlists parse error:", e);
    }
  }, []);

  // Save Wishlists to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("Wishlists", JSON.stringify(Wishlists));
    } catch (e) {
      console.log("Wishlists save error:", e);
    }
  }, [Wishlists]);

  const addToWishlists = (productId) => {
    setWishlists((prev) => {
      const exists = prev.some((id) => id === productId);
      if (exists) return prev.filter((id) => id !== productId);
      return [...prev, productId];
    });
  };

  const isWishlistsed = (productId) => Wishlists.some((id) => id === productId);

  return (
    <WishlistsContext.Provider value={{ Wishlists, addToWishlists, isWishlistsed }}>
      {children}
    </WishlistsContext.Provider>
  );
}

export function useWishlists() {
  const context = useContext(WishlistsContext);
  if (!context) {
    throw new Error("useWishlists must be used within WishlistsProvider");
  }
  return context;
}
