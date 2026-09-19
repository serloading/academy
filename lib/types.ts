export type Channel = "website" | "whatsapp" | "instagram";
export type ConversationState = "DISCOVERY" | "QUALIFICATION" | "RECOMMENDATION" | "POLICY";
export type Intent = "course_discovery" | "course_comparison" | "policy_question" | "purchase_intent" | "general";
export type Course = { id: string; title: string; format: "Workshop" | "Lecture" | "Conference" | "Pre-Recorded"; level: string; topic: string; upcoming: boolean; prerequisites: string[]; priceEur: number; memberIncluded?: boolean; url: string };
export type Decision = { primaryIntent: Intent; secondaryIntent: string | null; state: ConversationState; entities: Record<string, string>; profile: Record<string, string>; missingInformation: string[]; nextBestAction: string; candidates: Array<Course & { score: number; reasonCodes: string[] }>; primary: Course | null; alternative: Course | null; confidence: "HIGH" | "MEDIUM" | "LOW"; reasonCodes: string[]; sourceProvenance: string[]; answer: string };
export type ChatMessage = { role: "user" | "assistant"; content: string };
