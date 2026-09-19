import test from "node:test";
import assert from "node:assert/strict";
import { decide } from "./engine";
test("approved policy answers are sourced and do not invent cashback", () => { const d = decide([{ role: "user", content: "Do I get cashback?" }], "website"); assert.match(d.answer, /UNKNOWN/); assert.deepEqual(d.sourceProvenance, ["data/policies.ts:verified-policy-snapshot"]); });
test("current request can recommend a prerequisite-free beginner course", () => { const d = decide([{ role: "user", content: "I am an architecture beginner and want to learn AI" }], "website"); assert.equal(d.primary?.id, "mock-3"); assert.ok(d.primary?.prerequisites.length === 0); assert.ok(d.reasonCodes.includes("CURRENT_EXPLICIT_REQUEST")); });
test("channel output is shorter for Instagram", () => { const d = decide([{ role: "user", content: "Is it live and do I get a certificate?" }], "instagram"); assert.ok(d.answer.endsWith(".")); assert.equal(d.state, "POLICY"); });
