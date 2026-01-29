"use client";
import clsx from "clsx";
import * as FaIcons from "react-icons/fa";

export function Button({
  type,
  accept,
  label,
  iconName,
  children,
  variant = "primary",
  size = "medium",
  className,
  disabled = false,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-xl " +
    "leading-none select-none transition-all duration-200 " +
    "disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md";

  const variants = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-2 focus:ring-primary-200",
    secondary:
      "bg-secondary-100 text-primary-700 hover:bg-secondary-200 active:bg-secondary-300 focus:ring-2 focus:ring-secondary-200 border border-secondary-200",
    tertiary:
      "bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 active:bg-neutral-100 focus:ring-2 focus:ring-neutral-200",
    success:
      "bg-success-500 text-white hover:bg-success-600 active:bg-success-700 focus:ring-2 focus:ring-success-200",
    warning:
      "bg-warning-400 text-neutral-900 hover:bg-warning-500 active:bg-warning-600 focus:ring-2 focus:ring-warning-200",
    error:
      "bg-error-500 text-white hover:bg-error-600 active:bg-error-700 focus:ring-2 focus:ring-error-200",
    outline:
      "bg-transparent border-2 border-primary-600 text-primary-700 hover:bg-primary-50 hover:border-primary-700 active:bg-primary-100 focus:ring-2 focus:ring-primary-200",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-10 px-5 text-sm gap-2",
    lg: "h-12 px-6 text-base gap-2.5",
  };

  const iconColors = {
    primary: "text-white",
    secondary: "text-primary-700",
    tertiary: "text-primary-700",
    outline: "text-primary-700",
    error: "text-error-700",
  };

  // const [hover, setHover] = useState(false);

  const CurrentIcon = FaIcons[`FaReg${iconName}`] || FaIcons[`Fa${iconName}`];

  return (
    <button
      type={type}
      aria-label={label}
      accept={accept}
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        className,
        "items-center flex space-x-2 justify-center"
      )}
      disabled={disabled}
      {...props}
    >
      {CurrentIcon && (
        <CurrentIcon
          // kunci ukuran & cegah ikon “menggelembung” tinggi baris
          className={clsx("shrink-0", iconColors[variant], {
            "text-[12px]": size === "sm",
            "text-[12px]": size === "sm",
            "text-[14px]": size === "md",
            "text-[16px]": size === "lg",
          })}
          aria-hidden
        />
      )}
      {CurrentIcon ? (
        <span className="ml-1 leading-none">{children}</span>
      ) : (
        <span className="leading-none">{children}</span>
      )}
    </button>
  );
}
