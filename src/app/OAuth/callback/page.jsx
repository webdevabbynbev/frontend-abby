"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";

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

        const accessToken = data.session.access_token;
        if (!accessToken) {
          throw new Error("Tidak ada access token dari Supabase");
        }

        // Baca mode dari sessionStorage (register atau login)
        const mode =
          typeof window !== "undefined"
            ? sessionStorage.getItem("google_oauth_mode") || "login"
            : "login";

        const acceptPrivacy =
          typeof window !== "undefined"
            ? sessionStorage.getItem("google_oauth_accept_privacy") === "1"
            : false;

        // Kirim ke backend sesuai mode
        if (mode === "register") {
          setMessage("Menyelesaikan pendaftaran...");
          const response = await api.post("/auth/register-google", {
            token: accessToken,
            accept_privacy_policy: acceptPrivacy,
          });

          // Extract user dari response
          let user = null;
          if (response.data?.serve?.user) {
            user = response.data.serve.user;
          } else if (response.data?.serve?.data) {
            user = response.data.serve.data;
          } else if (response.data?.user) {
            user = response.data.user;
          }

          if (user) {
            login({ user });
            // Clear sessionStorage
            sessionStorage.removeItem("google_oauth_mode");
            sessionStorage.removeItem("google_oauth_accept_privacy");
            router.replace("/account/profile");
          } else {
            throw new Error("Register gagal - user data tidak valid");
          }
        } else {
          // Login mode
          setMessage("Menyelesaikan login...");
          const response = await api.post("/auth/login-google", {
            token: accessToken,
            accept_privacy_policy: acceptPrivacy,
          });

          // Extract user dari response
          let user = null;
          if (response.data?.serve?.user) {
            user = response.data.serve.user;
          } else if (response.data?.serve?.data) {
            user = response.data.serve.data;
          } else if (response.data?.user) {
            user = response.data.user;
          }

          if (user) {
            login({ user });
            // Clear sessionStorage
            sessionStorage.removeItem("google_oauth_mode");
            sessionStorage.removeItem("google_oauth_accept_privacy");
            router.replace("/");
          } else {
            throw new Error("Login gagal - user data tidak valid");
          }
        }
      } catch (err) {
        console.error("OAuth callback error:", err);
        setMessage("Login Google gagal. Silakan coba lagi.");
        // Clear sessionStorage
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("google_oauth_mode");
          sessionStorage.removeItem("google_oauth_accept_privacy");
        }
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
