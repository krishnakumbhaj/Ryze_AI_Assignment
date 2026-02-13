import { ComponentNode, PlanOutput } from "./types";
import { invokeModel, streamModel } from "./langchain";
import { getExplainerPrompt } from "./prompts";

export async function runExplainer(
  plan: PlanOutput,
  previousTree: ComponentNode | null,
  newTree: ComponentNode
): Promise<string> {
  const planStr = JSON.stringify(plan, null, 2);
  const previousTreeStr = previousTree
    ? JSON.stringify(previousTree, null, 2)
    : null;
  const newTreeStr = JSON.stringify(newTree, null, 2);

  const prompt = getExplainerPrompt(planStr, previousTreeStr, newTreeStr);
  const rawResponse = await invokeModel(
    "You are a concise UI explainer. Respond in plain text, not JSON.",
    prompt
  );

  // The explainer returns plain text, not JSON
  // Strip any markdown formatting if present
  return rawResponse
    .replace(/^```\w*\n?/, "")
    .replace(/\n?```$/, "")
    .trim();
}

// Streaming version - yields text chunks as they arrive from the LLM
export async function* runExplainerStream(
  plan: PlanOutput,
  previousTree: ComponentNode | null,
  newTree: ComponentNode
): AsyncGenerator<string> {
  const planStr = JSON.stringify(plan, null, 2);
  const previousTreeStr = previousTree
    ? JSON.stringify(previousTree, null, 2)
    : null;
  const newTreeStr = JSON.stringify(newTree, null, 2);

  const prompt = getExplainerPrompt(planStr, previousTreeStr, newTreeStr);
  yield* streamModel(
    "You are a concise UI explainer. Respond in plain text, not JSON.",
    prompt
  );
}
