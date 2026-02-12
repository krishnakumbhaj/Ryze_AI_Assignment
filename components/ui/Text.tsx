import React from "react";

interface TextProps {
  content: string;
  variant?: "h1" | "h2" | "h3" | "p" | "span" | "label";
  weight?: "normal" | "medium" | "bold";
  color?: "default" | "muted" | "primary" | "danger" | "success";
}

const TAG_MAP: Record<string, keyof React.JSX.IntrinsicElements> = {
  h1: "h1", h2: "h2", h3: "h3", p: "p", span: "span", label: "label",
};
const VARIANT = {
  h1: "text-3xl font-bold leading-tight mb-2",
  h2: "text-2xl font-semibold leading-snug mb-1.5",
  h3: "text-xl font-semibold leading-snug mb-1",
  p: "text-base",
  span: "text-base inline",
  label: "text-sm font-medium",
};
const WEIGHT = { normal: "font-normal", medium: "font-medium", bold: "font-bold" };
const COLOR = {
  default: "text-gray-900",
  muted: "text-gray-500",
  primary: "text-indigo-500",
  danger: "text-red-500",
  success: "text-green-500",
};

export default function Text({
  content,
  variant = "p",
  weight = "normal",
  color = "default",
}: TextProps) {
  const Tag = TAG_MAP[variant] || "p";
  const classes = [
    "m-0 leading-normal",
    VARIANT[variant],
    WEIGHT[weight],
    COLOR[color],
  ].join(" ");

  return <Tag className={classes}>{content}</Tag>;
}
