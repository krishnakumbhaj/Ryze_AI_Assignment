import React from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  padding?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}

const PAD = { sm: "p-3", md: "p-5", lg: "p-7" };

export default function Card({
  title,
  subtitle,
  padding = "md",
  children,
}: CardProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${PAD[padding]}`}>
      {title && <h3 className="text-lg font-semibold text-gray-900 m-0 mb-1">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-500 m-0 mb-4">{subtitle}</p>}
      {children && <div className="flex flex-col gap-3">{children}</div>}
    </div>
  );
}
