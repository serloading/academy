import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "PAACADEMY AI Advisor Playground", description: "Internal advisor test playground" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
