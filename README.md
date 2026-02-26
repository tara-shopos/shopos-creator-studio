# Shopos Creator Studio

AI-powered creator studio built with [Mastra](https://mastra.ai/) and [Next.js](https://nextjs.org/). Features an interactive chat interface with AI agents for creative direction, image generation, web research, and more.

## Prerequisites

- **Node.js** >= 22.13.0
- **npm** (comes with Node.js)
- API keys (see [Environment Variables](#environment-variables))

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/tara-shopos/shopos-creator-studio.git
cd shopos-creator-studio
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example env file and fill in your API keys:

```bash
cp .env.example .env.development
```

Edit `.env.development` with your keys:

```env
ANTHROPIC_API_KEY=your-anthropic-api-key
GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-api-key
FIRECRAWL_API_KEY=your-firecrawl-api-key
```

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Powers the AI agents (Claude Sonnet 4.5) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes | Used for image generation (Gemini 2.5 Flash) |
| `FIRECRAWL_API_KEY` | Optional | Enables web search and scraping tools |

Get your keys from:
- Anthropic: https://console.anthropic.com/
- Google AI: https://aistudio.google.com/apikey
- Firecrawl: https://firecrawl.dev/

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Navigate to `/chat` for the chat interface.

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start Next.js dev server with Turbopack |
| `build` | `npm run build` | Build for production |
| `start` | `npm start` | Start production server |
| `lint` | `npm run lint` | Run ESLint |
| `mastra:dev` | `npm run mastra:dev` | Start Mastra Studio at [localhost:4111](http://localhost:4111) |
| `mastra:build` | `npm run mastra:build` | Build Mastra project |
| `mastra:start` | `npm run mastra:start` | Start Mastra production server |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts           # Chat API endpoint (streaming)
│   │   └── threads/                # Thread CRUD endpoints
│   ├── chat/page.tsx               # Chat interface
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Home page
├── components/
│   ├── ai-elements/                # AI chat UI components
│   ├── ui/                         # shadcn/ui components
│   └── chat-sidebar.tsx            # Thread history sidebar
├── lib/
│   └── utils.ts                    # Utility functions
└── mastra/
    ├── agents/
    │   ├── creative-director-agent.ts   # Creative direction + image gen
    │   └── weather-agent.ts             # Weather + activity planning
    ├── tools/
    │   ├── image-generation-tool.ts     # Gemini image generation
    │   ├── weather-tool.ts              # Open-Meteo weather API
    │   ├── firecrawl-search-tool.ts     # Web search
    │   └── firecrawl-scrape-tool.ts     # Web scraping
    ├── workflows/
    │   └── weather-workflow.ts          # Multi-step weather workflow
    ├── scorers/                         # Agent evaluation scorers
    └── index.ts                         # Mastra configuration entry point
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (React 19) |
| Language | TypeScript |
| AI Framework | Mastra |
| AI Models | Anthropic Claude Sonnet 4.5, Google Gemini 2.5 Flash |
| UI | Radix UI, shadcn/ui, Tailwind CSS 4 |
| Database | LibSQL (file-based SQLite via `mastra.db`) |
| Validation | Zod |

## AI Agents

### Creative Director Agent
Strategic creative analysis and image generation for brands. Uses Claude Sonnet 4.5 with tools for image generation (Gemini), web search, and web scraping. Includes persistent memory for brand context.

### Weather Agent
Weather queries and activity planning. Fetches real-time weather data from Open-Meteo API and suggests activities based on conditions.

## Mastra Studio

For an interactive UI to build, test, and debug your agents:

```bash
npm run mastra:dev
```

Opens at [http://localhost:4111](http://localhost:4111). Provides a visual interface for testing agents, inspecting traces, and managing workflows.

## License

ISC
