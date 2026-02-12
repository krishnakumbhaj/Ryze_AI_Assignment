import { ComponentNode, PlanOutput } from "./types";
import { callGemini, extractJSON } from "./gemini";
import { getPlannerPrompt } from "./prompts";
import { validatePlanOutput } from "./validation";

export async function runPlanner(
  userMessage: string,
  previousTree: ComponentNode | null,
  proMode: boolean = false
): Promise<PlanOutput> {
  const previousTreeStr = previousTree
    ? JSON.stringify(previousTree, null, 2)
    : null;

  const prompt = getPlannerPrompt(userMessage, previousTreeStr, proMode);
  const rawResponse = await callGemini(prompt);
  const jsonStr = extractJSON(rawResponse);

  let plan: PlanOutput;
  try {
    plan = JSON.parse(jsonStr);
  } catch {
    throw new Error(
      `Planner returned invalid JSON: ${jsonStr.substring(0, 200)}`
    );
  }

  if (!validatePlanOutput(plan)) {
    throw new Error("Planner output does not match expected schema");
  }

  return plan;
}
