import React from "react";

interface NavbarProps {
  title: string;
  links?: { text: string; href?: string }[];
}

export default function Navbar({ title, links = [] }: NavbarProps) {
  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 w-full">
      <span className="text-lg font-bold text-gray-900">{title}</span>
      {links.length > 0 && (
        <ul className="flex gap-6 list-none m-0 p-0">
          {links.map((link, i) => (
            <li key={i}>
              <a className="text-gray-600 no-underline text-sm font-medium hover:text-indigo-500 transition-colors" href={link.href || "#"}>
                {link.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
