// Component tree node - the source of truth for all generated UI
export interface ComponentNode {
  type: string;
  props?: Record<string, unknown>;
  children?: (ComponentNode | string)[];
}

// Plan output from the Planner step
export interface PlanOutput {
  intent: string;
  layout: string;
  components: {
    type: string;
    props?: Record<string, unknown>;
    children?: string;
    placement?: string;
  }[];
  modifications?: {
    action: "add" | "remove" | "update";
    target: string;
    details: string;
  }[];
}

// Version entry for history
export interface Version {
  version: number;
  componentTree: ComponentNode;
  code: string;
  explanation: string;
  timestamp: number;
}

// Chat message
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  step?: AgentStep;
  messageType?: "text" | "plan" | "error" | "artifact";
  artifactVersion?: number;
}

// Agent step for streaming progress
export type AgentStep =
  | "planning"
  | "plan_complete"
  | "generating"
  | "generate_complete"
  | "explaining"
  | "complete"
  | "error";

// SSE event from the API
export interface SSEEvent {
  step?: AgentStep;
  message?: string;
  plan?: PlanOutput;
  code?: string;
  explanation?: string;
  version?: number;
  componentTree?: ComponentNode;
  error?: string;
  directResponse?: string;
}

// API request body
export interface GenerateRequest {
  message: string;
  previousTree?: ComponentNode;
  conversationHistory?: { role: string; content: string }[];
  proMode?: boolean;
}
