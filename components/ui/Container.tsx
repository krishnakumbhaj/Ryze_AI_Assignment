import React from "react";

interface ContainerProps {
  direction?: "row" | "column";
  gap?: "none" | "sm" | "md" | "lg";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
  wrap?: boolean;
  children?: React.ReactNode;
}

const GAP = { none: "gap-0", sm: "gap-2", md: "gap-4", lg: "gap-6" };
const PAD = { none: "p-0", sm: "p-2", md: "p-4", lg: "p-6", xl: "p-8" };
const ALIGN = { start: "items-start", center: "items-center", end: "items-end", stretch: "items-stretch" };
const JUSTIFY = { start: "justify-start", center: "justify-center", end: "justify-end", between: "justify-between", around: "justify-around" };

export default function Container({
  direction = "column",
  gap = "md",
  padding = "none",
  align = "stretch",
  justify = "start",
  wrap = false,
  children,
}: ContainerProps) {
  const classes = [
    "flex",
    direction === "row" ? "flex-row" : "flex-col",
    GAP[gap],
    PAD[padding],
    ALIGN[align],
    JUSTIFY[justify],
    wrap ? "flex-wrap" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}
