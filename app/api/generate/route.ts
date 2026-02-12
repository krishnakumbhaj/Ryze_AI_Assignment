import { NextRequest } from "next/server";
import { runPlanner } from "@/lib/planner";
import { runGenerator } from "@/lib/generator";
import { runExplainer } from "@/lib/explainer";
import { treeToCode } from "@/lib/codeGenerator";
import { addVersion, getLatestVersion } from "@/lib/versionStore";
import { callGemini, extractJSON } from "@/lib/gemini";
import { getIntentClassifierPrompt } from "@/lib/prompts";
import { GenerateRequest, SSEEvent } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sendSSE(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  event: SSEEvent
) {
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
}

export async function POST(request: NextRequest) {
  const body: GenerateRequest = await request.json();
  const { message, previousTree, proMode = false } = body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return new Response(JSON.stringify({ error: "Message is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Use previous tree from request, or fall back to latest version
        const prevTree =
          previousTree || getLatestVersion()?.componentTree || null;

        // Step 0: Intent Classification
        const classifierResult = await callGemini(
          getIntentClassifierPrompt(message, !!prevTree)
        );
        let intent: { type: string; response?: string };
        try {
          intent = JSON.parse(extractJSON(classifierResult));
        } catch {
          intent = { type: "ui" };
        }

        // Chat response → reply directly without UI generation
        if (intent.type === "chat" && intent.response) {
          sendSSE(controller, encoder, {
            step: "complete",
            directResponse: intent.response,
          });
          return;
        }

        // Step 1: Planner
        sendSSE(controller, encoder, {
          step: "planning",
          message: "Analyzing your request and planning the UI structure...",
        });

        const plan = await runPlanner(message, prevTree, proMode);

        sendSSE(controller, encoder, {
          step: "plan_complete",
          message: "Plan created. Generating components...",
          plan,
        });

        // Step 2: Generator
        sendSSE(controller, encoder, {
          step: "generating",
          message: "Generating UI components from the plan...",
        });

        const componentTree = await runGenerator(plan, prevTree, proMode);
        const code = treeToCode(componentTree);

        sendSSE(controller, encoder, {
          step: "generate_complete",
          message: "UI generated. Preparing explanation...",
        });

        // Step 3: Explainer
        sendSSE(controller, encoder, {
          step: "explaining",
          message: "Explaining the design decisions...",
        });

        const explanation = await runExplainer(plan, prevTree, componentTree);

        // Save version
        const version = addVersion(componentTree, code, explanation);

        // Send final result
        sendSSE(controller, encoder, {
          step: "complete",
          code,
          explanation,
          version: version.version,
          componentTree,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unexpected error occurred";
        sendSSE(controller, encoder, {
          step: "error",
          error: errorMessage,
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
