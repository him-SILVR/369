const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = "llama-3.3-70b-versatile";

export type TaskType = "chat" | "research" | "code" | "explain";

export interface RouterMessage {
  role: "user" | "assistant";
  content: string;
}

interface RouteConfig {
  systemPrompt: string;
  maxTokens: number;
}

const ROUTES: Record<TaskType, RouteConfig> = {
  chat: {
    systemPrompt: "You are 369, a helpful assistant that combines research and building. Be concise and direct.",
    maxTokens: 1024,
  },
  research: {
    systemPrompt: "You are 369's research engine. Answer with clear, well-organized information, citing sources using [1], [2] etc. matching any web search results provided.",
    maxTokens: 1536,
  },
  code: {
    systemPrompt: 'You are 369\'s build engine. You may receive earlier conversation turns, including research findings from earlier in the thread — use any relevant facts, data, or content from them in what you build. Respond with ONLY a single valid JSON object, nothing else — no markdown fences, no text before or after. Shape: {"html": "<!DOCTYPE html>...", "explanation": "one short sentence describing what you built"}. The html field must be one complete, self-contained HTML file — inline <style> and <script> tags, no external files, no build step, no npm packages, no import statements. Make it visually clean and functional.',
    maxTokens: 4096,
  },
  explain: {
    systemPrompt: "You are 369's teaching layer. Explain what was just built in plain, beginner-friendly language. No jargon without defining it.",
    maxTokens: 1024,
  },
};

export async function routeModel(taskType: TaskType, messages: RouterMessage[]): Promise<string> {
  const config = ROUTES[taskType];

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: config.maxTokens,
      messages: [{ role: "system", content: config.systemPrompt }, ...messages],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
