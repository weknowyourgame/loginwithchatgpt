import Link from "next/link";

import { InstallCommand } from "@/components/install-command";
import { ManualCodePanel } from "@/components/manual-code-panel";

const usageSnippet = `import { LoginWithChatGPT } from "loginwithchatgpt/react";

export default function Page() {
  return (
    <LoginWithChatGPT
      onConnected={(s) => console.log(s.account.email)}
    />
  );
}`;

const callSnippet = `import { createClient } from "loginwithchatgpt";

// billed to the user's ChatGPT subscription — no API key
const text = await createClient().respond("Summarize this thread");`;

const steps = [
  {
    n: "01",
    title: "User clicks the button",
    body: "They sign in with their own ChatGPT account through OpenAI's Codex OAuth flow."
  },
  {
    n: "02",
    title: "Token stored, encrypted",
    body: "Their subscription token is saved with AES-256-GCM, keyed from the OS keychain."
  },
  {
    n: "03",
    title: "AI runs on their plan",
    body: "Every call bills the user's ChatGPT subscription. You never pay OpenAI for usage."
  }
];

const features = [
  {
    title: "No API bill",
    body: "Costs scale with users — for them, not you. Each user funds their own AI."
  },
  {
    title: "Three login flows",
    body: "Loopback for desktop, device-code for web, headless paste for SSH and CI."
  },
  {
    title: "Encrypted by default",
    body: "Tokens encrypted at rest, auto-refreshed on expiry and 401. Swap the store in one line."
  },
  {
    title: "One package, three entries",
    body: "Headless engine, a React button, and Next.js route handlers. Install once."
  }
];

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="grid gap-8 pt-28 pb-16 sm:pt-32 sm:pb-24">
        <div className="grid gap-5">
          <p className="theme-text-muted font-mono text-xs uppercase tracking-[0.25em]">
            open source · MIT · bring your own subscription
          </p>
          <h1 className="theme-text-strong max-w-[18ch] text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            Login with ChatGPT
          </h1>
          <p className="theme-text max-w-[58ch] text-base leading-relaxed sm:text-lg">
            A drop-in button that lets your users power your app&apos;s AI with their own ChatGPT
            subscription. Ship AI features without ever paying OpenAI for API usage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/getting-started/usage"
            className="inline-flex items-center rounded-lg bg-(--color-dot-on) px-5 py-2.5 text-sm font-semibold text-(--color-bg) transition-opacity hover:opacity-90"
          >
            Get started
          </Link>
          <a
            href="https://github.com/weknowyourgame/loginwithchatgpt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg bg-surface px-5 py-2.5 text-sm font-semibold theme-text-strong transition-opacity hover:opacity-90"
          >
            GitHub
          </a>
        </div>

        <div className="max-w-xl">
          <InstallCommand />
        </div>
      </section>

      {/* The one line */}
      <section className="grid gap-6 border-t border-(--color-border) py-16 sm:py-20">
        <div className="grid gap-2">
          <h2 className="theme-text-strong text-2xl tracking-tight sm:text-3xl">One line in your UI</h2>
          <p className="theme-text max-w-[58ch] text-sm leading-relaxed sm:text-base">
            Drop the button, then make AI calls that bill the connected user. No keys, no token
            plumbing, no refresh logic.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <ManualCodePanel title="the button" code={usageSnippet} lang="tsx" />
          <ManualCodePanel title="the call" code={callSnippet} lang="tsx" />
        </div>
      </section>

      {/* How it works */}
      <section className="grid gap-8 border-t border-(--color-border) py-16 sm:py-20">
        <h2 className="theme-text-strong text-2xl tracking-tight sm:text-3xl">How it works</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.n} className="grid gap-2">
              <span className="theme-text-muted font-mono text-sm">{step.n}</span>
              <h3 className="theme-text-strong text-base tracking-tight">{step.title}</h3>
              <p className="theme-text text-sm leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-8 border-t border-(--color-border) py-16 sm:py-20">
        <h2 className="theme-text-strong text-2xl tracking-tight sm:text-3xl">Why it&apos;s nice</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <div key={feature.title} className="theme-page-shell grid gap-2 rounded-2xl p-6">
              <h3 className="theme-text-strong text-base tracking-tight">{feature.title}</h3>
              <p className="theme-text text-sm leading-relaxed">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="grid gap-5 border-t border-(--color-border) py-20 text-center sm:py-28">
        <h2 className="theme-text-strong text-3xl tracking-tight sm:text-4xl">
          Ship AI without the bill
        </h2>
        <p className="theme-text mx-auto max-w-[48ch] text-sm leading-relaxed sm:text-base">
          Your users already pay for ChatGPT. Let them bring it into your app.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/getting-started/introduction"
            className="inline-flex items-center rounded-lg bg-(--color-dot-on) px-5 py-2.5 text-sm font-semibold text-(--color-bg) transition-opacity hover:opacity-90"
          >
            Read the docs
          </Link>
          <Link
            href="/playground"
            className="inline-flex items-center rounded-lg bg-surface px-5 py-2.5 text-sm font-semibold theme-text-strong transition-opacity hover:opacity-90"
          >
            Playground
          </Link>
        </div>
      </section>
    </main>
  );
}
