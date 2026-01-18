"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LoginGoogle, getUser } from "@/services/auth";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [message, setMessage] = useState("Menyelesaikan login Google...");

  useEffect(() => {
    const finishLogin = async () => {
      try {
        const mode = searchParams.get("mode") || "login";
        const storedMode =
          (typeof window !== "undefined" &&
            sessionStorage.getItem("google_oauth_mode")) ||
          mode;
        const acceptPrivacy =
          (typeof window !== "undefined" &&
            sessionStorage.getItem("google_oauth_accept_privacy") === "1") ||
          false;

        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(window.location.href);
        if (exchangeError) {
          throw new Error(exchangeError.message);
        }

        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          throw new Error(sessionError.message);
        }

        const providerToken =
          data?.session?.provider_token || data?.session?.access_token;
        if (!providerToken) {
          throw new Error("Token Google tidak ditemukan.");
        }

        const payload = await LoginGoogle(
          providerToken,
          storedMode,
          acceptPrivacy
        );

        const isNewUser = !!payload?.serve?.is_new_user;
        const needsProfile = !!payload?.serve?.needs_profile_completion;
        const { user } = await getUser();

        if (user) {
          login({ user });
          router.replace(
            isNewUser || needsProfile ? "/account/profile" : "/"
          );
          return;
        }

        setMessage(payload?.message || "Login Google gagal.");
      } catch (err) {
        setMessage(err?.message || "Login Google gagal.");
      } finally {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("google_oauth_mode");
          sessionStorage.removeItem("google_oauth_accept_privacy");
        }
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
