"use client";

import { useState } from "react";
import { LoginWithChatGPT } from "loginwithchatgpt/react";

const button: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "1px solid #3a3a3a",
  background: "#1a1a1a",
  color: "#fafafa",
  cursor: "pointer",
  fontSize: 15,
};

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    setAnswer("");
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = (await res.json()) as { text?: string; error?: string };
    setAnswer(data.text ?? data.error ?? "No response");
    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "80px 24px", display: "grid", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 32, margin: 0 }}>Login with ChatGPT</h1>
        <p style={{ color: "#a1a1aa", lineHeight: 1.6 }}>
          Your users power this app&apos;s AI with their own ChatGPT subscription. No API key,
          no usage bill for you.
        </p>
      </div>

      <LoginWithChatGPT onConnected={() => setConnected(true)} className="lwc-btn" />

      {connected && (
        <section style={{ display: "grid", gap: 12, marginTop: 16 }}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask something…"
            rows={3}
            style={{
              padding: 12,
              borderRadius: 8,
              border: "1px solid #3a3a3a",
              background: "#111",
              color: "#fafafa",
              fontSize: 15,
              resize: "vertical",
            }}
          />
          <button style={button} onClick={ask} disabled={loading || !prompt}>
            {loading ? "Thinking…" : "Ask"}
          </button>
          {answer && (
            <pre style={{ whiteSpace: "pre-wrap", background: "#111", padding: 16, borderRadius: 8 }}>
              {answer}
            </pre>
          )}
        </section>
      )}
    </main>
  );
}
