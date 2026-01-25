"use client";
import { useLoginModal } from "@/context/LoginModalContext";
import { Button } from "@/components";

export function LoginButton() {
  const { openLoginModal } = useLoginModal();

  return (
    <Button variant="primary" size="sm" onClick={openLoginModal}>
      Masuk
    </Button>
  );
}
