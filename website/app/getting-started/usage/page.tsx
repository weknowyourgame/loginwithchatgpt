import Link from "next/link";

import { ManualCodePanel } from "@/components/manual-code-panel";

const installCommand = `bun add loginwithchatgpt`;

const routeHandler = `// app/api/chatgpt/[...lwc]/route.ts
import { createHandlers } from "loginwithchatgpt/next";

export const runtime = "nodejs";
export const { GET, POST } = createHandlers();`;

const buttonUsage = `"use client";
import { LoginWithChatGPT } from "loginwithchatgpt/react";

export default function Page() {
  return <LoginWithChatGPT onConnected={(s) => console.log(s.account.email)} />;
}`;

const aiCall = `// app/api/chat/route.ts
import { createClient } from "loginwithchatgpt";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const text = await createClient().respond(prompt);
  return Response.json({ text });
}`;

export default function UsagePage() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section className="theme-page-shell grid gap-6 rounded-2xl py-10 sm:p-6">
        <header className="grid gap-3">
          <p className="theme-text-muted text-xs">Quickstart</p>
          <h1 className="theme-text-strong text-2xl tracking-tight sm:text-3xl">
            From install to working in two files
          </h1>
          <p className="theme-text max-w-[72ch] text-sm leading-relaxed">
            For a local-first Next.js (App Router) app. <code className="font-mono text-[0.9em]">react</code> is
            an optional peer dependency you only need for the button.
          </p>
        </header>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">1. Install</h2>
          <ManualCodePanel title="Install" code={installCommand} lang="bash" />
        </section>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">2. Mount the route handlers</h2>
          <p className="theme-text text-sm leading-relaxed">
            One catch-all route serves <code className="font-mono text-[0.9em]">/api/chatgpt/login</code>,{" "}
            <code className="font-mono text-[0.9em]">/session</code>, and{" "}
            <code className="font-mono text-[0.9em]">/logout</code>.
          </p>
          <ManualCodePanel title="route handlers" code={routeHandler} lang="tsx" />
        </section>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">3. Drop in the button</h2>
          <ManualCodePanel title="the button" code={buttonUsage} lang="tsx" />
        </section>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">4. Make AI calls</h2>
          <p className="theme-text text-sm leading-relaxed">
            Once a user is connected, calls bill their subscription. No API key anywhere.
          </p>
          <ManualCodePanel title="an AI call" code={aiCall} lang="tsx" />
        </section>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">Next step</h2>
          <p className="theme-text text-sm leading-relaxed">
            See the full{" "}
            <Link
              href="/getting-started/manual"
              className="theme-link underline decoration-(--color-fg-dim) underline-offset-2"
            >
              API reference
            </Link>{" "}
            for the core functions, login flows, and token storage.
          </p>
        </section>
      </section>
    </main>
  );
}
