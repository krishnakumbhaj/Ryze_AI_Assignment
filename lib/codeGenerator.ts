import { ComponentNode } from "./types";

// Convert a component tree to a readable React JSX code string
export function treeToCode(tree: ComponentNode): string {
  const imports = collectImports(tree);
  const importLine =
    imports.length > 0
      ? `import { ${imports.join(", ")} } from "@/components/ui";\n\n`
      : "";

  const jsx = nodeToJSX(tree, 1);

  return `${importLine}export default function GeneratedUI() {\n  return (\n${jsx}\n  );\n}`;
}

function collectImports(node: ComponentNode): string[] {
  const types = new Set<string>();

  function walk(n: ComponentNode) {
    types.add(n.type);
    if (n.children) {
      for (const child of n.children) {
        if (typeof child !== "string") {
          walk(child);
        }
      }
    }
  }

  walk(node);
  return Array.from(types).sort();
}

function nodeToJSX(node: ComponentNode, depth: number): string {
  const indent = "  ".repeat(depth + 1);
  const childIndent = "  ".repeat(depth + 2);
  const { type, props, children } = node;

  // Build props string
  const propsStr = props ? formatProps(props) : "";

  // Self-closing if no children
  if (!children || children.length === 0) {
    return `${indent}<${type}${propsStr} />`;
  }

  // Format children
  const childrenStr = children
    .map((child) => {
      if (typeof child === "string") {
        return `${childIndent}{\"${escapeString(child)}\"}`;
      }
      return nodeToJSX(child, depth + 1);
    })
    .join("\n");

  return `${indent}<${type}${propsStr}>\n${childrenStr}\n${indent}</${type}>`;
}

function formatProps(props: Record<string, unknown>): string {
  const entries = Object.entries(props);
  if (entries.length === 0) return "";

  const parts = entries.map(([key, value]) => {
    if (typeof value === "string") {
      return `${key}="${escapeString(value)}"`;
    }
    if (typeof value === "boolean") {
      return value ? key : `${key}={false}`;
    }
    if (typeof value === "number") {
      return `${key}={${value}}`;
    }
    // Arrays and objects
    return `${key}={${JSON.stringify(value)}}`;
  });

  if (parts.join(" ").length > 60) {
    return "\n" + parts.map((p) => `        ${p}`).join("\n") + "\n      ";
  }

  return " " + parts.join(" ");
}

function escapeString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
