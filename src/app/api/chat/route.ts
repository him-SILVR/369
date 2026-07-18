import { NextRequest, NextResponse } from "next/server";
import { routeModel, RouterMessage, TaskType } from "@/lib/model-router";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: RouterMessage[] = body.messages;
    const taskType: TaskType = body.taskType ?? "chat";

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    const reply = await routeModel(taskType, messages);

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Something went wrong talking to the model." },
      { status: 500 }
    );
  }
}
