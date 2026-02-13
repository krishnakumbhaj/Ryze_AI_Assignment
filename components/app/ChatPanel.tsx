"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, AgentStep } from "@/lib/types";
import { BrainCog, Pencil, Copy, Check } from "lucide-react";
import logo from "@/images/logo.png"
import Image from "next/image";
interface ChatPanelProps {
  messages: ChatMessage[];
  onSend: (message: string, proMode?: boolean) => void;
  isLoading: boolean;
  currentStep: AgentStep | null;
  stepMessage?: string;
  planIntent?: string;
  hasArtifact?: boolean;
  onCancel?: () => void;
  onOpenArtifact?: (version?: number) => void;
  onEditMessage?: (index: number, newMessage: string) => void;
  proMode: boolean;
  onProModeToggle: (value: boolean) => void;
}


const SUGGESTIONS = [
  { label: "Login Form", prompt: "Create a login form with email and password inputs" },
  { label: "Dashboard", prompt: "Build a dashboard with a navbar, sidebar, and a data table" },
  { label: "Pricing Page", prompt: "Create a pricing page with three cards" },
  { label: "Settings Panel", prompt: "Build a settings page with input fields and a save button" },
];

export default function ChatPanel({
  messages,
  onSend,
  isLoading,
  currentStep,
  stepMessage,
  planIntent,
  hasArtifact,
  onCancel,
  onOpenArtifact,
  onEditMessage,
  proMode,
  onProModeToggle,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentStep]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input.trim(), proMode);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleEditMessage = (index: number, content: string) => {
    if (onEditMessage) {
      onEditMessage(index, content);
    }
  };

  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <div className="flex flex-col h-full">
      {isEmpty ? (
        /* ═══ Welcome Screen ═══ */
        <div className="flex-1 flex items-center justify-center px-4">
          <div className={`text-center w-full mx-auto transform -translate-y-6 ${hasArtifact ? "max-w-lg" : "max-w-2xl"}`}>
            <div className="inline-flex mb-6">
              <Image src={logo} alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 mr-2" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white mb-2">
              What would you like to build?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mb-6 sm:mb-8">
              Describe a UI in plain English and I&apos;ll generate it, or just say hello.
            </p>

            <div className="relative mb-6">
              <div className="bg-[#30302e] rounded-2xl border border-[#3f3f3a] focus-within:border-[#a5d5d5]/50 focus-within:ring-1 focus-within:ring-[#a5d5d5]/25 transition-all">
                <textarea
                  ref={textareaRef}
                  className="w-full bg-transparent text-white placeholder:text-zinc-500 px-4 sm:px-5 pt-4 pb-14 text-sm sm:text-base outline-none resize-none min-h-[56px] max-h-[200px]"
                  placeholder="Describe your UI or ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <button
                    onClick={() => onProModeToggle(!proMode)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      proMode
                        ? "bg-[#a5d5d5]/20 text-[#a5d5d5] border border-[#a5d5d5]/30"
                        : "bg-zinc-700/50 text-zinc-400 border border-zinc-600/30 hover:bg-zinc-700 hover:text-zinc-300"
                    }`}
                    title={proMode ? "Pro mode enabled - Better designs with AI creativity" : "Enable Pro mode for better designs"}
                  >
                    <BrainCog className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Pro</span>
                  </button>
                  <button
                    onClick={() => handleSubmit()}
                    disabled={!input.trim() || isLoading}
                    className="w-9 h-9 rounded-full bg-[#a5d5d5] hover:bg-[#92c9c9] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => onSend(s.prompt, proMode)}
                  disabled={isLoading}
                  className="text-left px-3 sm:px-4 py-2.5 sm:py-3 bg-[#30302e] hover:bg-[#3c3b39] text-zinc-400 hover:text-zinc-200 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer border border-[#3f3f3a]/50 hover:border-[#52525b]"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ═══ Messages ═══ */}
          <div className="flex-1 overflow-y-auto scrollbar-hidden">
            <div className={`mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5 ${hasArtifact ? "max-w-xl" : "max-w-3xl"}`}>
              {messages.map((msg, i) => (
                <MessageBubble 
                  key={i} 
                  message={msg} 
                  messageIndex={i}
                  onOpenArtifact={onOpenArtifact}
                  onEdit={(newContent) => handleEditMessage(i, newContent)}
                  isLoading={isLoading}
                />
              ))}

              {/* Simple thinking indicator (before step data arrives) */}
              {isLoading && !currentStep && (
                <div className="animate-slide-up">
                  <div className="flex items-center gap-2.5">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-[#a5d5d5]/15 border-[1.5px] border-[#a5d5d5]/25 flex items-center justify-center">
                      <span className="w-3.5 h-3.5 border-2 border-[#a5d5d5]/30 border-t-[#a5d5d5] rounded-full animate-spin" />
                    </div>
                    <span className="text-sm text-zinc-500">Thinking...</span>
                  </div>
                </div>
              )}

              {/* Pipeline step progress */}
              {isLoading && currentStep && currentStep !== "complete" && currentStep !== "error" && (
                <div className="animate-slide-up">
                  <StepProgress
                    currentStep={currentStep}
                    stepMessage={stepMessage}
                    planIntent={planIntent}
                  />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* ═══ Bottom Input ═══ */}
          <div className="shrink-0 pb-3 sm:pb-4 pt-2 bg-[#262624]">
            <div className={`mx-auto px-4 sm:px-6 ${hasArtifact ? "max-w-xl" : "max-w-3xl"}`}>
              <div className="bg-[#30302e] rounded-2xl border border-[#3f3f3a] focus-within:border-[#a5d5d5]/50 focus-within:ring-1 focus-within:ring-[#a5d5d5]/25 transition-all relative">
                <textarea
                  ref={textareaRef}
                  className="w-full bg-transparent text-white placeholder:text-zinc-500 px-4 pt-3 pb-12 text-sm outline-none resize-none min-h-[44px] max-h-[200px]"
                  placeholder={isLoading ? "Processing..." : "Describe changes or a new UI..."}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  rows={1}
                />
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <button
                    onClick={() => onProModeToggle(!proMode)}
                    disabled={isLoading}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer disabled:opacity-50 ${
                      proMode
                        ? "bg-[#a5d5d5]/20 text-[#a5d5d5] border border-[#a5d5d5]/30"
                        : "bg-zinc-700/50 text-zinc-400 border border-zinc-600/30 hover:bg-zinc-700 hover:text-zinc-300"
                    }`}
                    title={proMode ? "Pro mode enabled - Better designs with AI creativity" : "Enable Pro mode for better designs"}
                  >
                    <BrainCog className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Pro</span>
                  </button>
                  {isLoading ? (
                    <button
                      onClick={onCancel}
                      className="w-8 h-8 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center transition-colors cursor-pointer"
                      title="Cancel generation"
                    >
                      <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubmit()}
                      disabled={!input.trim()}
                      className="w-8 h-8 rounded-full bg-[#a5d5d5] hover:bg-[#92c9c9] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Copy Button with Animation
   ═══════════════════════════════════════════════ */
function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-1.5 rounded-lg hover:bg-zinc-700/50 text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer ${className}`}
      title="Copy to clipboard"
    >
      <div className="relative w-3.5 h-3.5">
        <Copy 
          className={`w-3.5 h-3.5 absolute inset-0 transition-all duration-200 ${
            copied ? "opacity-0 scale-75" : "opacity-100 scale-100"
          }`} 
        />
        <Check 
          className={`w-3.5 h-3.5 absolute inset-0 text-emerald-400 transition-all duration-200 ${
            copied ? "opacity-100 scale-100" : "opacity-0 scale-75"
          }`} 
        />
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════
   Message Bubble
   ═══════════════════════════════════════════════ */
function MessageBubble({
  message,
  messageIndex,
  onOpenArtifact,
  onEdit,
  isLoading,
}: {
  message: ChatMessage;
  messageIndex: number;
  onOpenArtifact?: (version?: number) => void;
  onEdit?: (newContent: string) => void;
  isLoading?: boolean;
}) {
  const { role, content, messageType, artifactVersion } = message;
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && editTextareaRef.current) {
      editTextareaRef.current.focus();
      editTextareaRef.current.style.height = "auto";
      editTextareaRef.current.style.height = editTextareaRef.current.scrollHeight + "px";
    }
  }, [isEditing]);

  const handleEditSubmit = () => {
    if (editValue.trim() && editValue !== content && onEdit) {
      onEdit(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditValue(content);
    setIsEditing(false);
  };

  /* ── User message ── */
  if (role === "user") {
    if (isEditing) {
      return (
        <div className="flex justify-end animate-slide-up">
          <div className="max-w-[85%] w-full sm:w-auto">
            <div className="bg-[#30302e] rounded-2xl rounded-tr-sm border border-[#a5d5d5]/30">
              <textarea
                ref={editTextareaRef}
                className="w-full bg-transparent text-zinc-200 px-4 py-3 text-sm outline-none resize-none min-h-[44px]"
                value={editValue}
                onChange={(e) => {
                  setEditValue(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleEditSubmit();
                  }
                  if (e.key === "Escape") {
                    handleEditCancel();
                  }
                }}
              />
              <div className="flex items-center gap-2 px-3 pb-2">
                <button
                  onClick={handleEditCancel}
                  className="px-3 py-1 text-xs text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-700/50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  disabled={!editValue.trim() || editValue === content}
                  className="px-3 py-1 text-xs text-white bg-[#a5d5d5] hover:bg-[#92c9c9] rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-end animate-slide-up group">
        <div className="max-w-[85%]">
          <div className="bg-[#30302e] text-zinc-200 rounded-2xl rounded-tr-sm px-4 py-3 border border-[#3f3f3a]/30">
            <p className="text-sm whitespace-pre-wrap m-0">{content}</p>
          </div>
          {/* Action buttons */}
          <div className="flex items-center justify-end gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton text={content} />
            {!isLoading && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 rounded-lg hover:bg-zinc-700/50 text-zinc-500 hover:text-zinc-300 transition-all cursor-pointer"
                title="Edit message"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── Plan message ── */
  if (messageType === "plan") {
    return (
      <div className="flex items-start gap-2 sm:gap-3 animate-slide-up">
        <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#a5d5d5]/15 border-[1.5px] border-[#a5d5d5]/25 flex items-center justify-center text-xs sm:text-sm">
          🧠
        </div>
        <div className="flex-1 max-w-[85%]">
          <div className="bg-[#a5d5d5]/[0.07] border border-[#a5d5d5]/15 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
            <span className="text-[10px] font-semibold text-[#a5d5d5] uppercase tracking-wider">Plan</span>
            <p className="text-xs sm:text-[13px] text-[#a5d5d5]/70 mt-1 m-0 leading-relaxed">{content}</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Error message ── */
  if (messageType === "error") {
    return (
      <div className="flex items-start gap-2 sm:gap-3 animate-slide-up">
        <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-500/15 border-[1.5px] border-red-500/25 flex items-center justify-center text-xs sm:text-sm">
          ⚠
        </div>
        <div className="flex-1 max-w-[85%]">
          <div className="bg-red-500/[0.07] border border-red-500/15 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
            <p className="text-xs sm:text-[13px] text-red-300/80 m-0">{content}</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Artifact message (explanation + clickable artifact card) ── */
  if (messageType === "artifact") {
    return (
      <div className="flex items-start gap-2 sm:gap-3 animate-slide-up group">
        <div className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/15 border-[1.5px] border-emerald-500/25 flex items-center justify-center">
          <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400">AI</span>
        </div>
        <div className="flex-1 max-w-[85%] space-y-2.5">
          {/* Explanation text */}
          <div className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed space-y-1">
            {content.split(/(?<=\.)\s+/).map((sentence, i) => (
              <p key={i} className="m-0">{sentence}</p>
            ))}
          </div>
          {/* Copy button for explanation */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton text={content} />
          </div>
          {/* Artifact card */}
          <button
            onClick={() => onOpenArtifact?.(artifactVersion)}
            className="w-full group/card text-left bg-[#1f1e1d] rounded-xl border border-[#3f3f3a]/40 hover:border-indigo-500/30 transition-all overflow-hidden cursor-pointer"
          >
            <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-indigo-500/15 flex items-center justify-center shrink-0 group-hover/card:bg-indigo-500/25 transition-colors">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs sm:text-[13px] font-medium text-zinc-200 block">Generated UI</span>
                <span className="text-[10px] sm:text-[11px] text-zinc-500">Version {artifactVersion} &middot; Click to preview</span>
              </div>
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-600 group-hover/card:text-[#a5d5d5] transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    );
  }

  /* ── Default assistant text ── */
  return (
    <div className="flex items-start gap-2 sm:gap-3 animate-slide-up group">
      <Image src={logo} alt="Logo" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full   flex items-center justify-center text-xs sm:text-sm" />
      <div className="flex-1 max-w-[85%]">
        <div className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed pt-1.5">
          {content}
        </div>
        {/* Copy button for regular AI message */}
        <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton text={content} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Step Progress — Sequential Circular Indicators
   ═══════════════════════════════════════════════ */
function StepProgress({
  currentStep,
  stepMessage,
  planIntent,
}: {
  currentStep: AgentStep;
  stepMessage?: string;
  planIntent?: string;
}) {
  const allSteps = [
    { key: "planning" as const, label: "Planning", doneLabel: "Plan ready", icon: "🧠" },
    { key: "generating" as const, label: "Generating", doneLabel: "UI generated", icon: "⚙️" },
    { key: "explaining" as const, label: "Explaining", doneLabel: "Done", icon: "💬" },
  ];

  const stepOrder = [
    "planning", "plan_complete", "generating", "generate_complete", "explaining", "complete",
  ];
  const currentIdx = stepOrder.indexOf(currentStep);

  function getStatus(stepKey: string): "done" | "active" | "pending" {
    if (stepKey === "planning") {
      if (currentIdx >= stepOrder.indexOf("plan_complete")) return "done";
      if (currentStep === "planning") return "active";
    }
    if (stepKey === "generating") {
      if (currentIdx >= stepOrder.indexOf("generate_complete")) return "done";
      if (currentStep === "generating") return "active";
    }
    if (stepKey === "explaining") {
      if (currentStep === "complete") return "done";
      if (currentStep === "explaining") return "active";
    }
    const stepIdx = stepOrder.indexOf(stepKey);
    return stepIdx > currentIdx ? "pending" : "done";
  }

  function isVisible(stepKey: string): boolean {
    const stepIdx = stepOrder.indexOf(stepKey);
    return stepIdx <= currentIdx;
  }

  return (
    <div className="flex flex-col gap-1.5">
      {allSteps.map((step) => {
        if (!isVisible(step.key)) return null;
        const status = getStatus(step.key);

        return (
          <div key={step.key} className="flex items-center gap-3 animate-step-in">
            {/* Circle indicator */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                status === "done"
                  ? "bg-emerald-500/15 border-[1.5px] border-emerald-500/30"
                  : status === "active"
                    ? "bg-[#a5d5d5]/15 border-[1.5px] border-[#a5d5d5]/40"
                    : "bg-zinc-800/50 border-[1.5px] border-zinc-700/30"
              }`}
            >
              {status === "done" ? (
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : status === "active" ? (
                <span className="w-4 h-4 border-2 border-[#a5d5d5]/30 border-t-[#a5d5d5] rounded-full animate-spin" />
              ) : (
                <span className="text-xs opacity-40">{step.icon}</span>
              )}
            </div>

            {/* Label */}
            <div className="flex-1 min-w-0">
              <span
                className={`text-xs font-medium ${
                  status === "done"
                    ? "text-emerald-400/80"
                    : status === "active"
                      ? "text-[#a5d5d5]"
                      : "text-zinc-600"
                }`}
              >
                {status === "done" ? step.doneLabel : `${step.label}...`}
              </span>
              {step.key === "planning" && status === "done" && planIntent && (
                <p className="text-[11px] text-zinc-500 truncate m-0 mt-0.5 max-w-[280px]">
                  {planIntent}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {stepMessage && (
        <p className="text-[11px] text-zinc-500 ml-11 mt-0.5 thinking-pulse m-0">
          {stepMessage}
        </p>
      )}
    </div>
  );
}
