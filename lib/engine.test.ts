import test from "node:test";
import assert from "node:assert/strict";
import { decide } from "./engine";
test("approved policy answers are sourced and do not invent cashback", () => { const d = decide([{ role: "user", content: "Do I get cashback?" }], "website"); assert.match(d.answer, /UNKNOWN/); assert.deepEqual(d.sourceProvenance, ["data/policies.ts:verified-policy-snapshot"]); });
test("current request can recommend a prerequisite-free beginner course", () => { const d = decide([{ role: "user", content: "I am an architecture beginner and want to learn AI" }], "website"); assert.equal(d.primary?.id, "mock-3"); assert.ok(d.primary?.prerequisites.length === 0); assert.ok(d.reasonCodes.includes("CURRENT_EXPLICIT_REQUEST")); });
test("channel output is shorter for Instagram", () => { const d = decide([{ role: "user", content: "Is it live and do I get a certificate?" }], "instagram"); assert.ok(d.answer.endsWith(".")); assert.equal(d.state, "POLICY"); });
test("regression A recommends from the current architecture AI request", () => {
  const d = decide([{ role: "user", content: "I'm an architect and I want to learn how to use AI in my design workflow, but I'm a beginner. What would you recommend?" }], "website");
  assert.equal(d.state, "RECOMMENDATION"); assert.equal(d.conversation_state, "RECOMMENDATION"); assert.equal(d.nextBestAction, "SHOW_RECOMMENDATION");
  assert.equal(d.primary?.id, "mock-3"); assert.ok(d.primary?.reasonCodes.includes("GOAL_MATCH")); assert.ok(d.primary?.reasonCodes.includes("DESIRED_OUTPUT_MATCH"));
});
test("regression B answers Rhino follow-up directly and preserves history", () => {
  const d = decide([{ role: "user", content: "I'm an architect and I want to learn how to use AI in my design workflow, but I'm a beginner. What would you recommend?" }, { role: "user", content: "I already use Rhino. Would that change your recommendation?" }], "website");
  assert.match(d.answer, /^Yes —/); assert.match(d.answer, /existing Rhino experience/); assert.equal(d.profile.profession, "architecture"); assert.deepEqual(d.profile.goals, ["artificial intelligence"]); assert.deepEqual(d.profile.software_experience[0], { software: "Rhino", status: "uses", source: "current_request" });
});
test("regression C treats negative preferences as constraints and keeps the current AI goal", () => {
  const messages = [{ role: "user" as const, content: "I'm an architect and I want to learn how to use AI in my design workflow, but I'm a beginner. What would you recommend?" }, { role: "user" as const, content: "I already use Rhino. Would that change your recommendation?" }, { role: "user" as const, content: "Actually, I don't want to learn Grasshopper or computational design. I only want AI tools that I can apply directly to architecture." }];
  const d = decide(messages, "website");
  assert.deepEqual(d.profile.excluded_tools, ["Grasshopper"]); assert.deepEqual(d.profile.excluded_topics, ["computational design"]); assert.deepEqual(d.profile.goals, ["artificial intelligence"]); assert.equal(d.primary?.id, "mock-3"); assert.equal(d.alternative, null); assert.ok(d.candidates.every(c => !/grasshopper|computational design/i.test(`${c.title} ${c.topic}`))); assert.ok(d.reasonCodes.includes("RECOMMENDATION_CHANGED") || d.recommendation_changed === false);
});
