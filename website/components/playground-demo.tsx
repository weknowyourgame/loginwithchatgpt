"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "pending" | "connected";

interface Account {
  email?: string;
  id?: string;
}

export function PlaygroundDemo() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [userCode, setUserCode] = useState("");
  const [verificationUrl, setVerificationUrl] = useState("");
  const [account, setAccount] = useState<Account>();
  const [planName, setPlanName] = useState<string>();
  const [prompt, setPrompt] = useState("Write a haiku about shipping software.");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/chatgpt/session")
      .then((r) => r.json())
      .then((s) => {
        if (s && s.status === "connected") {
          setAccount(s.account);
          setPlanName(s.plan?.name);
          setPhase("connected");
        }
      })
      .catch(() => {});
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, []);

  function startPolling(deviceAuthId: string, code: string, interval: number) {
    pollRef.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/chatgpt/poll", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ deviceAuthId, userCode: code })
        });
        const data = await res.json();
        if (data.status === "complete") {
          setAccount(data.account);
          setPlanName(data.plan?.name);
          setPhase("connected");
          return;
        }
        if (data.error) {
          setError(data.error);
          setPhase("idle");
          return;
        }
        startPolling(deviceAuthId, code, interval);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Poll failed");
        setPhase("idle");
      }
    }, interval);
  }

  async function connect() {
    setError("");
    setAnswer("");
    try {
      const res = await fetch("/api/chatgpt/device", { method: "POST" });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }
      setUserCode(data.userCode);
      setVerificationUrl(data.verificationUrl);
      setPhase("pending");
      window.open(data.verificationUrl, "_blank", "noopener,noreferrer");
      startPolling(data.deviceAuthId, data.userCode, data.interval ?? 5000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start");
    }
  }

  async function logout() {
    if (pollRef.current) clearTimeout(pollRef.current);
    await fetch("/api/chatgpt/logout", { method: "POST" }).catch(() => {});
    setPhase("idle");
    setAccount(undefined);
    setPlanName(undefined);
    setAnswer("");
  }

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

  const connected = phase === "connected";
  const btn =
    "inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-40";

  return (
    <div className="theme-page-shell grid gap-5 rounded-2xl p-6">
      {!connected && phase === "idle" ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-400">
          <strong className="font-semibold">Before you connect:</strong> device code login must be
          enabled in your ChatGPT account. Go to{" "}
          <strong>ChatGPT → Settings → Security &amp; Login → Allow device code login</strong> and
          turn it on, then click the button below.
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-0.5">
          <span className="theme-text-strong text-sm font-semibold">Live demo</span>
          <span className="theme-text-muted text-xs">
            {connected
              ? `Connected as ${account?.email ?? account?.id ?? "your account"}${planName ? ` · ${planName}` : ""}`
              : phase === "pending" ? "Waiting for you to enter the code…" : "Not connected"}
          </span>
        </div>
        {connected ? (
          <button type="button" onClick={logout} className={`${btn} bg-surface theme-text-strong`}>
            Disconnect
          </button>
        ) : (
          <button
            type="button"
            onClick={connect}
            disabled={phase === "pending"}
            className={`${btn} bg-(--color-dot-on) text-(--color-bg)`}
          >
            {phase === "pending" ? "Waiting…" : "Login with ChatGPT"}
          </button>
        )}
      </div>

      {phase === "pending" ? (
        <div className="grid gap-2 rounded-lg bg-(--color-shell) p-4 text-sm theme-text">
          <p>
            A tab just opened. Enter this code at{" "}
            <a
              href={verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="theme-link underline underline-offset-2"
            >
              {verificationUrl.replace("https://", "")}
            </a>
            :
          </p>
          <span className="theme-text-strong font-mono text-2xl tracking-[0.3em]">{userCode}</span>
          <p className="theme-text-muted text-xs">
            Didn&apos;t get the tab? Open the link above manually. Code expires in ~5 minutes.
          </p>
        </div>
      ) : null}

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
            className={`${btn} bg-surface theme-text-strong`}
          >
            {loading ? "Thinking…" : "Run on my subscription"}
          </button>
          {!connected ? <span className="theme-text-muted text-xs">Connect first to run a call.</span> : null}
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
