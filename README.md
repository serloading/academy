# PAACADEMY AI Advisor Playground V0.4

Standalone internal test application for exercising evidence-grounded advisor decisions against the joined 243-course PAACADEMY snapshot before connecting production channels.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. V0.4 uses a deterministic server route and does not require an API key. If/when a model-backed orchestrator is added, keep `OPENAI_API_KEY` server-side only; never expose it to browser code or commit it.

## Verify

```bash
npm test
npm run lint
npm run build
```

## Data boundaries

`data/policies.ts` contains the approved policy snapshot. `data/snapshots/all-courses-with-all-details.csv` is the factual course source; `data/snapshots/course_intelligence.json` is the derived intelligence source. `data/catalog.ts` loads and joins them once at server startup using immutable course IDs, reports diagnostics, and keeps purchase availability `UNKNOWN` until a live API exists. `data/course-fingerprints.ts` derives the V0.4 semantic fingerprint map once at module load from the factual + intelligence layers; it preserves workflow stages, field-labelled evidence excerpts, fit signals and confidence without changing source course data. `data/generated/course-semantic-fingerprints.schema.json` documents the fingerprint contract. No mock catalog is used at runtime.

## V0.4 retrieval and ranking

The engine first retrieves a bounded pool of up to 24 courses using taxonomy, workflow, goal, domain, level and software overlap. It then validates hard exclusions and content status before deterministic evidence-aware reranking. Goal, workflow stage, desired outcome and direct evidence dominate weaker software/context and upcoming bonuses. Alternatives are selected from validated relevant courses with a meaningful workflow difference, while central strong-negative conflicts are penalized. Debug output exposes ranked versus selected primary, stability override, decomposed score components and matched evidence excerpts.

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

`POST /api/chat` accepts `{ messages, channel }` and returns a structured decision object containing intent, state, entities, accumulated fit profile, hard/strong/context-only/format constraints, retrieval count, ranked and selected primary, alternative rationale, decomposed score components, evidence excerpts, stability state, response plan and factual/derived source provenance. Ranking follows relevance > fit > upcoming; prerequisite requirements are hard validation; blank requirements mean no prerequisite. Derived intelligence never overrides factual CSV fields, and version numbers do not create prerequisite chains. Policy, price and transaction turns preserve the selected recommendation unless they add a real fit constraint.
