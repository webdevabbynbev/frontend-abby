"use client";
import clsx from "clsx";
import * as FaIcons from "react-icons/fa";

export function Button({
  iconName,
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
      "bg-transparent border border-transparent font-bold text-primary-700 hover:bg-secondary-100 transition-all duration-200",
  };

  const sizes = {
    sm: "px-3.5 py-2 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  const iconColors = {
    primary: "text-white",
    secondary: "text-primary-700",
    tertiary: "text-primary-700",
  };
  // const [hover, setHover] = useState(false);

  const CurrentIcon = FaIcons[`FaReg${iconName}`] || FaIcons[`Fa${iconName}`];

  return (
    <button
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
      {CurrentIcon ? (
        <>
          <div>
            <CurrentIcon className={clsx(iconColors[variant])} />
          </div>
          <div>{children}</div>
        </>
      ) : (
        children
      )}
    </button>
  );
}
