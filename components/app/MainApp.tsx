"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import ChatPanel from "./ChatPanel";
import ArtifactPanel from "./ArtifactPanel";
import { ChatMessage, AgentStep, ComponentNode, SSEEvent } from "@/lib/types";
import logo from "@/images/logo.png"
import logo_name from "@/images/logo_name.png"
import Image from "next/image";
export default function MainApp() {
  // Messages & loading
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<AgentStep | null>(null);
  const [stepMessage, setStepMessage] = useState("");
  const [planIntent, setPlanIntent] = useState("");

  // Pro mode
  const [proMode, setProMode] = useState(false);

  // Artifacts
  const [code, setCode] = useState("");
  const [tree, setTree] = useState<ComponentNode | null>(null);
  const [showArtifact, setShowArtifact] = useState(false);
  const [artifactTab, setArtifactTab] = useState<"preview" | "code">("preview");

  // Versions
  const [totalVersions, setTotalVersions] = useState(0);
  const [currentVersion, setCurrentVersion] = useState<number | null>(null);

  // Resizable panel
  const [panelWidth, setPanelWidth] = useState(55);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mobile artifact view
  const [mobileShowArtifact, setMobileShowArtifact] = useState(false);

  const controllerRef = useRef<AbortController | null>(null);
  const treeRef = useRef<ComponentNode | null>(null);
  const proModeRef = useRef(false);

  useEffect(() => {
    treeRef.current = tree;
  }, [tree]);

  useEffect(() => {
    proModeRef.current = proMode;
  }, [proMode]);

  // ── Resize drag handlers ──
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = ((rect.width - x) / rect.width) * 100;
      setPanelWidth(Math.min(Math.max(pct, 25), 75));
    };
    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const fetchVersionCount = useCallback(async () => {
    try {
      const res = await fetch("/api/versions");
      const data = await res.json();
      setTotalVersions((data.versions || []).length);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchVersionCount();
  }, [fetchVersionCount]);

  const appendMessage = useCallback(
    (
      role: "user" | "assistant",
      content: string,
      messageType?: ChatMessage["messageType"],
      artifactVersion?: number
    ) => {
      setMessages((prev) => [
        ...prev,
        { role, content, messageType: messageType || "text", artifactVersion },
      ]);
    },
    []
  );

  // ── Cancel handler ──
  const handleCancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setIsLoading(false);
    setCurrentStep(null);
    setStepMessage("");
    appendMessage("assistant", "Generation cancelled.", "text");
  }, [appendMessage]);

  // ── Send handler with SSE streaming ──
  const handleSend = useCallback(
    async (message: string, useProMode?: boolean) => {
      const isProMode = useProMode ?? proModeRef.current;
      appendMessage("user", message);
      setIsLoading(true);
      setCurrentStep(null); // Don't assume pipeline; let SSE drive steps
      setStepMessage("");
      setPlanIntent("");

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, previousTree: treeRef.current, proMode: isProMode }),
          signal: controller.signal,
        });

        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            const trimmed = part.trim();
            if (!trimmed.startsWith("data: ")) continue;

            let evt: SSEEvent;
            try {
              evt = JSON.parse(trimmed.slice(6));
            } catch {
              continue;
            }

            // Direct chat response (no UI generation)
            if (evt.directResponse) {
              appendMessage("assistant", evt.directResponse);
              continue;
            }

            // Update step
            if (evt.step) {
              setCurrentStep(evt.step);
              if (evt.message) setStepMessage(evt.message);
            }

            // Plan received → show in chat
            if (evt.plan) {
              const intent = evt.plan.intent || "Analyzing UI structure...";
              setPlanIntent(intent);
              appendMessage("assistant", intent, "plan");
            }

            // Code received
            if (evt.code) {
              setCode(evt.code);
            }

            // Component tree
            if (evt.componentTree) {
              setTree(evt.componentTree);
            }

            // Explanation received → show as artifact card with version
            if (evt.explanation && evt.version) {
              appendMessage("assistant", evt.explanation, "artifact", evt.version);
              setShowArtifact(true);
              setArtifactTab("preview");
            } else if (evt.explanation) {
              appendMessage("assistant", evt.explanation);
            }

            // Version saved
            if (evt.version) {
              setCurrentVersion(evt.version);
              fetchVersionCount();
            }

            // Error
            if (evt.error) {
              appendMessage("assistant", `Error: ${evt.error}`, "error");
              setCurrentStep("error");
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        const msg = err instanceof Error ? err.message : String(err);
        appendMessage("assistant", `Generation failed: ${msg}`, "error");
        setCurrentStep("error");
      } finally {
        setIsLoading(false);
        setCurrentStep(null);
        controllerRef.current = null;
      }
    },
    [appendMessage, fetchVersionCount]
  );

  const handleRegenerate = useCallback(async () => {
    await handleSend("Regenerate the current UI with the same structure.");
  }, [handleSend]);

  const handleVersionChange = useCallback(async (v: number) => {
    try {
      const res = await fetch(`/api/versions?version=${v}`);
      if (!res.ok) return;
      const data = await res.json();
      setTree(data.componentTree || null);
      setCode(data.code || "");
      setCurrentVersion(data.version || null);
      setShowArtifact(true);
    } catch {
      /* ignore */
    }
  }, []);

  const handleOpenArtifact = useCallback(
    (version?: number) => {
      if (version) handleVersionChange(version);
      else setShowArtifact(true);
      // Show artifact in mobile view
      setMobileShowArtifact(true);
    },
    [handleVersionChange]
  );

  // ── Edit message handler ──
  const handleEditMessage = useCallback(
    (index: number, newMessage: string) => {
      // Remove all messages from the edited index onward
      setMessages((prev) => prev.slice(0, index));
      // Re-send with the new message
      handleSend(newMessage);
    },
    [handleSend]
  );

  return (
    <div className="flex flex-col h-screen bg-[#262624] overflow-hidden">
      {/* ═══ Top Bar ═══ */}
      <header className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-2.5 border-b border-[#3f3f3a] bg-[#1f1e1d] shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <Image src={logo} alt="Logo" className="w-8 h-8 sm:w-8 sm:h-8" />
          <Image src={logo_name} alt="Logo Name" className="h-8 w-32 sm:h-8" />
          <span className="text-[9px] sm:text-[10px] text-zinc-500 bg-[#30302e] px-1.5 sm:px-2 py-0.5 rounded-full hidden sm:inline">
            UI Generator
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {currentVersion && (
            <span className="text-[10px] sm:text-[11px] text-zinc-500 hidden sm:inline">
              v{currentVersion} / {totalVersions}
            </span>
          )}
          {isLoading && (
            <span className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] text-[#a5d5d5]">
              <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#a5d5d5] rounded-full animate-pulse-dot" />
              <span className="hidden xs:inline">Processing</span>
            </span>
          )}
          {tree && !showArtifact && !mobileShowArtifact && (
            <button
              onClick={() => {
                setShowArtifact(true);
                setMobileShowArtifact(true);
              }}
              className="text-[10px] sm:text-xs text-zinc-400 hover:text-white bg-[#30302e] hover:bg-[#3c3b39] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-colors cursor-pointer border border-[#3f3f3a]/50"
            >
              Preview
            </button>
          )}
        </div>
      </header>

      {/* ═══ Main Content - Desktop ═══ */}
      <div ref={containerRef} className="hidden md:flex flex-1 min-h-0 overflow-hidden">
        {/* Chat Area */}
        <div
          className="flex flex-col min-w-0"
          style={{ width: showArtifact ? `${100 - panelWidth}%` : "100%" }}
        >
          <ChatPanel
            messages={messages}
            onSend={handleSend}
            isLoading={isLoading}
            currentStep={currentStep}
            stepMessage={stepMessage}
            planIntent={planIntent}
            hasArtifact={showArtifact}
            onCancel={handleCancel}
            onOpenArtifact={handleOpenArtifact}
            onEditMessage={handleEditMessage}
            proMode={proMode}
            onProModeToggle={setProMode}
          />
        </div>

        {/* Resize Handle + Artifact Panel */}
        {showArtifact && (
          <>
            {/* Drag Handle */}
            <div
              className="w-[5px] shrink-0 bg-transparent hover:bg-[#a5d5d5]/30 active:bg-[#a5d5d5]/50 cursor-col-resize transition-colors relative group"
              onMouseDown={(e) => {
                e.preventDefault();
                isDragging.current = true;
                document.body.style.cursor = "col-resize";
                document.body.style.userSelect = "none";
              }}
            >
              <div className="absolute inset-y-0 -left-[2px] -right-[2px]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-zinc-600 group-hover:bg-[#a5d5d5] transition-colors" />
            </div>

            {/* Artifact Panel */}
            <div
              className="min-w-0 border-l border-[#3f3f3a] animate-fade-in"
              style={{ width: `${panelWidth}%` }}
            >
              <ArtifactPanel
                tree={tree}
                code={code}
                activeTab={artifactTab}
                onTabChange={setArtifactTab}
                currentVersion={currentVersion}
                totalVersions={totalVersions}
                onVersionChange={handleVersionChange}
                onRegenerate={handleRegenerate}
                onClose={() => setShowArtifact(false)}
                isLoading={isLoading}
              />
            </div>
          </>
        )}
      </div>

      {/* ═══ Main Content - Mobile ═══ */}
      <div className="flex md:hidden flex-1 min-h-0 overflow-hidden relative">
        {/* Chat Area (always rendered but hidden when artifact is shown) */}
        <div
          className={`flex flex-col w-full absolute inset-0 transition-transform duration-300 ${
            mobileShowArtifact ? "-translate-x-full" : "translate-x-0"
          }`}
        >
          <ChatPanel
            messages={messages}
            onSend={handleSend}
            isLoading={isLoading}
            currentStep={currentStep}
            stepMessage={stepMessage}
            planIntent={planIntent}
            hasArtifact={false}
            onCancel={handleCancel}
            onOpenArtifact={handleOpenArtifact}
            onEditMessage={handleEditMessage}
            proMode={proMode}
            onProModeToggle={setProMode}
          />
        </div>

        {/* Artifact Panel (slides in from right) */}
        <div
          className={`flex flex-col w-full absolute inset-0 bg-[#262624] transition-transform duration-300 ${
            mobileShowArtifact ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {tree && (
            <ArtifactPanel
              tree={tree}
              code={code}
              activeTab={artifactTab}
              onTabChange={setArtifactTab}
              currentVersion={currentVersion}
              totalVersions={totalVersions}
              onVersionChange={handleVersionChange}
              onRegenerate={handleRegenerate}
              onClose={() => setMobileShowArtifact(false)}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
