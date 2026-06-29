import type { Metadata } from "next";

import { ManualCodePanel } from "@/components/manual-code-panel";
import { PlaygroundDemo } from "@/components/playground-demo";

export const metadata: Metadata = {
  title: "Playground",
  description: "A live Login with ChatGPT demo, running on the loginwithchatgpt SDK itself."
};

const startSnippet = `// app/api/chatgpt/device/route.ts
import { deviceStart } from "loginwithchatgpt";

export const runtime = "nodejs";
export async function POST() {
  return Response.json(await deviceStart());
}`;

const pollSnippet = `// app/api/chatgpt/poll/route.ts
import { devicePoll } from "loginwithchatgpt";

const result = await devicePoll(deviceAuthId, userCode);
// "pending" until the user enters the code, then { tokens }`;

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
            This page uses <code className="font-mono text-[0.9em]">loginwithchatgpt</code> for real. It
            runs the <strong>device-code flow</strong>, so it works right here in the browser — connect
            your ChatGPT account and the call bills your own subscription.
          </p>
          <p className="theme-text-muted text-xs leading-relaxed">
            Requires a ChatGPT Plus or Pro subscription.{" "}
            <strong className="theme-text">First time?</strong> Enable device code login first:{" "}
            <strong className="theme-text">ChatGPT → Settings → Security &amp; Login → Allow device code login</strong>.
          </p>
        </header>

        <PlaygroundDemo />

        <div className="grid gap-4">
          <ManualCodePanel title="start the flow" code={startSnippet} lang="tsx" />
          <ManualCodePanel title="poll for the token" code={pollSnippet} lang="tsx" />
        </div>
      </section>
    </main>
  );
}
