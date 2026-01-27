import api from "@/lib/axios.js";

function s(v) {
  return String(v ?? "").trim();
}

function n(v) {
  const num = Number(v);
  return Number.isFinite(num) ? num : NaN;
}

/** =========================
 *  GET USER (WAJIB ADA)
 *  ========================= */
export async function getUser() {
  try {
    const res = await api.get("/profile")

    const serve = res.data?.serve ?? null

    // handle:
    // 1) serve = user object
    // 2) serve = { data: user }
    const user =
      serve?.data
        ? serve.data
        : serve?.id
        ? serve
        : null

    return { user }
  } catch {
    return { user: null }
  }
}


/** =========================
 *  PROFILE
 *  ========================= */
export async function updateProfile(payload) {
  try {
    const res = await api.put("/profile", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.message || "Failed to update profile";
    throw new Error(msg);
  }
}

/** =========================
 *  ADDRESS
 *  ========================= */
export async function getAddressByQuery(userId) {
  if (!userId) return [];

  try {
    const res = await api.get("/addresses", {
      params: { user_id: userId },
      withCredentials: true,
    });

    return res.data?.serve ?? res.data?.data ?? [];
  } catch (err) {
    const status = err?.response?.status;

    if (status === 401) return [];
    if (status === 429) {
      console.warn("getAddressByQuery rate-limited");
      return [];
    }

    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Failed to fetch addresses";

    throw new Error(msg);
  }
}

/** =========================
 *  REGISTER (OTP)
 *  ========================= */
export async function regis(
  email,
  phone_number,
  first_name,
  last_name,
  gender,
  password,
  send_via = "whatsapp",
  accept_privacy_policy,
) {
  try {
    const payload = {
      email: s(email).toLowerCase(),
      phone_number: s(phone_number),
      first_name: s(first_name),
      last_name: s(last_name),
      gender: n(gender),
      password: String(password ?? ""),
      send_via: s(send_via) || "whatsapp",
      accept_privacy_policy: Boolean(accept_privacy_policy),
    };

    if (!payload.email) throw new Error("Email wajib diisi");
    if (!payload.phone_number) throw new Error("Nomor HP wajib diisi");
    if (!payload.first_name) throw new Error("First name wajib diisi");
    if (!payload.last_name) throw new Error("Last name wajib diisi");
    if (![1, 2].includes(payload.gender))
      throw new Error("Gender wajib dipilih");
    if (!payload.password) throw new Error("Password wajib diisi");
    if (!payload.accept_privacy_policy)
      throw new Error("Wajib menyetujui Privacy Policy");

    const res = await api.post("/auth/register", payload);
    return res.data;
  } catch (err) {
    const status = err?.response?.status;
    let msg = "Register gagal";

    if (status === 409) {
      msg = "Email atau nomor HP sudah terdaftar";
    } else if (status === 400) {
      msg = err?.response?.data?.message || "Data tidak valid";
    } else if (status === 500) {
      msg = "Server error. Coba lagi nanti.";
    } else {
      msg = err?.response?.data?.message || err?.message || msg;
    }

    console.error("regis error:", err);
    throw new Error(msg);
  }
}

export async function OtpRegis(
  email,
  phone_number,
  first_name,
  last_name,
  gender,
  password,
  otp,
  accept_privacy_policy,
) {
  try {
    const payload = {
      email: s(email).toLowerCase(),
      phone_number: s(phone_number),
      first_name: s(first_name),
      last_name: s(last_name),
      gender: n(gender),
      password: String(password ?? ""),
      otp: s(otp),
      accept_privacy_policy: Boolean(accept_privacy_policy),
    };

    if (!payload.email) throw new Error("Email wajib diisi");
    if (!payload.otp) throw new Error("OTP wajib diisi");
    if (!payload.accept_privacy_policy)
      throw new Error("Wajib menyetujui Privacy Policy");

    const res = await api.post("auth/verify-register", payload);

    const data = res.data;
    const token = data?.serve?.token;
    if (token) setToken(token);

    return data;
  } catch (err) {
    const status = err?.response?.status;
    let msg = "OTP salah atau register gagal";

    if (status === 400) {
      msg = "OTP tidak valid atau sudah kadaluarsa";
    } else if (status === 429) {
      msg = "Terlalu banyak percobaan. Coba lagi nanti.";
    } else if (status === 500) {
      msg = "Server error. Coba lagi nanti.";
    } else {
      msg = err?.response?.data?.message || err?.message || msg;
    }

    console.error("OtpRegis error:", err);
    throw new Error(msg);
  }
}

/** =========================
 *  LOGIN
 *  ========================= */
export async function loginUser(email_or_phone, password, remember_me = false) {
  const res = await api.post("/auth/login", {
    email_or_phone,
    password,
    remember_me,
  });
  return res.data;
}

/** =========================
 *  GOOGLE LOGIN
 *  ========================= */
export async function loginGoogle(token, accept_privacy_policy = false) {
  const res = await api.post("/auth/login-google", {
    token,
    accept_privacy_policy,
  });
  return res.data;
}

/** =========================
 *  LOGOUT
 *  ========================= */
export function logoutLocal() {
  clearToken();
}

export async function logoutUser() {
  await api.post("/auth/logout");
}
