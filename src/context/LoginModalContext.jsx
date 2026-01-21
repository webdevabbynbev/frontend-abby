"use client";
import { createContext, useContext, useState, useCallback } from "react";

const LoginModalContext = createContext();

export function LoginModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openLoginModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <LoginModalContext.Provider value={{ isOpen, setIsOpen, openLoginModal, closeLoginModal }}>
      {children}
    </LoginModalContext.Provider>
  );
}

export function useLoginModal() {
  const context = useContext(LoginModalContext);
  if (!context) {
    throw new Error("useLoginModal must be used within LoginModalProvider");
  }
  return context;
}
