import React from "react";

interface ModalProps {
  title: string;
  isOpen?: boolean;
  children?: React.ReactNode;
  theme?: "light" | "dark";
}

export default function Modal({
  title,
  isOpen = true,
  children,
  theme = "light",
}: ModalProps) {
  if (!isOpen) return null;
  const isDark = theme === "dark";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
      <div className={`rounded-2xl p-6 min-w-[320px] max-w-[560px] w-full transition-colors ${
        isDark
          ? "bg-gray-800 border border-gray-700 shadow-2xl shadow-black/40"
          : "bg-white shadow-2xl shadow-black/10"
      }`}>
        <div className="flex items-center justify-between mb-5">
          <h3 className={`text-lg font-semibold m-0 ${
            isDark ? "text-gray-100" : "text-gray-900"
          }`}>{title}</h3>
          <button className={`w-8 h-8 rounded-lg flex items-center justify-center text-xl cursor-pointer transition-colors border-none ${
            isDark
              ? "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-200"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
          }`}>×</button>
        </div>
        <div className="flex flex-col gap-4">{children}</div>
      </div>
    </div>
  );
}
