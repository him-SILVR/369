"use client";

import { useState } from "react";
import Link from "next/link";

export default function Build() {
  const [prompt, setPrompt] = useState("");
  const [html, setHtml] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setHtml(data.html);
        setExplanation(data.explanation);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col h-screen max-w-5xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">369 — Build</h1>
        <Link href="/" className="text-sm text-neutral-400 hover:text-blue-400">← Chat</Link>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 outline-none focus:border-blue-500"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
          placeholder="Describe what to build, e.g. 'a pomodoro timer'"
        />
        <button onClick={generate} disabled={loading} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-4 py-2 rounded-lg font-medium">
          {loading ? "Building..." : "Build"}
        </button>
      </div>

      {error && <div className="bg-red-900/40 border border-red-700 text-red-200 rounded-lg p-3 mb-4 text-sm">{error}</div>}
      {explanation && <p className="text-neutral-400 text-sm mb-4">{explanation}</p>}

      <div className="flex-1 bg-white rounded-lg overflow-hidden border border-neutral-700">
        {html ? (
          <iframe srcDoc={html} className="w-full h-full" sandbox="allow-scripts" title="369 build preview" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 bg-neutral-900">
            Your build will preview here
          </div>
        )}
      </div>
    </main>
  );
}