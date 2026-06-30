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

const navLink: React.CSSProperties = {
  color: "#a1a1aa",
  textDecoration: "none",
  fontSize: 14,
  cursor: "pointer",
  marginRight: 20,
  transition: "color 0.2s",
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
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#0a0a0a" }}>
      <header style={{ borderBottom: "1px solid #1a1a1a", padding: "16px 24px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Login with ChatGPT</h2>
          <nav style={{ display: "flex" }}>
            <a href="https://github.com/weknowyourgame/loginwithchatgpt" target="_blank" rel="noopener noreferrer" style={navLink}>
              GitHub
            </a>
            <a href="https://github.com/weknowyourgame/loginwithchatgpt/tree/master/docs/qa" target="_blank" rel="noopener noreferrer" style={navLink}>
              Docs
            </a>
            <a href="#playground" style={navLink}>
              Playground
            </a>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: 640, margin: "0 auto", width: "100%", padding: "80px 24px 40px", display: "grid", gap: 24 }}>
        <div>
          <h1 style={{ fontSize: 32, margin: 0 }}>Login with ChatGPT</h1>
          <p style={{ color: "#a1a1aa", lineHeight: 1.6 }}>
            Your users power this app's AI with their own ChatGPT subscription. No API key, no usage bill for you.
          </p>
        </div>

        <LoginWithChatGPT onConnected={() => setConnected(true)} className="lwc-btn" />

        {connected && (
          <section id="playground" style={{ display: "grid", gap: 12, marginTop: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>Playground</h3>
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
              <pre style={{ whiteSpace: "pre-wrap", background: "#111", padding: 16, borderRadius: 8, fontSize: 13 }}>
                {answer}
              </pre>
            )}
          </section>
        )}
      </main>

      <footer style={{ borderTop: "1px solid #1a1a1a", padding: "24px", marginTop: "auto" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#666" }}>
          <div>
            <p style={{ margin: 0 }}>Built with loginwithchatgpt</p>
          </div>
          <nav style={{ display: "flex", gap: 20 }}>
            <a href="https://github.com/weknowyourgame/loginwithchatgpt" target="_blank" rel="noopener noreferrer" style={{ color: "#a1a1aa", textDecoration: "none" }}>
              GitHub
            </a>
            <a href="https://github.com/weknowyourgame/loginwithchatgpt/blob/master/docs/qa/SDK_REVIEW.md" target="_blank" rel="noopener noreferrer" style={{ color: "#a1a1aa", textDecoration: "none" }}>
              QA Report
            </a>
            <a href="#playground" style={{ color: "#a1a1aa", textDecoration: "none" }}>
              Playground
            </a>
            <a href="https://github.com/weknowyourgame/loginwithchatgpt/tree/master/docs/qa/examples" target="_blank" rel="noopener noreferrer" style={{ color: "#a1a1aa", textDecoration: "none" }}>
              Examples
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
