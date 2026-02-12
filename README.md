# Ryze AI — Deterministic UI Generator

An AI-powered UI generator built with Next.js that converts natural language descriptions into working UI code using a fixed, deterministic component library. Inspired by Claude's artifact pattern.

## Architecture

### Three-Step Agent Pipeline

Every user prompt flows through three sequential LLM steps:

1. **Planner** — Interprets intent, selects components, determines layout, and plans modifications to existing UI when applicable.
2. **Generator** — Produces a `ComponentNode` tree using only whitelisted components. Validates output against the component schema.
3. **Explainer** — Summarizes what was generated and why in plain English.

Each step calls the Gemini 2.0 Flash API with `temperature: 0.1` for near-deterministic output.

### Deterministic Component Library

All generated UI is built from exactly **10 fixed components**:

| Component | Purpose |
|-----------|---------|
| `Container` | Layout wrapper (flex, grid, center, stack) |
| `Text` | Headings, paragraphs, labels |
| `Button` | Click targets (primary, secondary, outline, ghost, danger) |
| `Input` | Text fields (text, email, password, number, textarea) |
| `Card` | Content containers with optional title/footer |
| `Modal` | Dialog overlays with title and body |
| `Navbar` | Top navigation bars |
| `Sidebar` | Side navigation panels |
| `Table` | Data tables with headers and rows |
| `Chart` | Bar and line charts with data visualization |

No custom components, inline styles, or Tailwind classes are injected at runtime — the component library owns all styling via predefined class maps.

### Streaming (SSE)

The `/api/generate` endpoint uses Server-Sent Events to stream step-by-step progress:

```
planning → plan_complete → generating → generate_complete → explaining → complete
```

The frontend displays a live **ThinkingBlock** that shows each step's status with animations.

### Security

- **Safety preamble** prepended to every prompt blocks prompt injection attempts
- **Component whitelist** rejects unknown component types
- **Prop sanitizer** strips dangerous props (`onClick`, `onLoad`, `dangerouslySetInnerHTML`, etc.)
- **Tree validator** recursively checks every node before rendering

### Version History

An in-memory version store tracks every generation. Users can navigate between versions via the dropdown in the artifact panel.

## UI Design

Claude-style split layout:
- **Left panel** — Chat with welcome screen, message history, inline step indicators
- **Right panel** — Artifact view with Preview/Code toggle, version selector, regenerate

Dark theme using `#262624` / `#1f1e1d` / `#30302e` color palette.

## Project Structure

```
app/
  page.tsx              # Entry point → MainApp
  layout.tsx            # Root layout with Geist fonts
  globals.css           # Theme, animations, scrollbar styles
  api/
    generate/route.ts   # SSE streaming endpoint (3-step agent)
    versions/route.ts   # Version retrieval endpoint

components/
  app/
    MainApp.tsx          # Orchestrator (state, SSE handler, layout)
    ChatPanel.tsx        # Chat UI (welcome, messages, ThinkingBlock, input)
    ArtifactPanel.tsx    # Code/Preview tabs, version selector
    PreviewRenderer.tsx  # Renders ComponentNode tree to React elements
    StepIndicator.tsx    # Step progress display (legacy)
  ui/
    Container.tsx        # Flex/grid layout component
    Text.tsx             # Typography component
    Button.tsx           # Button variants
    Input.tsx            # Form inputs
    Card.tsx             # Content cards
    Modal.tsx            # Dialog component
    Navbar.tsx           # Navigation bar
    Sidebar.tsx          # Side navigation
    Table.tsx            # Data table
    Chart.tsx            # Bar/line chart

lib/
  planner.ts             # Step 1: Intent → Plan
  generator.ts           # Step 2: Plan → ComponentNode tree
  explainer.ts           # Step 3: Tree → Explanation
  gemini.ts              # Gemini API client (REST)
  prompts.ts             # Prompt templates with safety preamble
  validation.ts          # Whitelist enforcement + prop sanitization
  componentSchema.ts     # Component definitions and prop schemas
  codeGenerator.ts       # ComponentNode → readable JSX code string
  versionStore.ts        # In-memory version array
  types.ts               # Shared TypeScript interfaces
```

## Getting Started

```bash
# Install dependencies
npm install

# Add your Gemini API key
echo "GEMINI_API_KEY=your_key_here" > .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS v4**
- **Gemini 2.0 Flash** (via REST API)
- **TypeScript 5**

## Known Limitations

- Version store is in-memory — resets on server restart
- No persistent conversation history
- Gemini responses are not token-streamed (step-level streaming only)
- Component library is fixed — no custom component injection
- Chart component uses simple CSS-based visualization, not a charting library
