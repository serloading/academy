import { NextResponse } from "next/server";
import { decide } from "../../../lib/engine";
import { Channel, ChatMessage } from "../../../lib/types";
export async function POST(request: Request) { const body = await request.json() as { messages: ChatMessage[]; channel: Channel }; const decision = decide(body.messages ?? [], body.channel ?? "website"); return NextResponse.json(decision); }
