import React from "react";

interface ModalProps {
  title: string;
  isOpen?: boolean;
  children?: React.ReactNode;
}

export default function Modal({
  title,
  isOpen = true,
  children,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-xl p-6 min-w-[360px] max-w-[560px] w-[90%] shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 m-0">{title}</h3>
          <button className="bg-transparent border-none text-xl cursor-pointer text-gray-500 hover:text-gray-800 p-1">×</button>
        </div>
        <div className="flex flex-col gap-3">{children}</div>
      </div>
    </div>
  );
}
