import type { Metadata } from "next";

import { ManualCodePanel } from "@/components/manual-code-panel";
import { PlaygroundDemo } from "@/components/playground-demo";

export const metadata: Metadata = {
  title: "Playground",
  description: "A live Login with ChatGPT demo, running on the loginwithchatgpt SDK itself."
};

const serverSnippet = `// app/api/chatgpt/[...lwc]/route.ts
import { createHandlers } from "loginwithchatgpt/next";

export const runtime = "nodejs";
export const { GET, POST } = createHandlers();`;

const clientSnippet = `// the demo above, in full
"use client";
import { LoginWithChatGPT } from "loginwithchatgpt/react";

const text = await fetch("/api/chat", {
  method: "POST",
  body: JSON.stringify({ prompt })
}).then((r) => r.json());`;

export default function PlaygroundPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
      <section className="grid gap-8">
        <header className="grid gap-3">
          <p className="theme-text-muted font-mono text-xs uppercase tracking-[0.2em]">Playground</p>
          <h1 className="theme-text-strong text-3xl tracking-tight sm:text-4xl">
            A live demo, on the SDK itself
          </h1>
          <p className="theme-text max-w-[62ch] text-sm leading-relaxed sm:text-base">
            This page uses <code className="font-mono text-[0.9em]">loginwithchatgpt</code> for real — the
            button below is the actual component, and &quot;Run&quot; calls an endpoint backed by the
            engine. Connect your ChatGPT account and the call bills your own subscription.
          </p>
          <p className="theme-text-muted text-xs leading-relaxed">
            Note: the loopback login completes when the site runs locally (your machine). On a deployed
            site you&apos;d use the device-code flow instead.
          </p>
        </header>

        <PlaygroundDemo />

        <div className="grid gap-4">
          <ManualCodePanel title="the server handler" code={serverSnippet} lang="tsx" />
          <ManualCodePanel title="the call from the UI" code={clientSnippet} lang="tsx" />
        </div>
      </section>
    </main>
  );
}
