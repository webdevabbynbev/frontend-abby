"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, regis, OtpRegis } from "@/services/auth"; // ✅ getUser dihapus
import { useAuth } from "@/context/AuthContext";
import { useLoginModal } from "@/context/LoginModalContext";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Button,
  TxtField,
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectValue,
  SelectLabel,
  SelectItem,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "..";

const pickValue = (e) => e?.target?.value ?? e ?? "";

export function LoginRegisModalForm() {
  const { login } = useAuth();
  const { isOpen, setIsOpen, closeLoginModal } = useLoginModal();
  const router = useRouter();

  const [tab, setTab] = useState("signin");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ===== SIGN IN =====
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // ===== SIGN UP =====
  const [signupStep, setSignupStep] = useState("regis");
  const [email, setEmail] = useState("");
  const [phone_number, setPhoneNumber] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [pwError, setPwError] = useState("");
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);

  function validateRegisterPassword(pw, cpw) {
    if (!pw || !cpw) return "";
    if (pw.length < 8) return "Password minimal 8 karakter";
    if (!/[^A-Za-z0-9\s]/.test(pw))
      return "Password wajib mengandung minimal 1 simbol (contoh: ! @ _)";
    if (pw !== cpw) return "Password dan konfirmasi tidak sama";
    return "";
  }

  // ===== HANDLERS =====
  const handleLogin = async () => {
    setLoading(true);
    setMessage("");
    try {
      const data = await loginUser(loginId, loginPassword);
      
      // Extract user dari berbagai format response
      let user = null;
      if (data?.serve) {
        user = typeof data.serve === 'object' && data.serve.data 
          ? data.serve.data 
          : data.serve;
      } else if (data?.user) {
        user = data.user;
      } else if (data?.data) {
        user = data.data;
      }

      if (user && typeof user === 'object') {
        login({ user });
        closeLoginModal();
        router.push("/");
        return;
      }

      setMessage(data?.message || "Login gagal - user data tidak valid.");
    } catch (err) {
      console.error("Login error:", err);
      setMessage(err?.message || "Login gagal. Periksa email/phone dan password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegis = async () => {
    if (!acceptPrivacy) {
      setMessage("Wajib menyetujui Privacy Policy sebelum mendaftar.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const data = await regis(
        email,
        phone_number,
        first_name,
        last_name,
        gender,
        regPassword,
        "whatsapp",
        acceptPrivacy,
      );

      if (data?.serve) {
        setMessage("OTP dikirim, cek email/whatsapp kamu.");
        setSignupStep("otpregis");
        return;
      }

      setMessage(data?.message || "Gagal mengirim OTP.");
    } catch (err) {
      setMessage(err?.message || "Gagal register.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpRegis = async () => {
    if (!acceptPrivacy) {
      setMessage("Wajib menyetujui Privacy Policy sebelum mendaftar.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const data = await OtpRegis(
        email,
        phone_number,
        first_name,
        last_name,
        gender,
        regPassword,
        otp,
        acceptPrivacy,
      );

      // Extract user dari berbagai format response
      let user = null;
      if (data?.serve) {
        user = typeof data.serve === 'object' && data.serve.data 
          ? data.serve.data 
          : data.serve;
      } else if (data?.user) {
        user = data.user;
      } else if (data?.data) {
        user = data.data;
      }

      if (user && typeof user === 'object') {
        login({ user });
        closeLoginModal();
        router.push("/account/profile");
        return;
      }

      setMessage(data?.message || "OTP salah atau register gagal.");
    } catch (err) {
      console.error("OTP register error:", err);
      setMessage(err?.message || "OTP salah atau register gagal.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX UTAMA: nama fungsi SESUAI dengan pemanggilan di UI

  const handleGoogleOAuth = async (mode = "login") => {
    if (loading) return;
    if (mode === "register" && !acceptPrivacy) {
      setMessage("Centang Privacy Policy dulu untuk daftar dengan Google.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("google_oauth_mode", mode);
        sessionStorage.setItem(
          "google_oauth_accept_privacy",
          acceptPrivacy ? "1" : "0",
        );
      }

      // ✅ Redirect URI harus EXACT match dengan Google Cloud Console & Supabase
      // Jangan tambah query params di sini - Supabase akan handle PKCE flow
      const redirectTo = `${window.location.origin}/auth/callback`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
          scopes: "profile email openid",
        },
      });

      if (error) {
        throw new Error(error.message || "Supabase OAuth error");
      }
    } catch (err) {
      console.error("Google OAuth error:", err);
      setMessage(err?.message || "Login Google gagal. Coba lagi.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} className="Form-Sign-in">
      <DialogContent onInteractOutside={closeLoginModal}>
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <Tabs
          className="py-6"
          value={tab}
          onValueChange={(v) => {
            setTab(v);
            setMessage("");
            setLoading(false);

            // reset step kalau masuk signup
            if (v === "signup") {
              setSignupStep("regis");
              setOtp("");
              setPwError("");
              setAcceptPrivacy(false);
            }
          }}
        >
          <TabsList className="absolute left-6 top-4 w-fit">
            <TabsTrigger value="signin" className="w-1/2">
              Masuk
            </TabsTrigger>
            <TabsTrigger value="signup" className="w-1/2">
              Daftar
            </TabsTrigger>
          </TabsList>

          {/* ===== SIGN IN ===== */}
          <TabsContent value="signin">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (loading) return;
                handleLogin();
              }}
            >
              <div className="space-y-4">
                <div className="w-full flex mx-auto justify-center">
                  <img
                    src="/logo-abby-combine.svg"
                    alt="logo"
                    className="w-30 h-auto"
                  />
                </div>

                <div className="space-y-0 text-center">
                  <div className="text-base flex justify-center items-center">
                    Hi{" "}
                    <span className="font-damion px-2 text-2xl text-primary-700 font-normal">
                      Abeauties
                    </span>
                    Welcome back!
                  </div>
                  <div className="text-sm text-neutral-500">
                    Log in to unlock your personalized beauty space.
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <TxtField
                  type="text"
                  autoComplete="username"
                  inputMode="text"
                  placeholder="Email or Phone number"
                  variant="outline"
                  size="sm"
                  value={loginId}
                  onChange={(e) => setLoginId(pickValue(e))}
                />

                <TxtField
                  autoComplete="current-password"
                  type="password"
                  placeholder="Password"
                  variant="outline"
                  size="sm"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(pickValue(e))}
                />
              </div>

              <div className="w-full">
                <Link href="#" className="text-xs">
                  Forgot password?
                </Link>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Sign in"}
                </Button>

                <div className="w-full flex justify-center text-sm">Or</div>

                {/* ✅ Google LOGIN (existing only) */}
                <div className="flex flex-col gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleGoogleOAuth("login")}
                    disabled={loading}
                  >
                    Continue with Google
                  </Button>
                </div>
              </div>

              {message && (
                <span className="block text-sm text-center text-neutral-600 mt-2">
                  {message}
                </span>
              )}
            </form>
          </TabsContent>

          {/* ===== SIGN UP ===== */}
          <TabsContent value="signup">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (loading) return;
                if (signupStep === "regis") handleRegis();
                else handleOtpRegis();
              }}
            >
              <div className="space-y-4">
                <div className="w-full flex mx-auto justify-center">
                  <img
                    src="/logo-abby-combine.svg"
                    alt="logo"
                    className="w-30 h-auto"
                  />
                </div>

                <div className="space-y-0 text-center">
                  <div className="text-base">Ready to Glow up ✨ with us?</div>
                  <div className="text-neutral-500 text-sm">
                    Explore skincare tips & talk, all in one place
                  </div>
                </div>
              </div>

              {signupStep === "regis" && (
                <div className="space-y-3">
                  <div className="grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 gap-4">
                    <TxtField
                      className="w-full"
                      autoComplete="given-name"
                      placeholder="First name"
                      variant="outline"
                      size="sm"
                      value={first_name}
                      onChange={(e) => setFirstName(pickValue(e))}
                    />
                    <TxtField
                      className="w-full"
                      autoComplete="family-name"
                      placeholder="Last name"
                      variant="outline"
                      size="sm"
                      value={last_name}
                      onChange={(e) => setLastName(pickValue(e))}
                    />
                  </div>

                  <TxtField
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="Enter your email"
                    variant="outline"
                    size="sm"
                    value={email}
                    onChange={(e) => setEmail(pickValue(e))}
                  />

                  <TxtField
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="Phone number"
                    variant="outline"
                    size="sm"
                    value={phone_number}
                    onChange={(e) => setPhoneNumber(pickValue(e))}
                  />

                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Gender</SelectLabel>
                        <SelectItem value="1">Male</SelectItem>
                        <SelectItem value="2">Female</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <TxtField
                    autoComplete="new-password"
                    type="password"
                    placeholder="Password"
                    variant="outline"
                    size="sm"
                    value={regPassword}
                    onChange={(e) => {
                      const v = pickValue(e);
                      setRegPassword(v);
                      setPwError(validateRegisterPassword(v, confirm_password));
                    }}
                  />

                  <TxtField
                    autoComplete="new-password"
                    type="password"
                    placeholder="Confirm password"
                    variant="outline"
                    size="sm"
                    value={confirm_password}
                    onChange={(e) => {
                      const v = pickValue(e);
                      setConfirmPassword(v);
                      setPwError(validateRegisterPassword(regPassword, v));
                    }}
                  />

                  {pwError && <p className="text-sm text-red-600">{pwError}</p>}

                  {/* ✅ Privacy Policy checkbox */}
                  <div className="flex items-start gap-2 pt-1">
                    <input
                      id="accept_privacy_policy"
                      type="checkbox"
                      className="mt-1 h-4 w-4"
                      checked={acceptPrivacy}
                      onChange={(e) => setAcceptPrivacy(e.target.checked)}
                    />
                    <label
                      htmlFor="accept_privacy_policy"
                      className="text-xs text-neutral-600 leading-5"
                    >
                      Saya setuju{" "}
                      <Link
                        href="/privacy-policy"
                        target="_blank"
                        className="text-xs font-normal text-neutral-600 underline underline-offset-2"
                      >
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                </div>
              )}

              {signupStep === "otpregis" && (
                <div className="space-y-3">
                  <TxtField
                    autoComplete="one-time-code"
                    placeholder="Masukkan OTP"
                    value={otp}
                    onChange={(e) => setOtp(pickValue(e))}
                  />
                </div>
              )}

              <div className="space-y-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="w-full"
                  disabled={
                    loading ||
                    !!pwError ||
                    (signupStep === "regis" && !acceptPrivacy) ||
                    (signupStep === "otpregis" && !acceptPrivacy)
                  }
                >
                  {loading
                    ? "Loading..."
                    : signupStep === "regis"
                      ? "Sign Up"
                      : "Verify OTP"}
                </Button>

                {/* ✅ Google REGISTER di bawah form */}
                {signupStep === "regis" && (
                  <>
                    <div className="w-full flex justify-center text-sm">Or</div>

                    {!acceptPrivacy && (
                      <p className="text-xs text-center text-neutral-500">
                        Centang Privacy Policy untuk daftar dengan Google.
                      </p>
                    )}

                    <div
                      className={
                        acceptPrivacy
                          ? "flex flex-col gap-4"
                          : "flex flex-col gap-4 opacity-50 pointer-events-none"
                      }
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleGoogleOAuth("register")}
                        disabled={loading || !acceptPrivacy}
                      >
                        Continue with Google
                      </Button>
                    </div>
                  </>
                )}
              </div>

              {message && (
                <span className="block text-sm text-center text-neutral-600 mt-2">
                  {message}
                </span>
              )}
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
