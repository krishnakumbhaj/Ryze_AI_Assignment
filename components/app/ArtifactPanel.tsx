"use client";

import React, { useState, useRef, useEffect } from "react";
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
  isCodeStreaming: boolean;
  onCodeChange?: (newCode: string) => void;
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
  isCodeStreaming,
  onCodeChange,
}: ArtifactPanelProps) {
  const [copied, setCopied] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<"light" | "dark">("light");
  const codeScrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEdited, setIsEdited] = useState(false);

  // Auto-scroll code view during streaming
  useEffect(() => {
    if (isCodeStreaming && codeScrollRef.current && activeTab === "code") {
      codeScrollRef.current.scrollTop = codeScrollRef.current.scrollHeight;
    }
    // Reset edited flag when new code starts streaming
    if (isCodeStreaming) {
      setIsEdited(false);
    }
  }, [code, isCodeStreaming, activeTab]);

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
          {activeTab === "code" && code && !isCodeStreaming && (
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
      <div className="flex-1 overflow-auto min-h-0" ref={activeTab === "code" ? codeScrollRef : undefined}>
        {activeTab === "preview" ? (
          /* ── Preview Tab ── */
          isLoading && !tree ? (
            <div className="flex flex-col items-center justify-center h-64 text-center gap-4 animate-fade-in">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-[#a5d5d5]/10 border border-[#a5d5d5]/20 flex items-center justify-center">
                  <span className="w-5 h-5 border-2 border-[#a5d5d5]/30 border-t-[#a5d5d5] rounded-full animate-spin" />
                </div>
              </div>
              <div>
                <p className="text-sm text-zinc-400 font-medium">Generating UI...</p>
                <p className="text-xs text-zinc-600 mt-1">Building AST and rendering preview</p>
              </div>
            </div>
          ) : (
            <div className={`h-full rounded-b-none transition-colors ${
              previewTheme === "dark" ? "bg-gray-900" : "bg-white"
            }`}>
              <PreviewRenderer tree={tree} theme={previewTheme} />
            </div>
          )
        ) : (
          /* ── Code Tab ── */
          <div className="p-3 sm:p-4 h-full">
            {isLoading && !code ? (
              <div className="flex flex-col items-center justify-center h-64 text-center gap-4 animate-fade-in">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-[#a5d5d5]/10 border border-[#a5d5d5]/20 flex items-center justify-center">
                    <span className="w-5 h-5 border-2 border-[#a5d5d5]/30 border-t-[#a5d5d5] rounded-full animate-spin" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-zinc-400 font-medium">Generating React code...</p>
                  <p className="text-xs text-zinc-600 mt-1">Converting AST to JSX components</p>
                </div>
              </div>
            ) : code ? (
              <div className="relative h-full">
                {isCodeStreaming ? (
                  <pre className="text-[11px] sm:text-[13px] leading-relaxed font-mono text-zinc-300 whitespace-pre-wrap break-words m-0">
                    <code>{code}</code>
                    <span className="inline-block w-[6px] h-[15px] bg-[#a5d5d5] rounded-sm animate-pulse align-middle ml-0.5" />
                  </pre>
                ) : (
                  <>
                    <textarea
                      ref={textareaRef}
                      className="w-full h-full min-h-[400px] bg-transparent text-[11px] sm:text-[13px] leading-relaxed font-mono text-zinc-300 whitespace-pre break-words m-0 outline-none resize-none border-none focus:ring-0"
                      value={code}
                      onChange={(e) => {
                        setIsEdited(true);
                        onCodeChange?.(e.target.value);
                      }}
                      spellCheck={false}
                      autoCorrect="off"
                      autoCapitalize="off"
                    />
                    {isEdited && (
                      <div className="sticky bottom-2 flex justify-end px-2 pointer-events-none">
                        <span className="text-[10px] text-[#a5d5d5]/70 bg-[#1f1e1d]/90 px-2 py-0.5 rounded-full border border-[#a5d5d5]/20 pointer-events-auto">
                          Editing — preview updates live
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
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
