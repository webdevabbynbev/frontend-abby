import clsx from "clsx";
import { useState } from "react";
import * as FaIcons from "react-icons/fa";
export default function BtnIcon({
  iconName,
  variant = "primary",
  size = "medium",
  className,
  disabled = false,
  ...props
  
}) {
  const baseStyles =
    "rounded-[24px] font-bold focus:ring focus:bg transition-colors-primary700 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-primary700 text-white hover:bg-primary600 focus:bg-primary800 transition-all",
    secondary: "bg-secondary100 text-primary700 hover:bg-secondary200 focus:bg-Secondary300 transition-all",
    tertiary: "bg-transparent border border-transparent font-bold text-primary700 hover:bg-secondary50 hover:border-primary700 focus:bg-primary100 transition-all",
  };

  const sizes = {
    sm: "px-2 py-2 text-sm",
    md: "px-3 py-3 text-base",
    lg: "px-4 py-4 text-lg",
  };
  const iconColors = {
    primary: "text-white",
    secondary: "text-primary700",
    tertiary: "text-primary700",

}
  const [hover, setHover] = useState(false);

  const IdleIcon = FaIcons[`Fa${iconName}`] || FaIcons[`FaReg${iconName}`];
  const HoverIcon = FaIcons[`FaReg${iconName}`] || FaIcons[`Fa${iconName}`];
  const CurrentIcon = hover ? IdleIcon : HoverIcon;

  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...props}
    >
      {CurrentIcon && <CurrentIcon className={iconColors[variant]}/>}
    </button>
  );
}