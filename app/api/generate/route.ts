import { NextRequest } from "next/server";
import { runPlanner } from "@/lib/planner";
import { runGenerator } from "@/lib/generator";
import { runExplainer } from "@/lib/explainer";
import { runExplainerStream } from "@/lib/explainer";
import { treeToCode } from "@/lib/codeGenerator";
import { addVersion, getLatestVersion } from "@/lib/versionStore";
import { callGemini, extractJSON } from "@/lib/gemini";
import { getIntentClassifierPrompt } from "@/lib/prompts";
import { GenerateRequest, SSEEvent } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

        // Send component tree immediately so preview works right away
        sendSSE(controller, encoder, {
          step: "generate_complete",
          message: "UI generated. Streaming code...",
          componentTree,
        });

        // Stream code line-by-line for visible typewriter effect
        const codeLines = code.split("\n");
        for (let i = 0; i < codeLines.length; i++) {
          const line = codeLines[i];
          const suffix = i < codeLines.length - 1 ? "\n" : "";
          sendSSE(controller, encoder, { codeChunk: line + suffix });
          await sleep(50); // 50ms per line — slow enough to see streaming
        }

        // Step 3: Stream explanation token-by-token
        sendSSE(controller, encoder, {
          step: "explaining",
          message: "Explaining the design decisions...",
        });

        let fullExplanation = "";
        try {
          for await (const chunk of runExplainerStream(plan, prevTree, componentTree)) {
            fullExplanation += chunk;
            sendSSE(controller, encoder, { explanationChunk: chunk });
          }
          // Clean up markdown formatting
          fullExplanation = fullExplanation
            .replace(/^```\w*\n?/, "")
            .replace(/\n?```$/, "")
            .trim();
        } catch (streamError) {
          // Fallback to non-streaming explainer
          console.warn("Streaming explainer failed, falling back:", streamError);
          fullExplanation = await runExplainer(plan, prevTree, componentTree);
          sendSSE(controller, encoder, { explanationChunk: fullExplanation });
        }

        // Save version
        const version = addVersion(componentTree, code, fullExplanation);

        // Send final result with all data
        sendSSE(controller, encoder, {
          step: "complete",
          code,
          explanation: fullExplanation,
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
