import React from "react";

interface ButtonProps {
  text: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  fullWidth?: boolean;
  theme?: "light" | "dark";
}

const VARIANT_LIGHT = {
  primary: "bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm shadow-indigo-500/25",
  secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200",
  danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-500/25",
  ghost: "bg-transparent text-indigo-600 hover:bg-indigo-50",
};

const VARIANT_DARK = {
  primary: "bg-indigo-500 text-white hover:bg-indigo-400 shadow-md shadow-indigo-500/30",
  secondary: "bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600",
  danger: "bg-red-500 text-white hover:bg-red-400 shadow-md shadow-red-500/30",
  ghost: "bg-transparent text-indigo-400 hover:bg-gray-800",
};

const SIZE = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-2.5 text-base gap-2",
};

export default function Button({
  text,
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  theme = "light",
}: ButtonProps) {
  const variantStyles = theme === "dark" ? VARIANT_DARK : VARIANT_LIGHT;
  
  const classes = [
    "inline-flex items-center justify-center rounded-lg font-medium cursor-pointer transition-all duration-200 border-none",
    variantStyles[variant],
    SIZE[size],
    fullWidth ? "w-full" : "",
    disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "active:scale-[0.98]",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} disabled={disabled}>
      {text}
    </button>
  );
}
