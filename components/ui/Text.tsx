import React from "react";

interface TextProps {
  content: string;
  variant?: "h1" | "h2" | "h3" | "p" | "span" | "label";
  weight?: "normal" | "medium" | "bold";
  color?: "default" | "muted" | "primary" | "danger" | "success";
  theme?: "light" | "dark";
}

const TAG_MAP: Record<string, keyof React.JSX.IntrinsicElements> = {
  h1: "h1", h2: "h2", h3: "h3", p: "p", span: "span", label: "label",
};
const VARIANT = {
  h1: "text-3xl font-bold leading-tight mb-2 tracking-tight",
  h2: "text-2xl font-semibold leading-snug mb-1.5",
  h3: "text-xl font-semibold leading-snug mb-1",
  p: "text-base leading-relaxed",
  span: "text-base inline",
  label: "text-sm font-medium",
};
const WEIGHT = { normal: "font-normal", medium: "font-medium", bold: "font-bold" };

const COLOR_LIGHT = {
  default: "text-gray-900",
  muted: "text-gray-500",
  primary: "text-[#a5d5d5]",
  danger: "text-red-600",
  success: "text-emerald-600",
};

const COLOR_DARK = {
  default: "text-gray-100",
  muted: "text-gray-400",
  primary: "text-[#a5d5d5]",
  danger: "text-red-400",
  success: "text-emerald-400",
};

export default function Text({
  content,
  variant = "p",
  weight = "normal",
  color = "default",
  theme = "light",
}: TextProps) {
  const Tag = TAG_MAP[variant] || "p";
  const colorStyles = theme === "dark" ? COLOR_DARK : COLOR_LIGHT;
  
  const classes = [
    "m-0 leading-normal",
    VARIANT[variant],
    WEIGHT[weight],
    colorStyles[color],
  ].join(" ");

  return <Tag className={classes}>{content}</Tag>;
}
