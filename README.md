# 🚀 Ryze AI - Deterministic UI Generator

**An intelligent AI-powered UI generation system that creates React components through Abstract Syntax Tree (AST) architecture.**

Ryze AI transforms natural language descriptions into fully functional, interactive UI components using a deterministic AST-based approach. Unlike traditional code generators, Ryze AI generates a structured **JSON AST** that maps to predefined, production-ready React components — ensuring consistency, predictability, and maintainability.

---

## ✨ Key Features

### 🎯 AST-First Architecture
- **No Direct Code Generation**: AI generates a JSON Abstract Syntax Tree, not raw code
- **Deterministic Output**: AST maps to pre-defined, tested React components
- **Type-Safe**: Full TypeScript support with Zod validation
- **Predictable Rendering**: Same AST always produces identical UI

### 🤖 Intelligent AI Pipeline
- **3-Stage Generation**: Intent Analysis → Planning → AST Generation → Explanation
- **LangChain Integration**: Powered by LangChain TypeScript SDK with Gemini 2.5 Flash
- **Context-Aware**: Remembers previous UI state for iterative modifications
- **Pro Mode**: Advanced detail level for complex UIs

### 🎨 Real-Time Experience
- **Live Streaming**: Token-by-token explanation streaming
- **Typewriter Code Display**: Character-by-character React JSX rendering
- **Dual View**: Preview + Code tabs with syntax highlighting
- **Version History**: Save and switch between generated versions

### 💾 Persistence & State Management
- **localStorage Integration**: Chat history, versions, and preferences persist across sessions
- **Server-Side Versioning**: In-memory version store with RESTful API
- **Clear History**: One-click cleanup of all data

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.1.6** - React framework with App Router & Turbopack
- **React 19** - Latest React features
- **TypeScript 5** - Full type safety
- **Tailwind CSS v4** - Utility-first styling
- **Lucide React** - Beautiful icon library

### AI & Backend
- **LangChain TypeScript SDK** - AI orchestration framework
  - `@langchain/core` - Core abstractions
  - `@langchain/google-genai` - Gemini integration
- **Google Gemini 2.5 Flash** - Fast, efficient LLM
- **Zod v4** - Runtime schema validation
- **Server-Sent Events (SSE)** - Real-time streaming communication

### Architecture
- **AST-Based Generation** - JSON component tree → React components
- **10 Predefined UI Components**: Button, Card, Input, Text, Container, Table, Modal, Navbar, Sidebar, Chart
- **Client-Side Code Rendering** - AST → JSX conversion happens in browser

---

## 📦 Installation

### Prerequisites
- **Node.js 18+** (20+ recommended)
- **npm** or **yarn** or **pnpm**
- **Google Gemini API Key** - [Get it here](https://aistudio.google.com/apikey)

### Step 1: Clone the Repository
```bash
git clone <your-repo-url>
cd ryze_ai
```

### Step 2: Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### Step 3: Configure Environment Variables
Create a `.env.local` file in the project root:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Gemini API key:
```env
GEMINI_API_KEY=your_actual_api_key_here
```

### Step 4: Run Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 5: Build for Production (Optional)
```bash
npm run build
npm start
```

---

## 🏗️ How It Works

### AST Architecture Flow

```
User Input (Natural Language)
        ↓
1. Intent Classifier
   ↓ (chat response) OR (UI generation request)
   ↓
2. Planner
   - Analyzes requirements
   - Outputs structured plan (JSON)
        ↓
3. Generator
   - Converts plan → AST (ComponentNode tree)
   - Returns JSON, NOT code
        ↓
4. Client-Side Processing
   - AST sent to browser via SSE
   - treeToCode() converts AST → React JSX (client-side)
   - Code streams with typewriter effect
        ↓
5. Explainer (Parallel)
   - Streams explanation token-by-token
   - Describes design decisions
        ↓
6. Rendering
   - PreviewRenderer maps AST → pre-built components
   - Code tab shows generated React JSX
   - Version saved to history
```

### Example: AST Structure
User: *"Create a login form"*

**Generated AST:**
```json
{
  "type": "Container",
  "props": { "className": "max-w-md mx-auto p-6" },
  "children": [
    {
      "type": "Text",
      "props": { "variant": "h1" },
      "children": ["Login"]
    },
    {
      "type": "Input",
      "props": { "placeholder": "Email", "type": "email" }
    },
    {
      "type": "Input",
      "props": { "placeholder": "Password", "type": "password" }
    },
    {
      "type": "Button",
      "props": { "variant": "primary" },
      "children": ["Sign In"]
    }
  ]
}
```

**Client-Side Output (Generated React JSX):**
```jsx
import { Container, Text, Input, Button } from "@/components/ui";

export default function GeneratedUI() {
  return (
    <Container className="max-w-md mx-auto p-6">
      <Text variant="h1">{"Login"}</Text>
      <Input placeholder="Email" type="email" />
      <Input placeholder="Password" type="password" />
      <Button variant="primary">{"Sign In"}</Button>
    </Container>
  );
}
```

---

## 📂 Project Structure

```
ryze_ai/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Home page (renders MainApp)
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   └── api/                      # API routes
│       ├── generate/route.ts     # Main SSE generation endpoint
│       └── versions/route.ts     # Version history API
│
├── components/
│   ├── app/                      # Application components
│   │   ├── MainApp.tsx           # Main app container (state management)
│   │   ├── ChatPanel.tsx         # Chat interface
│   │   ├── ArtifactPanel.tsx     # Preview/Code viewer
│   │   ├── PreviewRenderer.tsx   # AST → Component renderer
│   │   └── StepIndicator.tsx     # Generation progress UI
│   └── ui/                       # 10 Pre-built UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Chart.tsx
│       ├── Container.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       ├── Table.tsx
│       └── Text.tsx
│
├── lib/                          # Core logic
│   ├── langchain.ts              # LangChain SDK client (createModel, invokeModel, streamModel)
│   ├── planner.ts                # Step 1: Plan generation
│   ├── generator.ts              # Step 2: AST generation
│   ├── explainer.ts              # Step 3: Explanation streaming
│   ├── codeGenerator.ts          # Client-side: AST → React JSX
│   ├── prompts.ts                # LLM prompt templates
│   ├── types.ts                  # TypeScript interfaces
│   ├── validation.ts             # Zod schemas for AST validation
│   ├── versionStore.ts           # In-memory version storage
│   ├── componentSchema.ts        # Component prop schemas
│   └── ThemeContext.tsx          # Theme provider
│
├── public/                       # Static assets
├── images/                       # Logo and images
├── .env.local                    # Environment variables (not committed)
├── .env.example                  # Example env file
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind config
└── next.config.ts                # Next.js config
```

---

## 🎮 Usage

### Basic UI Generation
1. **Enter a description**: *"Create a user profile card with avatar and bio"*
2. **Watch the process**:
   - ✅ Planning UI structure...
   - ⚙️ Generating AST...
   - 💬 Explaining design...
3. **View Results**:
   - **Code Tab**: See generated React JSX (streams with typewriter effect)
   - **Preview Tab**: See live rendered UI (auto-opens after code finishes)

### Iterative Modifications
- *"Add a contact button"* → Updates existing AST
- *"Make the card wider"* → Modifies props
- *"Change button color to blue"* → Updates component styling

### Pro Mode
Toggle **Pro Mode** (bottom of chat) for:
- More detailed component structure
- Advanced prop configurations
- Richer explanations

### Version History
- **Version Selector**: Dropdown in artifact panel
- **Regenerate**: Refresh current UI with same prompt
- **Clear History**: Delete all chat and versions

---

## 🔧 Configuration

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for AI generation | ✅ Yes |

### Customization
- **Add New Components**: Create in `components/ui/` and update `componentSchema.ts`
- **Adjust AI Behavior**: Modify prompts in `lib/prompts.ts`
- **Change Streaming Speed**: Edit `CHARS_PER_TICK` and `TICK_MS` in `MainApp.tsx`
- **Model Temperature**: Adjust in `lib/langchain.ts` `createModel()` options

---

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add `GEMINI_API_KEY` environment variable
4. Deploy

### Other Platforms
1. Build: `npm run build`
2. Set environment variable: `GEMINI_API_KEY`
3. Start: `npm start`

---

## 🎯 Why AST Architecture?

### Benefits over Direct Code Generation
| Traditional Code Gen | AST Architecture |
|---------------------|------------------|
| Raw strings, hard to parse | Structured JSON tree |
| Unpredictable output | Deterministic mapping |
| Difficult to validate | Type-safe with schemas |
| Breaks with syntax errors | Always valid structure |
| Hard to modify | Easy tree manipulation |
| Testing nightmare | Testable components |

### The Ryze AI Approach
1. **AI generates structure** (what), not implementation (how)
2. **Pre-built components** guarantee quality
3. **AST is the source of truth** - code is derived
4. **Version control** - AST diffs are meaningful
5. **Client-side rendering** - instant preview, zero server load

---

## 📝 API Reference

### POST `/api/generate`
**Generate UI from natural language**

**Request:**
```json
{
  "message": "Create a pricing table",
  "previousTree": {...},  // Optional: current AST for modifications
  "proMode": false
}
```

**Response:** Server-Sent Events (SSE)
```typescript
// Event types:
{ step: "planning", message: "..." }
{ plan: { intent, layout, components } }
{ step: "generating", message: "..." }
{ componentTree: { type, props, children } }
{ step: "explaining", message: "..." }
{ explanationChunk: "Token..." }
{ step: "complete", version: 1, componentTree: {...}, explanation: "..." }
{ error: "Error message" }
{ directResponse: "Chat response for non-UI queries" }
```

### GET `/api/versions?version=1`
**Retrieve specific version**

**Response:**
```json
{
  "version": 1,
  "componentTree": {...},
  "explanation": "...",
  "timestamp": 1707926400000
}
```

### GET `/api/versions`
**Get all versions**

**Response:**
```json
{
  "versions": [
    { "version": 1, "componentTree": {...}, "explanation": "...", "timestamp": 1707926400000 }
  ]
}
```

### DELETE `/api/versions`
**Clear all versions**

**Response:**
```json
{ "success": true }
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: "GEMINI_API_KEY is not set"
- **Fix**: Ensure `.env.local` exists with valid API key
- Restart dev server after adding key

**Issue**: Build fails with TypeScript errors
- **Fix**: Run `npm install` to ensure all dependencies are installed
- Check Node.js version (18+ required)

**Issue**: Preview shows loading spinner forever
- **Fix**: Check browser console for errors
- Verify API key is valid
- Check network tab for failed SSE connection

**Issue**: Code streams twice
- **Fix**: Already patched - update to latest version
- Delete `node_modules` and `.next`, reinstall

---

## 🤝 Contributing

Contributions welcome! Areas for improvement:
- [ ] Add more pre-built components (Forms, Grids, etc.)
- [ ] Support custom component injection
- [ ] Export generated code to ZIP/GitHub
- [ ] Multi-page application support
- [ ] Component library switcher (shadcn, MUI, etc.)
- [ ] Real-time collaboration
- [ ] Dark mode for generated UIs

---

## 📄 License

This project is private and proprietary.

---

## 🙏 Acknowledgments

- **LangChain** - AI orchestration framework
- **Google Gemini** - Fast, efficient LLM
- **Next.js Team** - Amazing React framework
- **Tailwind Labs** - Beautiful utility-first CSS

---

## 📞 Support

For issues, questions, or feature requests, please open an issue in the repository.

---

**Built with ❤️ using AST-first architecture for predictable, maintainable AI-generated UIs.**