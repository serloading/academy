import { ChatMessage, ConstraintStrength, FactPolarity, FactType, Profile, ProfileDelta, SemanticFact, SoftwareExperience } from "./types";

const NEGATION = /(?:don't|do not|not|never|avoid|without|don't want|do not want|not interested in|don't care about|do not care about|istemiyorum|ilgilenmiyorum)/i;
const CONCEPTS = [
  ["Grasshopper", "SOFTWARE_EXPERIENCE"], ["Rhino", "SOFTWARE_EXPERIENCE"], ["Midjourney", "SOFTWARE_EXPERIENCE"],
  ["coding", "SKILL"], ["fabrication", "TOPIC"], ["computational design", "TOPIC"], ["visualization", "GOAL"],
  ["rendering", "GOAL"], ["artificial intelligence", "GOAL"], ["AI", "GOAL"], ["architecture", "PROFESSION"], ["interior design", "TOPIC"]
] as const;

function makeFact(value: string, type: FactType, polarity: FactPolarity, source: SemanticFact["source"], strength?: ConstraintStrength, evidence?: string): SemanticFact { return { value, type, polarity, source, strength, confidence: "high", evidence }; }
function isNegated(text: string, index: number) { const sentenceStart = Math.max(0, text.lastIndexOf(".", index) + 1); const before = text.slice(sentenceStart, index); const marker = before.search(NEGATION); return marker >= 0 && !/\bbut\b|\bonly want\b|\bactually\b/i.test(before.slice(marker)); }
function addConceptFacts(text: string, source: SemanticFact["source"], facts: SemanticFact[]) {
  for (const [value, rawType] of CONCEPTS) {
    const pattern = value === "AI" ? /\bAI\b/i : new RegExp(value, "i");
    const match = pattern.exec(text); if (!match) continue;
    const type = rawType as FactType; const negative = isNegated(text, match.index); const strongNegative = /don't\s+(?:really\s+)?care|do not\s+(?:really\s+)?care/i.test(text);
    if (negative) facts.push(makeFact(value, type, strongNegative ? "NEGATE" : "EXCLUDE", source, strongNegative ? "STRONG_PREFERENCE" : "HARD_EXCLUSION", match[0]));
    else if (type === "SOFTWARE_EXPERIENCE") facts.push(makeFact(value, type, /already use|use .* comfortably|know .*already|zaten kullanıyorum/i.test(text) ? "AFFIRM" : "PREFER", source, /already use|zaten kullanıyorum|know .*already/i.test(text) ? "CONTEXT_ONLY" : "STRONG_PREFERENCE", match[0]));
    else facts.push(makeFact(value, type, "AFFIRM", source, undefined, match[0]));
  }
}
export function understand(text: string, source: SemanticFact["source"] = "current_request"): SemanticFact[] {
  const facts: SemanticFact[] = []; addConceptFacts(text, source, facts); if (/architect/i.test(text) && !facts.some(item => item.type === "PROFESSION")) facts.push(makeFact("architecture", "PROFESSION", "AFFIRM", source, undefined, "architect"));
  if (/beginner|complete beginner|new to|hiç kullanmadım|başlangıç/i.test(text)) facts.push(makeFact("beginner", "LEVEL_FIT" as FactType, "AFFIRM", source, undefined, "level expression"));
  if (/early-stage concept generation|concept generation|design ideas faster|konsept aşamasında|tasarım fikirlerini daha hızlı/i.test(text)) { facts.push(makeFact("early-stage concept generation", "GOAL", "REQUIRE", source, "STRONG_PREFERENCE", "goal expression")); facts.push(makeFact("faster design exploration", "DESIRED_OUTCOME", "REQUIRE", source, "STRONG_PREFERENCE", "outcome expression")); }
  if (/directly.*architecture|architectural workflow|architectural concept|mimari.*doğrudan|mimari.*workflow/i.test(text)) facts.push(makeFact("AI-assisted architectural application", "DESIRED_OUTCOME", "REQUIRE", source, "STRONG_PREFERENCE", "workflow expression"));
  if (/what should i take|what do you recommend|ne almalıyım|hangi kurs/i.test(text)) facts.push(makeFact("course recommendation", "GOAL", "REQUIRE", source));
  if (/compare|which one.*aligned|karşılaştır/i.test(text)) facts.push(makeFact("course comparison", "COMPARISON_REQUEST", "REQUIRE", source));
  if (/recording|certificate|attend live|can i watch|can i get my money back|katılamam|kayıt|sertifika|iade/i.test(text)) facts.push(makeFact("policy", "POLICY_REQUEST", "REQUIRE", source));
  if (/price|how much|discount|promo|coupon|cashback|fiyat|indirim|kupon/i.test(text)) facts.push(makeFact("commercial terms", "BUDGET_CONSTRAINT", "REQUIRE", source));
  if (/enroll|register|sign up|ready to buy|want to buy|kayıt olmak|satın almak/i.test(text)) facts.push(makeFact("enrollment", "TRANSACTION_SIGNAL", "REQUIRE", source));
  if (/live|recorded|pre-recorded|can't attend|can not attend|katılamam/i.test(text)) facts.push(makeFact(/recorded|pre-recorded|can't attend|can not attend|katılamam/i.test(text) ? "recorded" : "live", "FORMAT_PREFERENCE", "PREFER", source));
  return facts;
}
export function reduceProfile(messages: ChatMessage[]): { profile: Profile; facts: SemanticFact[]; delta: ProfileDelta } {
  const profile: Profile = { goals: [], desired_outcomes: [], software_experience: [], negative_preferences: [], excluded_topics: [], excluded_tools: [], strong_preferences: [], context_only: [] }; const allFacts: SemanticFact[] = []; const delta: ProfileDelta = { added: [], updated: [], removed: [], preserved: [] };
  const userMessages = messages.filter(message => message.role === "user");
  userMessages.forEach((message, index) => { const currentFacts = understand(message.content, index === userMessages.length - 1 ? "current_request" : "history"); allFacts.push(...currentFacts); for (const item of currentFacts) {
    if (item.polarity === "EXCLUDE" || item.polarity === "NEGATE") { if (!profile.negative_preferences.includes(item.value)) profile.negative_preferences.push(item.value); if (item.polarity === "EXCLUDE") { if (item.type === "SOFTWARE_EXPERIENCE") profile.excluded_tools.push(item.value); else profile.excluded_topics.push(item.value); } if (item.strength === "STRONG_PREFERENCE") profile.strong_preferences.push(item.value); delta.added.push(item); continue; }
    const profileValue = item.value === "AI" ? "artificial intelligence" : item.value;
    if (item.type === "GOAL" && !profile.goals.includes(profileValue)) { profile.goals.push(profileValue); delta.added.push({ ...item, value: profileValue }); }
    if (item.type === "DESIRED_OUTCOME" && !profile.desired_outcomes.includes(item.value)) { profile.desired_outcomes.push(item.value); delta.added.push(item); }
    if (item.type === "PROFESSION") profile.profession = "architecture";
    if (item.type === "LEVEL_FIT") profile.level = "Beginner";
    if (item.type === "SOFTWARE_EXPERIENCE") { const status: SoftwareExperience["status"] = item.polarity === "AFFIRM" ? "uses" : "learning"; const existing = profile.software_experience.find(entry => entry.software.toLowerCase() === item.value.toLowerCase()); if (existing) { existing.status = status; existing.source = item.source; delta.updated.push(item); } else { profile.software_experience.push({ software: item.value, status, source: item.source }); delta.added.push(item); } if (item.strength === "CONTEXT_ONLY") profile.context_only.push(item.value); }
    if (item.polarity === "REQUIRE" || item.strength === "STRONG_PREFERENCE") profile.strong_preferences.push(item.value);
  } });
  for (const historyFact of allFacts.filter(item => item.source === "history")) if (!delta.added.some(item => item.value === historyFact.value)) delta.preserved.push(historyFact);
  profile.excluded_tools = [...new Set(profile.excluded_tools)]; profile.excluded_topics = [...new Set(profile.excluded_topics)]; profile.strong_preferences = [...new Set(profile.strong_preferences)]; profile.context_only = [...new Set(profile.context_only)];
  return { profile, facts: allFacts, delta };
}
