import { ComponentNode } from "./types";
import { COMPONENT_NAMES } from "./componentSchema";

const ALLOWED_SET = new Set(COMPONENT_NAMES);

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitizedTree?: ComponentNode;
}

// Validate and sanitize a component tree
export function validateComponentTree(tree: unknown): ValidationResult {
  const errors: string[] = [];

  if (!tree || typeof tree !== "object") {
    return { valid: false, errors: ["Component tree must be a non-null object"] };
  }

  const sanitized = validateNode(tree as Record<string, unknown>, errors, "root");

  return {
    valid: errors.length === 0,
    errors,
    sanitizedTree: sanitized,
  };
}

function validateNode(
  node: Record<string, unknown>,
  errors: string[],
  path: string
): ComponentNode {
  // Must have a type
  if (!node.type || typeof node.type !== "string") {
    errors.push(`${path}: missing or invalid "type" field`);
    return { type: "Container", props: {}, children: [] };
  }

  const type = node.type as string;

  // Check whitelist
  if (!ALLOWED_SET.has(type)) {
    errors.push(`${path}: unknown component "${type}" — not in whitelist`);
    // Replace with Container as fallback
    return { type: "Container", props: {}, children: [] };
  }

  // Build sanitized node
  const result: ComponentNode = { type };

  // Copy props (basic sanitization)
  if (node.props && typeof node.props === "object") {
    result.props = sanitizeProps(node.props as Record<string, unknown>);
  }

  // Recursively validate children
  if (Array.isArray(node.children)) {
    result.children = node.children
      .map((child, i) => {
        if (typeof child === "string") {
          return child;
        }
        if (child && typeof child === "object") {
          return validateNode(
            child as Record<string, unknown>,
            errors,
            `${path}.children[${i}]`
          );
        }
        return null;
      })
      .filter((c): c is ComponentNode | string => c !== null);
  }

  return result;
}

function sanitizeProps(props: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    // Skip potentially dangerous props
    if (key === "dangerouslySetInnerHTML" || key === "onClick" || key.startsWith("on")) {
      continue;
    }
    // Allow strings, numbers, booleans, arrays, and plain objects
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      Array.isArray(value) ||
      (value && typeof value === "object")
    ) {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// Validate that a plan output has the expected structure
export function validatePlanOutput(plan: unknown): boolean {
  if (!plan || typeof plan !== "object") return false;
  const p = plan as Record<string, unknown>;
  return (
    typeof p.intent === "string" &&
    typeof p.layout === "string" &&
    Array.isArray(p.components)
  );
}
