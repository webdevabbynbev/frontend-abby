"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const { login } = useAuth();
  const ranRef = useRef(false);
  const [message, setMessage] = useState("Menyelesaikan login Google...");

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const run = async () => {
      try {
        // Supabase AUTO finalize PKCE
        const { data, error } = await supabase.auth.getSession();

        if (error || !data?.session) {
          throw new Error("Login Google gagal");
        }

        // Login ke context
        login({ user: data.session.user });

        router.replace("/");
      } catch (err) {
        console.error(err);
        setMessage("Login Google gagal. Silakan coba lagi.");
        setTimeout(() => router.replace("/sign-in"), 2500);
      }
    };

    run();
  }, [login, router]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-lg font-semibold">Google Sign-in</h1>
      <p className="text-sm text-neutral-600">{message}</p>
    </div>
  );
}
