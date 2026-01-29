"use client";

import { BtnIcon } from "../button/btnIcon";

export function QuantityInput({
  value,
  min = 1,
  max = 100,
  disabled = false,
  onChange,
}) {
  const clamp = (v) => {
    let n = parseInt(v, 10);
    if (Number.isNaN(n)) n = min;
    if (n < min) n = min;
    if (n > max) n = max;
    return n;
  };

  const qty = clamp(value ?? min);

  const handleChange = (e) => onChange?.(clamp(e.target.value));
  const handleDecrease = () => !disabled && qty > min && onChange?.(qty - 1);
  const handleIncrease = () => !disabled && qty < max && onChange?.(qty + 1);

  return (
    <div className="flex items-center border border-neutral-200 hover:border-primary-400 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 rounded-lg transition-all duration-200 w-fit h-9 bg-white shadow-sm">
      <BtnIcon
        iconName="Minus"
        variant="tertiary"
        size="xs"
        onClick={handleDecrease}
        disabled={disabled || qty <= min}
      />

      <input
        type="number"
        value={qty}
        min={min}
        max={max}
        disabled={disabled}
        onChange={handleChange}
        className="w-12 text-center text-sm font-semibold outline-none no-spinner bg-transparent disabled:opacity-50 text-neutral-900"
      />

      <BtnIcon
        iconName="Plus"
        variant="tertiary"
        size="xs"
        onClick={handleIncrease}
        disabled={disabled || qty >= max}
      />
    </div>
  );
}