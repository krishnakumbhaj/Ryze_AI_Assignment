"use client";

import React, { useState } from "react";
import { ComponentNode } from "@/lib/types";
import PreviewRenderer from "./PreviewRenderer";
import { Sun, Moon } from "lucide-react";

interface ArtifactPanelProps {
  tree: ComponentNode | null;
  code: string;
  activeTab: "preview" | "code";
  onTabChange: (tab: "preview" | "code") => void;
  currentVersion: number | null;
  totalVersions: number;
  onVersionChange: (version: number) => void;
  onRegenerate: () => void;
  onClose: () => void;
  isLoading: boolean;
}

export default function ArtifactPanel({
  tree,
  code,
  activeTab,
  onTabChange,
  currentVersion,
  totalVersions,
  onVersionChange,
  onRegenerate,
  onClose,
  isLoading,
}: ArtifactPanelProps) {
  const [copied, setCopied] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light");

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const togglePreviewTheme = () => {
    setPreviewTheme(prev => prev === "light" ? "dark" : "light");
  };

  return (
    <div className="flex flex-col h-full bg-[#1f1e1d]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 border-b border-[#3f3f3a] shrink-0">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-[#30302e] rounded-lg p-0.5">
          <button
            onClick={() => onTabChange("preview")}
            className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === "preview"
                ? "bg-[#262624] text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => onTabChange("code")}
            className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === "code"
                ? "bg-[#262624] text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Code
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Theme toggle (preview tab only) */}
          {activeTab === "preview" && (
            <button
              onClick={togglePreviewTheme}
              className={`p-1 sm:p-1.5 rounded-md transition-colors cursor-pointer ${
                previewTheme === "dark"
                  ? "bg-[#a5d5d5]/20 text-[#a5d5d5]"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-[#30302e]"
              }`}
              title={`Switch to ${previewTheme === "light" ? "dark" : "light"} theme`}
            >
              {previewTheme === "light" ? (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>
          )}

          {/* Version selector */}
          {totalVersions > 0 && (
            <select
              className="bg-[#30302e] border border-[#3f3f3a] rounded-md px-1.5 sm:px-2 py-1 text-[10px] sm:text-xs text-zinc-400 outline-none cursor-pointer focus:border-[#a5d5d5]/50"
              value={currentVersion || ""}
              onChange={(e) => onVersionChange(Number(e.target.value))}
              disabled={isLoading}
            >
              {Array.from({ length: totalVersions }, (_, i) => i + 1).map(
                (v) => (
                  <option key={v} value={v}>
                    v{v}
                  </option>
                )
              )}
            </select>
          )}

          {/* Regenerate */}
          <button
            onClick={onRegenerate}
            disabled={isLoading || !tree}
            className="text-zinc-500 hover:text-zinc-300 p-1 sm:p-1.5 rounded-md hover:bg-[#30302e] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Regenerate"
          >
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
            </svg>
          </button>

          {/* Copy (code tab only) */}
          {activeTab === "code" && code && (
            <button
              onClick={handleCopy}
              className="text-[10px] sm:text-xs text-zinc-500 hover:text-zinc-300 px-1.5 sm:px-2 py-1 rounded-md hover:bg-[#30302e] transition-colors cursor-pointer"
            >
              {copied ? "✓" : "Copy"}
            </button>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1 sm:p-1.5 rounded-md hover:bg-[#30302e] transition-colors cursor-pointer"
            title="Close panel"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto min-h-0">
        {activeTab === "preview" ? (
          <div className={`h-full rounded-b-none transition-colors ${
            previewTheme === "dark" ? "bg-gray-900" : "bg-white"
          }`}>
            <PreviewRenderer tree={tree} theme={previewTheme} />
          </div>
        ) : (
          <div className="p-3 sm:p-4">
            {code ? (
              <pre className="text-[11px] sm:text-[13px] leading-relaxed font-mono text-zinc-300 whitespace-pre-wrap break-words m-0">
                <code>{code}</code>
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
                <div className="text-3xl opacity-30">📝</div>
                <p className="text-sm text-zinc-600">No code generated yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
