"use client";

import React from "react";
import { AgentStep } from "@/lib/types";

interface StepIndicatorProps {
  currentStep: AgentStep | null;
  message?: string;
}

const STEPS: { key: AgentStep; label: string; icon: string }[] = [
  { key: "planning", label: "Planning", icon: "🧠" },
  { key: "generating", label: "Generating", icon: "⚙️" },
  { key: "explaining", label: "Explaining", icon: "💬" },
];

function getStepStatus(
  stepKey: AgentStep,
  currentStep: AgentStep | null
): "pending" | "active" | "done" {
  if (!currentStep) return "pending";

  const order: AgentStep[] = [
    "planning",
    "plan_complete",
    "generating",
    "generate_complete",
    "explaining",
    "complete",
  ];

  const currentIdx = order.indexOf(currentStep);

  if (currentStep === "complete") return "done";
  if (currentStep === "error") return "pending";

  if (stepKey === "planning") {
    if (currentIdx >= order.indexOf("plan_complete")) return "done";
    if (currentStep === "planning") return "active";
  }
  if (stepKey === "generating") {
    if (currentIdx >= order.indexOf("generate_complete")) return "done";
    if (currentStep === "generating") return "active";
  }
  if (stepKey === "explaining") {
    if (currentStep === ("complete" as AgentStep)) return "done";
    if (currentStep === "explaining") return "active";
  }

  const stepIdx = order.indexOf(stepKey);
  if (stepIdx > currentIdx) return "pending";
  return "done";
}

export default function StepIndicator({
  currentStep,
  message,
}: StepIndicatorProps) {
  if (!currentStep) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => {
          const status = getStepStatus(step.key, currentStep);
          return (
            <React.Fragment key={step.key}>
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    status === "done"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : status === "active"
                        ? "bg-indigo-500/20 text-indigo-400 animate-pulse-dot"
                        : "bg-zinc-700/50 text-zinc-500"
                  }`}
                >
                  {status === "done" ? "✓" : step.icon}
                </div>
                <span
                  className={`text-[11px] font-medium ${
                    status === "done"
                      ? "text-emerald-400"
                      : status === "active"
                        ? "text-indigo-400"
                        : "text-zinc-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-4 h-px mx-0.5 ${
                    status === "done" ? "bg-emerald-500/40" : "bg-zinc-700"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      {message && (
        <p className="text-[11px] text-zinc-500 m-0 pl-0.5">{message}</p>
      )}
    </div>
  );
}
