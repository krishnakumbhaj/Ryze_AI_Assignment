import React from "react";

interface ButtonProps {
  text: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  fullWidth?: boolean;
}

const VARIANT = {
  primary: "bg-indigo-500 text-white hover:bg-indigo-600",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  danger: "bg-red-500 text-white hover:bg-red-600",
  ghost: "bg-transparent text-indigo-500 hover:bg-gray-100",
};
const SIZE = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  text,
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center rounded-lg font-medium cursor-pointer transition-colors border-none",
    VARIANT[variant],
    SIZE[size],
    fullWidth ? "w-full" : "",
    disabled ? "opacity-50 cursor-not-allowed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} disabled={disabled}>
      {text}
    </button>
  );
}
