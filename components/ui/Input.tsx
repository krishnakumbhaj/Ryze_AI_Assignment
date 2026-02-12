import React from "react";

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: "text" | "password" | "email" | "number" | "search" | "tel";
  disabled?: boolean;
  value?: string;
  required?: boolean;
}

export default function Input({
  label,
  placeholder = "",
  type = "text",
  disabled = false,
  value,
  required = false,
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}{required && " *"}
        </label>
      )}
      <input
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 disabled:bg-gray-100 disabled:cursor-not-allowed placeholder:text-gray-400"
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        defaultValue={value}
        required={required}
      />
    </div>
  );
}
