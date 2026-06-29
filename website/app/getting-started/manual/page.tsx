import Link from "next/link";

import { ManualCodePanel } from "@/components/manual-code-panel";

const coreImport = `import {
  login,
  startLogin,
  startDeviceLogin,
  logout,
  getSession,
  refresh,
  createClient
} from "loginwithchatgpt";`;

const modelExample = `// default is gpt-5.5; override per call
const text = await createClient().respond("Refactor this", { model: "gpt-5.4-mini" });

// streaming
for await (const delta of createClient().stream("Write tests", { model: "gpt-5.4" })) {
  process.stdout.write(delta);
}`;

const storeExample = `import { createClient, type TokenStore } from "loginwithchatgpt";

const myStore: TokenStore = { load, save, clear };
const client = createClient(myStore);`;

export default function ManualPage() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section className="theme-page-shell grid gap-8 rounded-2xl py-10 sm:p-6">
        <header className="grid gap-3">
          <p className="theme-text-muted text-xs">API reference</p>
          <h1 className="theme-text-strong text-2xl tracking-tight sm:text-3xl">Core API</h1>
          <p className="theme-text max-w-[72ch] text-sm leading-relaxed">
            The headless engine. Every function takes an optional <code className="font-mono text-[0.9em]">TokenStore</code>;
            the default is an encrypted file store.
          </p>
        </header>

        <ManualCodePanel title="imports" code={coreImport} lang="tsx" />

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">Functions</h2>
          <ul className="theme-text grid gap-2 text-sm leading-relaxed">
            <li>
              <code className="font-mono text-[0.9em]">login()</code> — loopback OAuth flow (desktop/local), stores tokens.
            </li>
            <li>
              <code className="font-mono text-[0.9em]">startDeviceLogin()</code> — device-code flow for web/headless; returns{" "}
              <code className="font-mono text-[0.9em]">{`{ userCode, verificationUrl, wait }`}</code>.
            </li>
            <li>
              <code className="font-mono text-[0.9em]">startLogin()</code> — headless paste flow for SSH/CI; returns{" "}
              <code className="font-mono text-[0.9em]">{`{ url, complete }`}</code>.
            </li>
            <li>
              <code className="font-mono text-[0.9em]">getSession()</code> — current session, or null.
            </li>
            <li>
              <code className="font-mono text-[0.9em]">refresh()</code> — force a token refresh.
            </li>
            <li>
              <code className="font-mono text-[0.9em]">logout()</code> — clear stored tokens.
            </li>
            <li>
              <code className="font-mono text-[0.9em]">createClient()</code> — a client with{" "}
              <code className="font-mono text-[0.9em]">respond(prompt)</code> and{" "}
              <code className="font-mono text-[0.9em]">stream(prompt)</code>.
            </li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">Login flows</h2>
          <ul className="theme-text grid gap-2 text-sm leading-relaxed">
            <li>- Loopback — auto-captures the redirect on the user&apos;s machine. Best for desktop/CLI.</li>
            <li>- Device code — shows a short code the user enters on an OpenAI page. Works on web/headless.</li>
            <li>- Headless paste — user copies the code from the redirect URL. Fallback for SSH/containers.</li>
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">Models</h2>
          <p className="theme-text max-w-[72ch] text-sm leading-relaxed">
            These models work with the ChatGPT subscription backend. They are{" "}
            <strong>not</strong> the same as direct OpenAI API models — they only work when the
            user is signed in with a ChatGPT Plus or Pro account.
          </p>
          <div className="overflow-x-auto">
            <table className="theme-text w-full text-sm">
              <thead>
                <tr className="border-b border-(--color-border)">
                  <th className="py-2 pr-4 text-left font-medium">Model</th>
                  <th className="py-2 pr-4 text-left font-medium">Description</th>
                  <th className="py-2 text-left font-medium">Plan</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-(--color-border)">
                  <td className="py-2 pr-4 font-mono text-[0.9em]">gpt-5.5</td>
                  <td className="py-2 pr-4">Newest frontier model. Best for complex coding. <span className="theme-text-muted">(default)</span></td>
                  <td className="py-2">Plus / Pro</td>
                </tr>
                <tr className="border-b border-(--color-border)">
                  <td className="py-2 pr-4 font-mono text-[0.9em]">gpt-5.4</td>
                  <td className="py-2 pr-4">Flagship. Strong coding, reasoning, tool use.</td>
                  <td className="py-2">Plus / Pro</td>
                </tr>
                <tr className="border-b border-(--color-border)">
                  <td className="py-2 pr-4 font-mono text-[0.9em]">gpt-5.4-mini</td>
                  <td className="py-2 pr-4">Faster, lighter. Good for quick tasks and subagents.</td>
                  <td className="py-2">Plus / Pro</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono text-[0.9em]">gpt-5.3-codex-spark</td>
                  <td className="py-2 pr-4">Near-instant coding iteration. Research preview.</td>
                  <td className="py-2">Pro only</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ManualCodePanel title="pick a model" code={modelExample} lang="tsx" />
        </section>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">Token storage</h2>
          <p className="theme-text max-w-[72ch] text-sm leading-relaxed">
            Tokens are encrypted at rest (AES-256-GCM) with a key kept in the OS keychain where available.
            Storage is pluggable through the <code className="font-mono text-[0.9em]">TokenStore</code> interface.
          </p>
          <ManualCodePanel title="custom store" code={storeExample} lang="tsx" />
        </section>

        <section className="grid gap-3">
          <h2 className="theme-text-strong text-lg tracking-tight">Entry points</h2>
          <ul className="theme-text grid gap-2 text-sm leading-relaxed">
            <li>
              <code className="font-mono text-[0.9em]">loginwithchatgpt</code> — engine (Node).
            </li>
            <li>
              <code className="font-mono text-[0.9em]">loginwithchatgpt/react</code> — button + hook (browser).
            </li>
            <li>
              <code className="font-mono text-[0.9em]">loginwithchatgpt/next</code> — App Router handlers (Node).
            </li>
          </ul>
          <p className="theme-text text-sm leading-relaxed">
            Back to the{" "}
            <Link
              href="/getting-started/usage"
              className="theme-link underline decoration-(--color-fg-dim) underline-offset-2"
            >
              Quickstart
            </Link>
            .
          </p>
        </section>
      </section>
    </main>
  );
}
