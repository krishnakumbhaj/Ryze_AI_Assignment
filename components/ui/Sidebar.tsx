import React from "react";

interface SidebarProps {
  items?: { text: string; active?: boolean; icon?: string }[];
  title?: string;
}

export default function Sidebar({ items = [], title }: SidebarProps) {
  return (
    <aside className="flex flex-col w-60 min-h-full bg-gray-50 border-r border-gray-200 py-4">
      {title && (
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 px-4 mb-2">
          {title}
        </div>
      )}
      {items.map((item, i) => (
        <a
          key={i}
          className={`flex items-center gap-2 px-4 py-2 text-sm no-underline cursor-pointer transition-colors ${
            item.active
              ? "bg-indigo-50 text-indigo-500 font-medium"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          href="#"
        >
          {item.icon && <span className="text-base w-5 text-center">{item.icon}</span>}
          {item.text}
        </a>
      ))}
    </aside>
  );
}
