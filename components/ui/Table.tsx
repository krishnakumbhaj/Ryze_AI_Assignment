import React from "react";

interface TableProps {
  headers?: string[];
  rows?: string[][];
  striped?: boolean;
  theme?: "light" | "dark";
}

export default function Table({
  headers = [],
  rows = [],
  striped = false,
  theme = "light",
}: TableProps) {
  const isDark = theme === "dark";
  
  return (
    <div className={`w-full overflow-x-auto rounded-lg border ${
      isDark ? "border-gray-700" : "border-gray-200"
    }`}>
      <table className="w-full border-collapse text-sm">
        {headers.length > 0 && (
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} className={`text-left px-4 py-3 font-semibold border-b ${
                  isDark
                    ? "text-gray-300 bg-gray-800 border-gray-700"
                    : "text-gray-700 bg-gray-50 border-gray-200"
                }`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={`transition-colors ${
              striped && i % 2 === 1
                ? isDark ? "bg-gray-800/50" : "bg-gray-50"
                : isDark ? "hover:bg-gray-800/30" : "hover:bg-gray-50"
            }`}>
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-3 border-b ${
                  isDark
                    ? "text-gray-300 border-gray-700/50"
                    : "text-gray-600 border-gray-100"
                }`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
