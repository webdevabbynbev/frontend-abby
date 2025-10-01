import api from "@/lib/axios";

export async function getUser() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found, please login first");

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`, // ✅
      Accept: "application/json",
    },
  });

  const data = await res.json(); // hanya sekali baca body

  if (!res.ok) {
    throw new Error(data?.errors?.[0]?.message || "Unauthorized");
  }

  return data;
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
    console.log("Google token:", payload.serve.token, typeof payload.serve.token);
    localStorage.setItem("token", payload.serve.token);
  }

  return payload;
}
