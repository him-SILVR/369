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
  html?: string;
}

type Mode = "chat" | "research" | "build";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("chat");

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    const historyForApi = nextMessages.map(({ role, content }) => ({ role, content }));

    try {
      if (mode === "build") {
        const res = await fetch("/api/build", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: historyForApi }),
        });
        const data = await res.json();

        if (data.error) {
          setMessages([...nextMessages, { role: "assistant", content: data.error }]);
        } else {
          setMessages([...nextMessages, { role: "assistant", content: data.explanation ?? "Built it.", html: data.html }]);
        }
      } else {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: historyForApi, taskType: mode }),
        });
        const data = await res.json();

        if (data.reply) {
          setMessages([...nextMessages, { role: "assistant", content: data.reply, sources: data.sources }]);
        }
      }
    } catch (err) {
      console.error(err);
      setMessages([...nextMessages, { role: "assistant", content: "Something went wrong. Try again." }]);
    } finally {
      setLoading(false);
    }
  }

  async function explainBuild(index: number) {
    const target = messages[index];
    if (!target.html || loading) return;
    setLoading(true);

    const explainRequest = [
      ...messages.slice(0, index + 1).map(({ role, content }) => ({ role, content })),
      { role: "user", content: `Explain what you just built and why, in plain beginner-friendly language. Here is the code:\n\n${target.html}` },
    ];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: explainRequest, taskType: "explain" }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const loadingLabel = mode === "research" ? "Searching and thinking..." : mode === "build" ? "Building..." : "Thinking...";
  const placeholder = mode === "research" ? "Ask 369 to research anything..." : mode === "build" ? "Describe what to build — or say 'build that' after researching" : "Ask 369 anything...";

  return (
    <main className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">369</h1>
        <div className="flex gap-1 bg-neutral-900 rounded-lg p-1">
          {(["chat", "research", "build"] as Mode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`px-3 py-1 rounded-md text-sm capitalize ${mode === m ? "bg-blue-600" : "text-neutral-400"}`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`p-3 rounded-lg max-w-[90%] ${m.role === "user" ? "bg-blue-600 ml-auto text-white" : "bg-neutral-800 text-neutral-100"}`}>
            <div>{m.content}</div>
            {m.sources && m.sources.length > 0 && (
              <div className="mt-2 pt-2 border-t border-neutral-700 text-xs text-neutral-400 space-y-1">
                {m.sources.map((s, j) => (
                  <a key={j} href={s.url} target="_blank" rel="noopener noreferrer" className="block hover:text-blue-400 truncate">[{j + 1}] {s.title}</a>
                ))}
              </div>
            )}
            {m.html && (
              <>
                <div className="mt-3 bg-white rounded-lg overflow-hidden border border-neutral-700" style={{ height: "400px" }}>
                  <iframe srcDoc={m.html} className="w-full h-full" sandbox="allow-scripts" title="369 build preview" />
                </div>
                <button onClick={() => explainBuild(i)} className="mt-2 text-xs text-neutral-400 hover:text-blue-400 underline">
                  Explain this
                </button>
              </>
            )}
          </div>
        ))}
        {loading && <div className="p-3 rounded-lg bg-neutral-800 max-w-[85%] text-neutral-400">{loadingLabel}</div>}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 outline-none focus:border-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={placeholder}
        />
        <button onClick={sendMessage} disabled={loading} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 rounded-lg font-medium">
          Send
        </button>
      </div>
    </main>
  );
}
