import React from "react";

interface SidebarProps {
  items?: { text: string; active?: boolean; icon?: string }[];
  title?: string;
  theme?: "light" | "dark";
}

export default function Sidebar({ items = [], title, theme = "light" }: SidebarProps) {
  const isDark = theme === "dark";
  
  return (
    <aside className={`flex flex-col w-60 min-h-full py-4 transition-colors ${
      isDark
        ? "bg-gray-900 border-r border-gray-700"
        : "bg-gray-50 border-r border-gray-200"
    }`}>
      {title && (
        <div className={`text-xs font-semibold uppercase tracking-wider px-4 mb-3 ${
          isDark ? "text-gray-500" : "text-gray-400"
        }`}>
          {title}
        </div>
      )}
      <div className="flex flex-col gap-0.5 px-2">
        {items.map((item, i) => (
          <a
            key={i}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm no-underline cursor-pointer rounded-lg transition-all ${
              item.active
                ? isDark
                  ? "font-medium"
                  : "font-medium"
                : isDark
                  ? "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
            href="#"
            style={item.active ? { backgroundColor: isDark ? 'rgba(165,213,213,0.12)' : '#eaf8f7', color: '#a5d5d5' } : undefined}
          >
            {item.icon && <span className="text-base w-5 text-center opacity-70">{item.icon}</span>}
            {item.text}
          </a>
        ))}
      </div>
    </aside>
  );
}
