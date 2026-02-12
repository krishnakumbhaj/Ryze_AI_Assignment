import { ComponentNode, PlanOutput } from "./types";
import { callGemini, extractJSON } from "./gemini";
import { getGeneratorPrompt } from "./prompts";
import { validateComponentTree } from "./validation";

export async function runGenerator(
  plan: PlanOutput,
  previousTree: ComponentNode | null,
  proMode: boolean = false
): Promise<ComponentNode> {
  const planStr = JSON.stringify(plan, null, 2);
  const previousTreeStr = previousTree
    ? JSON.stringify(previousTree, null, 2)
    : null;

  const prompt = getGeneratorPrompt(planStr, previousTreeStr, proMode);
  const rawResponse = await callGemini(prompt);
  const jsonStr = extractJSON(rawResponse);

  let tree: unknown;
  try {
    tree = JSON.parse(jsonStr);
  } catch {
    throw new Error(
      `Generator returned invalid JSON: ${jsonStr.substring(0, 200)}`
    );
  }

  // Validate and sanitize the component tree
  const validation = validateComponentTree(tree);

  if (validation.errors.length > 0) {
    console.warn("Component tree validation warnings:", validation.errors);
  }

  if (!validation.sanitizedTree) {
    throw new Error("Generator produced an invalid component tree");
  }

  return validation.sanitizedTree;
}
