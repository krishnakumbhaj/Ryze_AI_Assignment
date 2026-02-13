import React from "react";

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: "text" | "password" | "email" | "number" | "search" | "tel";
  disabled?: boolean;
  value?: string;
  required?: boolean;
  theme?: "light" | "dark";
}

export default function Input({
  label,
  placeholder = "",
  type = "text",
  disabled = false,
  value,
  required = false,
  theme = "light",
}: InputProps) {
  const isDark = theme === "dark";
  
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className={`text-sm font-medium ${
          isDark ? "text-gray-300" : "text-gray-700"
        }`}>
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        className={`px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all duration-200 ${
          isDark
            ? "bg-gray-800 border border-gray-600 text-gray-100 placeholder:text-gray-500 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 disabled:bg-gray-700 disabled:text-gray-500"
            : "bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-gray-100 disabled:text-gray-400"
        } disabled:cursor-not-allowed`}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        defaultValue={value}
        required={required}
      />
    </div>
  );
}
