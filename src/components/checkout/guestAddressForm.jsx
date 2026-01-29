"use client";

import { useState } from "react";
import { Button } from "@/components";

export function GuestAddressForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    province: "",
    postal_code: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) newErrors.name = "Nama lengkap wajib diisi";
    if (!formData.phone?.trim()) {
      newErrors.phone = "Nomor telepon wajib diisi";
    } else if (!/^[0-9]{10,13}$/.test(formData.phone.replace(/[^0-9]/g, ""))) {
      newErrors.phone = "Nomor telepon tidak valid (10-13 digit)";
    }
    if (!formData.email?.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email tidak valid";
    }
    if (!formData.address?.trim()) newErrors.address = "Alamat lengkap wajib diisi";
    if (!formData.city?.trim()) newErrors.city = "Kota wajib diisi";
    if (!formData.province?.trim()) newErrors.province = "Provinsi wajib diisi";
    if (!formData.postal_code?.trim()) {
      newErrors.postal_code = "Kode pos wajib diisi";
    } else if (!/^[0-9]{5}$/.test(formData.postal_code)) {
      newErrors.postal_code = "Kode pos harus 5 digit";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <p className="text-sm text-primary-800">
          <span className="font-semibold">💡 Checkout sebagai Guest</span>
          <br />
          Silakan isi informasi pengiriman di bawah ini. Data tidak akan disimpan setelah transaksi selesai.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nama Lengkap */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Nama Lengkap <span className="text-error-600">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nama penerima"
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              errors.name
                ? "border-error-300 focus:ring-error-200"
                : "border-gray-200 focus:ring-primary-200 focus:border-primary-400"
            }`}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-error-600">{errors.name}</p>
          )}
        </div>

        {/* Nomor Telepon */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Nomor Telepon <span className="text-error-600">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="08xxxxxxxxxx"
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              errors.phone
                ? "border-error-300 focus:ring-error-200"
                : "border-gray-200 focus:ring-primary-200 focus:border-primary-400"
            }`}
            disabled={isLoading}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-error-600">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">
          Email <span className="text-error-600">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="email@example.com"
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
            errors.email
              ? "border-error-300 focus:ring-error-200"
              : "border-gray-200 focus:ring-primary-200 focus:border-primary-400"
          }`}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="mt-1 text-xs text-error-600">{errors.email}</p>
        )}
      </div>

      {/* Alamat Lengkap */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">
          Alamat Lengkap <span className="text-error-600">*</span>
        </label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
          rows={3}
          className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${
            errors.address
              ? "border-error-300 focus:ring-error-200"
              : "border-gray-200 focus:ring-primary-200 focus:border-primary-400"
          }`}
          disabled={isLoading}
        />
        {errors.address && (
          <p className="mt-1 text-xs text-error-600">{errors.address}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Kota */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Kota <span className="text-error-600">*</span>
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Nama kota"
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              errors.city
                ? "border-error-300 focus:ring-error-200"
                : "border-gray-200 focus:ring-primary-200 focus:border-primary-400"
            }`}
            disabled={isLoading}
          />
          {errors.city && (
            <p className="mt-1 text-xs text-error-600">{errors.city}</p>
          )}
        </div>

        {/* Provinsi */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Provinsi <span className="text-error-600">*</span>
          </label>
          <input
            type="text"
            name="province"
            value={formData.province}
            onChange={handleChange}
            placeholder="Nama provinsi"
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              errors.province
                ? "border-error-300 focus:ring-error-200"
                : "border-gray-200 focus:ring-primary-200 focus:border-primary-400"
            }`}
            disabled={isLoading}
          />
          {errors.province && (
            <p className="mt-1 text-xs text-error-600">{errors.province}</p>
          )}
        </div>

        {/* Kode Pos */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Kode Pos <span className="text-error-600">*</span>
          </label>
          <input
            type="text"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleChange}
            placeholder="12345"
            maxLength={5}
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
              errors.postal_code
                ? "border-error-300 focus:ring-error-200"
                : "border-gray-200 focus:ring-primary-200 focus:border-primary-400"
            }`}
            disabled={isLoading}
          />
          {errors.postal_code && (
            <p className="mt-1 text-xs text-error-600">{errors.postal_code}</p>
          )}
        </div>
      </div>

      {/* Catatan (Optional) */}
      <div>
        <label className="block text-sm font-semibold text-neutral-700 mb-2">
          Catatan Tambahan <span className="text-neutral-400">(Opsional)</span>
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Contoh: Rumah cat hijau, dekat minimarket"
          rows={2}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all resize-none"
          disabled={isLoading}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Memproses..." : "Lanjutkan ke Pembayaran"}
      </Button>
    </form>
  );
}
