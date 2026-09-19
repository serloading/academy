import { Course } from "../lib/types";

// Replace this adapter with the verified 243-course snapshot when available. No production catalog is invented here.
export const MOCK_COURSES: Course[] = [
  { id: "mock-1", title: "Computational Design Foundations", format: "Workshop", level: "beginner", topic: "computational design", upcoming: true, prerequisites: [], priceEur: 180, url: "https://paacademy.com/courses/computational-design-foundations" },
  { id: "mock-2", title: "Grasshopper for Architects", format: "Workshop", level: "intermediate", topic: "grasshopper", upcoming: false, prerequisites: ["Rhino basics"], priceEur: 220, url: "https://paacademy.com/courses/grasshopper-for-architects" },
  { id: "mock-3", title: "AI for Architecture", format: "Pre-Recorded", level: "beginner", topic: "artificial intelligence architecture", upcoming: false, prerequisites: [], priceEur: 150, url: "https://paacademy.com/courses/ai-for-architecture" }
];
export interface CatalogAdapter { listCourses(): Promise<Course[]>; }
export const mockCatalog: CatalogAdapter = { async listCourses() { return MOCK_COURSES; } };
