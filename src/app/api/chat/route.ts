import { NextRequest, NextResponse } from "next/server";
import { routeModel, RouterMessage, TaskType } from "@/lib/model-router";
import { tavilySearch } from "@/lib/search";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: RouterMessage[] = body.messages;
    const taskType: TaskType = body.taskType ?? "chat";

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    let finalMessages = messages;
    let sources: { title: string; url: string }[] = [];

    if (taskType === "research") {
      const latestQuery = messages[messages.length - 1].content;
      const results = await tavilySearch(latestQuery);
      sources = results.map((r) => ({ title: r.title, url: r.url }));

      const sourceBlock = results
        .map((r, i) => `[${i + 1}] ${r.title}\n${r.url}\n${r.content}`)
        .join("\n\n");

      const augmentedQuery = `${latestQuery}\n\n---\nWeb search results to ground your answer (cite using [1], [2], etc. matching the numbers below):\n\n${sourceBlock}`;

      finalMessages = [...messages.slice(0, -1), { role: "user", content: augmentedQuery }];
    }

    const reply = await routeModel(taskType, finalMessages);
    return NextResponse.json({ reply, sources });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Something went wrong talking to the model." }, { status: 500 });
  }
}
