import { NextRequest } from "next/server";
import { runPlanner } from "@/lib/planner";
import { runGenerator } from "@/lib/generator";
import { runExplainer } from "@/lib/explainer";
import { runExplainerStream } from "@/lib/explainer";
import { addVersion, getLatestVersion } from "@/lib/versionStore";
import { invokeModel, extractJSON } from "@/lib/langchain";
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

        // Step 0: Intent Classification via LangChain
        const classifierResult = await invokeModel(
          "You are Ryze AI, a deterministic UI generator. Classify user intent as JSON.",
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
          message: "Plan created. Generating AST...",
          plan,
        });

        // Step 2: Generator — produces AST (no code)
        sendSSE(controller, encoder, {
          step: "generating",
          message: "Generating UI AST from the plan...",
        });

        const componentTree = await runGenerator(plan, prevTree, proMode);

        // Send AST immediately so preview renders right away
        sendSSE(controller, encoder, {
          step: "generate_complete",
          message: "AST generated. Preparing explanation...",
          componentTree,
        });

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

        // Save version (no code — only AST + explanation)
        const version = addVersion(componentTree, fullExplanation);

        // Send final result with all data
        sendSSE(controller, encoder, {
          step: "complete",
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
