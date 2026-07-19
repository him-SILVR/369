"use client";

import { useState } from "react";

interface Source {
  title: string;
  url: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"chat" | "research">("chat");

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
          taskType: mode,
        }),
      });
      const data = await res.json();

      if (data.reply) {
        setMessages([...nextMessages, { role: "assistant", content: data.reply, sources: data.sources }]);
      }
    } catch (err) {
      console.error(err);
      setMessages([...nextMessages, { role: "assistant", content: "Something went wrong. Try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">369</h1>
<a href="/build" className="text-sm text-neutral-400 hover:text-blue-400 mr-4">Build →</a>
        <div className="flex gap-1 bg-neutral-900 rounded-lg p-1">
          <button onClick={() => setMode("chat")} className={`px-3 py-1 rounded-md text-sm ${mode === "chat" ? "bg-blue-600" : "text-neutral-400"}`}>Chat</button>
          <button onClick={() => setMode("research")} className={`px-3 py-1 rounded-md text-sm ${mode === "research" ? "bg-blue-600" : "text-neutral-400"}`}>Research</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`p-3 rounded-lg max-w-[85%] ${m.role === "user" ? "bg-blue-600 ml-auto text-white" : "bg-neutral-800 text-neutral-100"}`}>
            <div>{m.content}</div>
            {m.sources && m.sources.length > 0 && (
              <div className="mt-2 pt-2 border-t border-neutral-700 text-xs text-neutral-400 space-y-1">
                {m.sources.map((s, j) => (
                  <a key={j} href={s.url} target="_blank" rel="noopener noreferrer" className="block hover:text-blue-400 truncate">[{j + 1}] {s.title}</a>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="p-3 rounded-lg bg-neutral-800 max-w-[85%] text-neutral-400">
            {mode === "research" ? "Searching and thinking..." : "Thinking..."}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 outline-none focus:border-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={mode === "research" ? "Ask 369 to research anything..." : "Ask 369 anything..."}
        />
        <button onClick={sendMessage} disabled={loading} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 rounded-lg font-medium">Send</button>
      </div>
    </main>
  );
}
