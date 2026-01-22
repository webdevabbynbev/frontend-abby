"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [message, setMessage] = useState("Menyelesaikan login Google...");
  const processingRef = useRef(false); // ✅ Prevent double processing

  const finishLogin = useCallback(async () => {
    // ✅ Only process once
    if (processingRef.current) return;
    processingRef.current = true;

    try {
      // Get mode dari sessionStorage (di-set oleh loginRegis.jsx sebelum redirect)
      const storedMode =
        (typeof window !== "undefined" &&
          sessionStorage.getItem("google_oauth_mode")) ||
        "login";

      // Debug: Check URL
      const fullUrl = window.location.href;
      console.log("Callback URL:", fullUrl);
      const urlObj = new URL(fullUrl);
      const code = urlObj.searchParams.get("code");
      console.log("Auth code present:", !!code);

      // ✅ Dengan detectSessionInUrl: true, Supabase auto-handle PKCE
      setMessage("Mengambil session dari Supabase...");
      
      // Wait untuk Supabase auto-detect & process
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 1: Get session yang sudah di-create oleh Supabase auto-detection
      const { data, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`);
      }

      if (!data?.session) {
        console.log("No session found after auto-detection");
        throw new Error("Tidak dapat membuat session dari Google. Coba lagi.");
      }

      console.log("Session retrieved successfully");

      // Step 2: Extract Supabase user data
      const supabaseUser = data.session.user;
      if (!supabaseUser) {
        throw new Error("User data tidak ditemukan di Supabase session.");
      }

      setMessage("Menyiapkan user data...");

      const userData = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        firstName: supabaseUser.user_metadata?.name?.split(' ')[0] || "",
        lastName: supabaseUser.user_metadata?.name?.split(' ').slice(1).join(' ') || "",
        photoProfile: supabaseUser.user_metadata?.picture || null,
      };

      console.log("User authenticated:", userData.id);

      // Step 3: Update auth context
      setMessage("Login berhasil! Mengalihkan...");
      login({ user: userData });
      
      // For new user atau incomplete profile, redirect to profile completion
      const isNewUser = storedMode === "register";
      const needsProfile = !userData.firstName || !userData.lastName;
      
      const redirectUrl = isNewUser || needsProfile ? "/account/profile" : "/";
      console.log("Redirecting to:", redirectUrl);

      // ✅ Use small delay before redirect
      setTimeout(() => {
        router.replace(redirectUrl);
      }, 300);
      
      return;
    } catch (err) {
      console.error("Auth callback error:", err);
      setMessage(
        err?.message || "Login Google gagal. Silakan coba lagi di halaman login."
      );
      
      // Redirect back to sign-in after 3 seconds
      setTimeout(() => {
        router.replace("/sign-in");
      }, 3000);
    } finally {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("google_oauth_mode");
        sessionStorage.removeItem("google_oauth_accept_privacy");
      }
    }
  }, [login, router]);

  useEffect(() => {
    finishLogin();
  }, []); // ✅ Empty dependency - run only once on mount

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-lg font-semibold">Google Sign-in</h1>
      <p className="text-sm text-neutral-600">{message}</p>
    </div>
  );
}
