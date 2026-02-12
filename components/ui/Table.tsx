import React from "react";

interface TableProps {
  headers?: string[];
  rows?: string[][];
  striped?: boolean;
}

export default function Table({
  headers = [],
  rows = [],
  striped = false,
}: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        {headers.length > 0 && (
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="text-left px-4 py-2.5 font-semibold text-gray-700 bg-gray-50 border-b-2 border-gray-200">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={striped && i % 2 === 1 ? "bg-gray-50" : ""}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 text-gray-600 border-b border-gray-100">
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
