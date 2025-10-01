import api from "@/lib/axios";

export async function getUser(
  id,
  firstName,
  lastName,
  email,
  phoneNumber,
  address,
  gender,
  dob,
  photoProfile
) {
  try {
    const res = await api.get("/auth/user", {
      id,
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      gender,
      dob,
      photoProfile,
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Fetch data profile gagal");
  }
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

export async function loginUser(email_or_phone, password) {
  try {
    const res = await api.post("/auth/login", { email_or_phone, password });
    return res.data; // {message, serve: true/false}
  } catch (err) {
    throw new Error(err.response?.data?.message || "Login gagal");
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

  return payload;
}
