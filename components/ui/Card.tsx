import React from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  padding?: "sm" | "md" | "lg";
  children?: React.ReactNode;
  theme?: "light" | "dark";
}

const PAD = { sm: "p-4", md: "p-5", lg: "p-6" };

export default function Card({
  title,
  subtitle,
  padding = "md",
  children,
  theme = "light",
}: CardProps) {
  const isDark = theme === "dark";
  
  return (
    <div className={`rounded-xl transition-colors ${
      isDark 
        ? "bg-gray-800 border border-gray-700 shadow-lg shadow-black/10" 
        : "bg-white border border-gray-200 shadow-sm hover:shadow-md"
    } ${PAD[padding]}`}>
      {title && (
        <h3 className={`text-lg font-semibold m-0 mb-1 ${
          isDark ? "text-gray-100" : "text-gray-900"
        }`}>
          {title}
        </h3>
      )}
      {subtitle && (
        <p className={`text-sm m-0 mb-4 ${
          isDark ? "text-gray-400" : "text-gray-500"
        }`}>
          {subtitle}
        </p>
      )}
      {children && <div className="flex flex-col gap-3">{children}</div>}
    </div>
  );
}
