import { ComponentNode } from "./types";

/**
 * Parse generated JSX code back into a ComponentNode tree.
 * This is the inverse of treeToCode() from codeGenerator.ts.
 *
 * It handles the specific format produced by the code generator:
 *   <ComponentName prop="value" numProp={42} boolProp>
 *     <Child />
 *     {"text children"}
 *   </ComponentName>
 */

export function codeToTree(code: string): ComponentNode | null {
  try {
    // Extract the JSX inside the return (...) block
    const returnMatch = code.match(/return\s*\(\s*\n?([\s\S]*?)\n?\s*\);/);
    if (!returnMatch) return null;

    const jsx = returnMatch[1];
    const tokens = tokenize(jsx);
    const result = parseTokens(tokens, 0);
    return result.node;
  } catch {
    return null;
  }
}

// ── Tokenizer ──

type Token =
  | { type: "open"; name: string; props: Record<string, unknown>; selfClosing: boolean }
  | { type: "close"; name: string }
  | { type: "text"; value: string };

function tokenize(jsx: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const src = jsx.trim();

  while (i < src.length) {
    // Skip whitespace between tags (but not inside text)
    if (/\s/.test(src[i]) && (i === 0 || src[i - 1] === '>' || src[i - 1] === '}')) {
      while (i < src.length && /\s/.test(src[i])) i++;
      continue;
    }

    // Text child: {"some string"}
    if (src[i] === '{' && src[i + 1] === '"') {
      const start = i + 1;
      // Find the matching closing brace, accounting for escaped quotes
      let j = start + 1; // skip opening quote
      while (j < src.length) {
        if (src[j] === '\\') { j += 2; continue; }
        if (src[j] === '"' && src[j + 1] === '}') { break; }
        j++;
      }
      const raw = src.slice(start + 1, j); // strip quotes
      tokens.push({ type: "text", value: unescapeString(raw) });
      i = j + 2; // skip "}
      continue;
    }

    // Closing tag: </Name>
    if (src[i] === '<' && src[i + 1] === '/') {
      const end = src.indexOf('>', i);
      const name = src.slice(i + 2, end).trim();
      tokens.push({ type: "close", name });
      i = end + 1;
      continue;
    }

    // Opening tag: <Name props... > or <Name props... />
    if (src[i] === '<') {
      const tagResult = parseOpenTag(src, i);
      tokens.push(tagResult.token);
      i = tagResult.end;
      continue;
    }

    // Skip any other whitespace / newlines
    i++;
  }

  return tokens;
}

function parseOpenTag(src: string, start: number): { token: Token & { type: "open" }; end: number } {
  let i = start + 1; // skip '<'

  // Read component name
  let name = "";
  while (i < src.length && /[A-Za-z0-9]/.test(src[i])) {
    name += src[i];
    i++;
  }

  const props: Record<string, unknown> = {};
  let selfClosing = false;

  // Parse props until '>' or '/>'
  while (i < src.length) {
    // Skip whitespace
    while (i < src.length && /\s/.test(src[i])) i++;

    // End of tag
    if (src[i] === '/' && src[i + 1] === '>') {
      selfClosing = true;
      i += 2;
      break;
    }
    if (src[i] === '>') {
      i += 1;
      break;
    }

    // Parse a prop
    const propResult = parseProp(src, i);
    if (propResult) {
      props[propResult.key] = propResult.value;
      i = propResult.end;
    } else {
      // Skip unrecognized character
      i++;
    }
  }

  return {
    token: { type: "open", name, props, selfClosing },
    end: i,
  };
}

function parseProp(src: string, start: number): { key: string; value: unknown; end: number } | null {
  let i = start;

  // Read prop name
  let key = "";
  while (i < src.length && /[A-Za-z0-9_-]/.test(src[i])) {
    key += src[i];
    i++;
  }
  if (!key) return null;

  // Skip whitespace
  while (i < src.length && /\s/.test(src[i])) i++;

  // Boolean prop (no = sign, just the name)
  if (src[i] !== '=') {
    return { key, value: true, end: i };
  }

  i++; // skip '='

  // Skip whitespace
  while (i < src.length && /\s/.test(src[i])) i++;

  // String value: "..."
  if (src[i] === '"') {
    i++; // skip opening quote
    let value = "";
    while (i < src.length) {
      if (src[i] === '\\') {
        value += src[i + 1];
        i += 2;
        continue;
      }
      if (src[i] === '"') {
        i++; // skip closing quote
        break;
      }
      value += src[i];
      i++;
    }
    return { key, value, end: i };
  }

  // Expression value: {...}
  if (src[i] === '{') {
    let depth = 1;
    let j = i + 1;
    while (j < src.length && depth > 0) {
      if (src[j] === '{') depth++;
      else if (src[j] === '}') depth--;
      j++;
    }
    const expr = src.slice(i + 1, j - 1).trim();

    // Try to parse as JSON
    try {
      const val = JSON.parse(expr);
      return { key, value: val, end: j };
    } catch {
      // Try evaluating simple expressions
      if (expr === "true") return { key, value: true, end: j };
      if (expr === "false") return { key, value: false, end: j };
      if (/^-?\d+(\.\d+)?$/.test(expr)) return { key, value: Number(expr), end: j };
      // Return as string fallback
      return { key, value: expr, end: j };
    }
  }

  return { key, value: true, end: i };
}

// ── Recursive parser that builds the tree from tokens ──

function parseTokens(
  tokens: Token[],
  index: number
): { node: ComponentNode; nextIndex: number } {
  const token = tokens[index];
  if (!token || token.type !== "open") {
    throw new Error(`Expected opening tag at index ${index}`);
  }

  const node: ComponentNode = {
    type: token.name,
  };

  // Only add props if non-empty
  if (Object.keys(token.props).length > 0) {
    node.props = token.props;
  }

  // Self-closing tag — no children
  if (token.selfClosing) {
    return { node, nextIndex: index + 1 };
  }

  // Parse children until we hit the matching close tag
  const children: (ComponentNode | string)[] = [];
  let i = index + 1;

  while (i < tokens.length) {
    const child = tokens[i];

    if (child.type === "close" && child.name === token.name) {
      i++; // consume close tag
      break;
    }

    if (child.type === "text") {
      children.push(child.value);
      i++;
      continue;
    }

    if (child.type === "open") {
      const result = parseTokens(tokens, i);
      children.push(result.node);
      i = result.nextIndex;
      continue;
    }

    // Unexpected close tag for different component — skip
    i++;
  }

  if (children.length > 0) {
    node.children = children;
  }

  return { node, nextIndex: i };
}

function unescapeString(s: string): string {
  return s.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
}
