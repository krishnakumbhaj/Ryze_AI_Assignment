import { ComponentNode, PlanOutput } from "./types";
import { callGemini } from "./gemini";
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
  const rawResponse = await callGemini(prompt);

  // The explainer returns plain text, not JSON
  // Strip any markdown formatting if present
  return rawResponse
    .replace(/^```\w*\n?/, "")
    .replace(/\n?```$/, "")
    .trim();
}
