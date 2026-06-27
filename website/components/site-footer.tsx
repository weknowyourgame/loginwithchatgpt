import Link from "next/link";

const REPO_URL = "https://github.com/weknowyourgame/loginwithchatgpt";
const NPM_URL = "https://www.npmjs.com/package/loginwithchatgpt";

const linkClass =
  "text-fg-dim transition-colors duration-200 ease-out hover:text-link-hover focus-visible:text-link-hover";

export function SiteFooter() {
  return (
    <footer role="contentinfo" className="mx-auto mt-24 mb-10 w-full max-w-5xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 rounded-2xl bg-surface px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-1">
          <span className="theme-text-strong text-lg font-semibold">loginwithchatgpt</span>
          <span className="theme-text-muted text-xs">v0.1.0 · MIT · bring your own subscription</span>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/getting-started/introduction" className={linkClass}>
            Introduction
          </Link>
          <Link href="/getting-started/usage" className={linkClass}>
            Quickstart
          </Link>
          <Link href="/getting-started/manual" className={linkClass}>
            API
          </Link>
          <Link href="/playground" className={linkClass}>
            Playground
          </Link>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
            GitHub
          </a>
          <a href={NPM_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
            npm
          </a>
        </nav>
      </div>
    </footer>
  );
}
