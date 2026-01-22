"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [message, setMessage] = useState("Menyelesaikan login...");

  useEffect(() => {
    const finishLogin = async () => {
      try {
        // token yang DIKIRIM backend Adonis
        const token = searchParams.get("token");

        if (!token) {
          throw new Error("Token login tidak ditemukan.");
        }

        // simpan token via AuthContext
        login({ token });

        // redirect setelah login
        router.replace("/");
      } catch (err) {
        setMessage(err?.message || "Login gagal.");
      }
    };

    finishLogin();
  }, [login, router, searchParams]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-lg font-semibold">Google Sign-in</h1>
      <p className="text-sm text-neutral-600">{message}</p>
    </div>
  );
}
