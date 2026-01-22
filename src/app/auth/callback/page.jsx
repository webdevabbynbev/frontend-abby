"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LoginGoogle, getUser } from "@/services/auth";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [message, setMessage] = useState("Menyelesaikan login Google...");
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const run = async () => {
      try {
        const storedMode =
          sessionStorage.getItem("google_oauth_mode") || "login";

        // ✅ INI WAJIB — finalize PKCE
        const { error } =
          await supabase.auth.exchangeCodeForSession(window.location.href);

        if (error) {
          throw error;
        }

        const { data } = await supabase.auth.getSession();
        const session = data?.session;

        if (!session?.provider_token) {
          throw new Error("Google provider token tidak ditemukan.");
        }

        // ✅ Kirim Google token ke backend
        await LoginGoogle(
          session.provider_token,
          storedMode,
          sessionStorage.getItem("google_oauth_accept_privacy") === "1"
        );

        // ✅ Ambil user dari backend
        const { user } = await getUser();

        if (!user) {
          throw new Error("User backend tidak ditemukan.");
        }

        login({ user });

        router.replace(
          user.needs_profile_completion ? "/account/profile" : "/"
        );
      } catch (err) {
        console.error(err);
        setMessage(err?.message || "Login Google gagal.");
        setTimeout(() => router.replace("/sign-in"), 2500);
      } finally {
        sessionStorage.removeItem("google_oauth_mode");
        sessionStorage.removeItem("google_oauth_accept_privacy");
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
