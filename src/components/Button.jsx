"use client";
import clsx from "clsx";

export function Button({
  children,
  variant = "primary",
  size = "medium",
  className,
  disabled = false,
  ...props
}) {
  const baseStyles =
    "rounded-[24px] font-bold transition-colors-primary-700 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-primary-700 text-white hover:bg-primary-600 focus:bg-primary-800 transition-all duration-200",
    secondary:
      "bg-secondary-100 text-primary-700 hover:bg-secondary-200 focus:bg-Secondary300 transition-all duration-200",
    tertiary:
      "bg-transparent border border-transparent font-bold text-primary-700 hover:bg-secondary50 hover:border-primary-700 focus:bg-primary-100 transition-all duration-200",
  };

  const sizes = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-2 text-base",
    lg: "px-3 py-2 text-lg",
  };

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
