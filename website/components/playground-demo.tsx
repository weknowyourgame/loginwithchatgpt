"use client";

import { useState } from "react";
import { LoginWithChatGPT, useChatGPTAuth } from "loginwithchatgpt/react";

export function PlaygroundDemo() {
  const { status, account, plan } = useChatGPTAuth();
  const [prompt, setPrompt] = useState("Write a haiku about shipping software.");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const connected = status === "connected";

  async function ask() {
    setLoading(true);
    setAnswer("");
    setError("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (data.text) setAnswer(data.text);
      else setError(data.error ?? "No response");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="theme-page-shell grid gap-5 rounded-2xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-0.5">
          <span className="theme-text-strong text-sm font-semibold">Live demo</span>
          <span className="theme-text-muted text-xs">
            {connected
              ? `Connected as ${account?.email ?? account?.id ?? "your account"}${plan?.name ? ` · ${plan.name}` : ""}`
              : "Not connected"}
          </span>
        </div>
        <LoginWithChatGPT className="inline-flex items-center rounded-lg bg-(--color-dot-on) px-4 py-2 text-sm font-semibold text-(--color-bg) transition-opacity hover:opacity-90" />
      </div>

      <div className="grid gap-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          disabled={!connected}
          placeholder="Ask something…"
          className="w-full resize-y rounded-lg bg-(--color-shell) p-3 text-sm theme-text outline-none disabled:opacity-50"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={ask}
            disabled={!connected || loading || !prompt}
            className="inline-flex items-center rounded-lg bg-surface px-4 py-2 text-sm font-semibold theme-text-strong transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {loading ? "Thinking…" : "Run on my subscription"}
          </button>
          {!connected ? (
            <span className="theme-text-muted text-xs">Connect first to run a call.</span>
          ) : null}
        </div>

        {answer ? (
          <pre className="whitespace-pre-wrap rounded-lg bg-(--color-shell) p-4 text-sm theme-text">{answer}</pre>
        ) : null}
        {error ? (
          <pre className="whitespace-pre-wrap rounded-lg bg-(--color-shell) p-4 text-xs text-red-400">{error}</pre>
        ) : null}
      </div>
    </div>
  );
}
