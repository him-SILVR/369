const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile"; // free tier, no card required

export type TaskType = "chat" | "research" | "code" | "explain";

export interface RouterMessage {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPTS: Record<TaskType, string> = {
  chat: "You are 369, a helpful assistant that combines research and building. Be concise and direct.",
  research: "You are 369's research engine. Answer with clear, well-organized information. Note when something needs live web data (this will be wired to search in Phase 1).",
  code: "You are 369's build engine. Generate clean, working, complete code. Prefer full files over fragments.",
  explain: "You are 369's teaching layer. Explain what was just built in plain, beginner-friendly language. No jargon without defining it.",
};

export async function routeModel(taskType: TaskType, messages: RouterMessage[]): Promise<string> {
  const systemPrompt = SYSTEM_PROMPTS[taskType];

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}