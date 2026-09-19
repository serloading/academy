# PAACADEMY AI Advisor Playground V0.1

Standalone internal test application for exercising advisor decisions before connecting production channels.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The current V0.1 uses a deterministic server route so it works without an API key. If/when a model-backed orchestrator is added, keep `OPENAI_API_KEY` server-side only; never expose it to browser code or commit it.

## Verify

```bash
npm test
npm run lint
npm run build
```

## Data boundaries

`data/policies.ts` contains the approved policy snapshot supplied for this prototype. `data/catalog.ts` intentionally exposes a small, clearly marked `MOCK_COURSES` fixture and a `CatalogAdapter` interface. The real 243-course catalog/course-intelligence snapshot should be added behind that adapter (for example `data/snapshots/catalog.json` plus a production adapter) once the verified export is available. The application does not invent missing catalog data.

## Seed test scenarios

1. `I am an architect and want to learn AI` → qualification, one high-value question / recommendation context.
2. `I use Rhino but not Grasshopper; I want computational design` → current explicit goal and tool entities, beginner/prerequisite-aware ranking.
3. `Is it live? What if I cannot attend? Do I get a certificate?` → Zoom, optional attendance, live-only Q&A/feedback, recording and certificate policy.
4. `Can I get a refund?` → 14-day rule with watched/attended conditions.
5. `Do you offer cashback?` → `UNKNOWN`, never inferred as true or false.
6. Repeat the same prompts in Website, WhatsApp and Instagram tabs to inspect channel-length simulation.

## Decision contract

`POST /api/chat` accepts `{ messages, channel }` and returns a structured decision object containing intent, state, entities, accumulated profile, missing information, next action, ranked candidates, primary/alternative, confidence, reason codes and source provenance. Ranking follows relevance > fit > upcoming; prerequisite requirements are hard validation; blank requirements mean no prerequisite.
