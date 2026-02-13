import React from "react";

interface NavbarProps {
  title: string;
  links?: { text: string; href?: string }[];
  theme?: "light" | "dark";
}

export default function Navbar({ title, links = [], theme = "light" }: NavbarProps) {
  const isDark = theme === "dark";
  
  return (
    <nav className={`flex items-center justify-between px-6 py-3.5 w-full transition-colors ${
      isDark
        ? "bg-gray-900 border-b border-gray-700"
        : "bg-white border-b border-gray-200 shadow-sm"
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
          isDark ? "bg-indigo-500 text-white" : "bg-indigo-500 text-white"
        }`}>
          {title.charAt(0)}
        </div>
        <span className={`text-lg font-bold ${
          isDark ? "text-gray-100" : "text-gray-900"
        }`}>{title}</span>
      </div>
      {links.length > 0 && (
        <ul className="flex gap-1 list-none m-0 p-0">
          {links.map((link, i) => (
            <li key={i}>
              <a className={`px-3 py-2 rounded-lg no-underline text-sm font-medium transition-colors ${
                isDark
                  ? "text-gray-300 hover:text-white hover:bg-gray-800"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`} href={link.href || "#"}>
                {link.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
