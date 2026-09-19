# PAACADEMY AI Advisor Playground V0.2

Standalone internal test application for exercising advisor decisions against the joined 243-course PAACADEMY snapshot before connecting production channels.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The current V0.2 uses a deterministic server route so it works without an API key. If/when a model-backed orchestrator is added, keep `OPENAI_API_KEY` server-side only; never expose it to browser code or commit it.

## Verify

```bash
npm test
npm run lint
npm run build
```

## Data boundaries

`data/policies.ts` contains the approved policy snapshot. `data/snapshots/all-courses-with-all-details.csv` is the factual course source; `data/snapshots/course_intelligence.json` is the derived retrieval/ranking layer. `data/catalog.ts` loads and joins them once at server startup using immutable course IDs, reports diagnostics, and keeps purchase availability `UNKNOWN` until a live API exists. No mock catalog is used at runtime.

## Seed test scenarios

1. `I am an architect and want to learn AI` → qualification, one high-value question / recommendation context.
2. `I use Rhino but not Grasshopper; I want computational design` → current explicit goal and tool entities, beginner/prerequisite-aware ranking.
3. `Is it live? What if I cannot attend? Do I get a certificate?` → Zoom, optional attendance, live-only Q&A/feedback, recording and certificate policy.
4. `Can I get a refund?` → 14-day rule with watched/attended conditions.
5. `Do you offer cashback?` → `UNKNOWN`, never inferred as true or false.
6. Repeat the same prompts in Website, WhatsApp and Instagram tabs to inspect channel-length simulation.
7. `I'm an architect and a complete beginner. I want to use AI directly in architectural concept design. What should I take?`
8. `I know Rhino but not Grasshopper. I want to learn computational design.`
9. `I use Midjourney and want to integrate AI into an architectural workflow.`
10. `I don't want Grasshopper. I only want AI tools for architecture.`
11. `I'm an interior designer looking for visualization and rendering training.`
12. `I'm interested in robotic fabrication but I'm a beginner.`
13. Compare two actual retrieved course titles from the inspector.
14. `I can't attend live. Can I still take this course and get a certificate?`

## Decision contract

`POST /api/chat` accepts `{ messages, channel }` and returns a structured decision object containing intent, state, entities, accumulated profile, negative constraints, missing information, next action, joined candidate count, ranked candidates, primary/alternative, delivery state, confidence, reason codes and factual/derived source provenance. Ranking follows relevance > fit > upcoming; prerequisite requirements are hard validation; blank requirements mean no prerequisite. Derived intelligence never overrides factual CSV fields, and version numbers do not create prerequisite chains.
