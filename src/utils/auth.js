import api from "@/lib/axios";

export async function updateProfile(formData) {
  const token = localStorage.getItem("token");

  try {
    const res = await api.put("/profile", formData, {
      headers: {
        Authorization: `Bearer ${token}`, // ← pakai backtick
      },
    });

    return res.data; // Axios otomatis parse JSON
  } catch (err) {
    // Axios error handling
    const msg = err?.response?.data?.message || "Failed to update profile";
    throw new Error(msg);
  }
}

export async function getUser() {
  const token = localStorage.getItem("token");
  const res = await api.get("/profile", {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true, // kalau perlu
  });
  const payload = res.data;
  const user =
    payload?.user ?? payload?.serve ?? payload?.data?.user ?? payload?.data?.serve ?? null;
  return { user };
}

export async function getAddressByQuery(userId) {
  const res = await api.get("/addresses", { params: { user_id: userId } });
  return res.data?.serve ?? [];
}

export async function OtpRegis(
  email,
  phone_number,
  first_name,
  last_name,
  gender,
  password,
  otp
) {
  try {
    const res = await api.post("/auth/register", {
      email,
      phone_number,
      first_name,
      last_name,
      gender: Number(gender),
      password,
      otp,
    });
    return res.data; // {message, serve: true/false}
  } catch (err) {
    throw new Error(err.response?.data?.message || "OTP Salah");
  }
}

export async function regis(
  email,
  phone_number,
  first_name,
  last_name,
  gender,
  password
) {
  try {
    const res = await api.post("/auth/register", {
      email,
      phone_number,
      first_name,
      last_name,
      gender: Number(gender),
      password,
    });
    return res.data; // {message, serve: true/false}
  } catch (err) {
    throw new Error(err.response?.data?.message || "Register gagal");
  }
}

export async function verifyOtp(email_or_phone, otp) {
  try {
    const res = await api.post("/auth/verify-login", { email_or_phone, otp });
    return res.data; // {success: true/false}
  } catch (err) {
    throw new Error(err.response?.data?.message || "Verifikasi OTP gagal");
  }
}

export async function loginUser(email_or_phone, password) {
  try {
    const res = await api.post("/auth/login", { email_or_phone, password });
    console.log("DEBUG LOGIN RESPONSE:", res.data);
    const data = res.data;

    // cek apakah ada token di response
    if (data.serve?.token) {
      localStorage.setItem("token", data.serve.token);
    }

    return data;
  } catch (err) {
    console.error("DEBUG LOGIN ERROR:", err.response?.data);
    throw new Error(err.response?.data?.message || "Login gagal");
  }
}

export async function LoginGoogle(token) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/login-google`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // kalau server set HTTP-only cookie
      body: JSON.stringify({ token }), // ← field yang diharapkan backend
    }
  );

  let payload;
  try {
    payload = await res.json(); // coba parse JSON langsung
  } catch {
    payload = null;
  }

  if (!res.ok) {
    throw new Error(
      payload?.message || `LoginGoogle gagal (HTTP ${res.status})`
    );
  }

  if (payload.serve?.token) {
    console.log(
      "Google token:",
      payload.serve.token,
      typeof payload.serve.token
    );
    localStorage.setItem("token", payload.serve.token);
  }

  return payload;
}
