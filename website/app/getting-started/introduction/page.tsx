import Link from "next/link";

export const dynamic = "force-static";

export default function IntroductionPage() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section className="theme-page-shell grid gap-8 rounded-2xl py-10 sm:p-6">
        <header className="grid gap-3">
          <p className="theme-text-muted text-xs">Introduction</p>
          <h1 className="theme-text-strong text-2xl tracking-tight sm:text-3xl">
            Let your users bring their own ChatGPT subscription
          </h1>
          <p className="theme-text max-w-[72ch] text-sm leading-relaxed">
            loginwithchatgpt is a drop-in &quot;Login with ChatGPT&quot; button. Your users sign in with
            their own ChatGPT account, and your app&apos;s AI features run on their Plus/Pro subscription
            instead of an API key you pay for. It uses OpenAI&apos;s Codex OAuth flow — the same mechanism
            the Codex CLI uses.
          </p>
        </header>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">What this is</h2>
          <p className="theme-text max-w-[72ch] text-sm leading-relaxed">
            One package with three entry points: a headless engine, a React component, and Next.js route
            handlers. The dev writes about one line; the library handles PKCE, the loopback/device flows,
            encrypted token storage, and automatic refresh.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">Why it exists</h2>
          <ul className="theme-text grid gap-2 text-sm leading-relaxed">
            <li>- Building AI features normally means paying OpenAI per request — costs scale with users.</li>
            <li>- Your users often already pay for ChatGPT but can&apos;t use it inside your app.</li>
            <li>- This shifts the AI cost to each user&apos;s own subscription. Win/win.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">The honest scope</h2>
          <p className="theme-text max-w-[72ch] text-sm leading-relaxed">
            Each user logs in with their own account, on their own machine, spending their own
            subscription — the same posture as the Codex CLI. It is built for local-first contexts:
            desktop apps, Electron, CLIs, and local-first Next.js tools, where the OAuth redirect lands on
            the user&apos;s own machine. It is not a way to pool or resell subscriptions.
          </p>
        </section>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">Start here</h2>
          <p className="theme-text max-w-[72ch] text-sm leading-relaxed">
            Head to{" "}
            <Link href="/getting-started/usage" className="theme-link underline decoration-fg-dim underline-offset-2">
              Quickstart
            </Link>{" "}
            to install and wire it up, or see the{" "}
            <Link href="/getting-started/manual" className="theme-link underline decoration-fg-dim underline-offset-2">
              API reference
            </Link>
            .
          </p>
        </section>
      </section>
    </main>
  );
}
