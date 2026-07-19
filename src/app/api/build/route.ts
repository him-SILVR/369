import { NextRequest, NextResponse } from "next/server";
import { routeModel } from "@/lib/model-router";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }

    const raw = await routeModel("code", [{ role: "user", content: prompt }]);

    const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Model didn't return valid JSON. Try rephrasing your request." }, { status: 500 });
    }

    return NextResponse.json({ html: parsed.html, explanation: parsed.explanation });
  } catch (err) {
    console.error("Build API error:", err);
    return NextResponse.json({ error: "Something went wrong generating the build." }, { status: 500 });
  }
}