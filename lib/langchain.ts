// LangChain TypeScript SDK client for Gemini
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const GEMINI_MODEL = "gemini-2.5-flash";

/**
 * Create a ChatGoogleGenerativeAI instance.
 * Reused across planner, generator, and explainer.
 */
export function createModel(options?: {
  temperature?: number;
  maxOutputTokens?: number;
}): ChatGoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  return new ChatGoogleGenerativeAI({
    model: GEMINI_MODEL,
    apiKey,
    temperature: options?.temperature ?? 0.1,
    maxOutputTokens: options?.maxOutputTokens ?? 8192,
    maxRetries: 3,
  });
}

/**
 * Invoke the model with a system + human message pair and return the text response.
 * Used for planner, generator, and intent classifier (JSON responses).
 */
export async function invokeModel(
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; maxOutputTokens?: number }
): Promise<string> {
  const model = createModel(options);
  const response = await model.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt),
  ]);
  return typeof response.content === "string"
    ? response.content
    : JSON.stringify(response.content);
}

/**
 * Stream the model response token by token.
 * Used for the explainer step.
 */
export async function* streamModel(
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; maxOutputTokens?: number }
): AsyncGenerator<string> {
  const model = createModel(options);
  const stream = await model.stream([
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt),
  ]);
  for await (const chunk of stream) {
    const text =
      typeof chunk.content === "string"
        ? chunk.content
        : Array.isArray(chunk.content)
          ? chunk.content
              .filter((b) => typeof b === "string" || (typeof b === "object" && "text" in b))
              .map((b) => (typeof b === "string" ? b : (b as { text: string }).text))
              .join("")
          : "";
    if (text) yield text;
  }
}

/**
 * Extract JSON from a model response that may contain markdown fences.
 */
export function extractJSON(raw: string): string {
  // Try to find JSON in markdown code blocks first
  const fenced = raw.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();

  // Try to find a JSON object or array directly
  const jsonMatch = raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) return jsonMatch[1].trim();

  return raw.trim();
}
