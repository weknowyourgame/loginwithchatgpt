import { spawn } from "node:child_process";
import { createPkce } from "./pkce";
import { waitForCode } from "./loopback";
import { accountInfo, authorizeUrl, exchangeCode, refreshTokens } from "./tokens";
import { defaultStore, type TokenStore, type Tokens } from "./store";

export interface Session {
  account: { email?: string; id?: string };
  plan: { name?: string };
  status: "connected";
}

export interface LoginOptions {
  store?: TokenStore;
  /** Called with the authorize URL for display. The browser is still opened unless disabled. */
  onUrl?: (url: string) => void;
  /** Set false to skip auto-opening the system browser (caller handles it via onUrl). */
  openBrowser?: boolean;
}

export function toSession(tokens: Tokens): Session {
  const info = accountInfo(tokens);
  return {
    account: { email: info.email, id: info.accountId },
    plan: { name: info.plan },
    status: "connected",
  };
}

function openSystemBrowser(url: string): void {
  const [cmd, ...args] =
    process.platform === "darwin" ? ["open", url]
    : process.platform === "win32" ? ["cmd", "/c", "start", "", url]
    : ["xdg-open", url];
  try {
    spawn(cmd, args, { stdio: "ignore", detached: true }).unref();
  } catch {
    // Caller can still complete login via the onUrl-displayed link.
  }
}

let loginInProgress: Promise<Session> | null = null;

/** Run the full loopback OAuth flow and persist the resulting tokens. */
export async function login(opts: LoginOptions = {}): Promise<Session> {
  if (loginInProgress) {
    throw new Error("Login already in progress. Please wait for it to complete or try again.");
  }

  const store = opts.store ?? defaultStore;
  const pkce = createPkce();
  const url = authorizeUrl(pkce);

  loginInProgress = (async () => {
    try {
      const codePromise = waitForCode(pkce.state);
      opts.onUrl?.(url);
      if (opts.openBrowser !== false) {
        try {
          await openSystemBrowser(url);
        } catch (err) {
          // Browser open failed, but onUrl was called so user can visit manually
        }
      }

      const code = await codePromise;
      const tokens = await exchangeCode(code, pkce.verifier);
      await store.save(tokens);
      return toSession(tokens);
    } finally {
      loginInProgress = null;
    }
  })();

  return loginInProgress;
}

export interface HeadlessLogin {
  /** Open in any browser, approve, then pass the redirected code (or full URL) to complete(). */
  url: string;
  complete(codeOrUrl: string): Promise<Session>;
}

/** Accept either a raw code or the full redirected URL containing it. */
function extractCode(input: string, expectedState: string): string {
  const trimmed = input.trim();
  if (!trimmed.includes("://") && !trimmed.includes("?")) return trimmed;
  const url = new URL(trimmed);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code) throw new Error("No code found in the pasted URL");
  if (state && state !== expectedState) throw new Error("State mismatch — possible CSRF");
  return code;
}

/**
 * Headless login for environments where the loopback redirect can't be caught
 * (SSH, containers, CI). Returns the authorize URL and a complete() to call with the
 * code the user copies from the browser after approving.
 */
export function startLogin(opts: { store?: TokenStore } = {}): HeadlessLogin {
  const store = opts.store ?? defaultStore;
  const pkce = createPkce();
  return {
    url: authorizeUrl(pkce),
    async complete(codeOrUrl: string): Promise<Session> {
      const tokens = await exchangeCode(extractCode(codeOrUrl, pkce.state), pkce.verifier);
      await store.save(tokens);
      return toSession(tokens);
    },
  };
}

export async function getSession(store: TokenStore = defaultStore): Promise<Session | null> {
  const tokens = await store.load();
  return tokens ? toSession(tokens) : null;
}

export async function logout(store: TokenStore = defaultStore): Promise<void> {
  await store.clear();
}

/** Force a token refresh and persist the result. */
export async function refresh(store: TokenStore = defaultStore): Promise<Session> {
  const tokens = await store.load();
  if (!tokens) throw new Error("Not authenticated.");
  const next = await refreshTokens(tokens.refresh_token);
  await store.save(next);
  return toSession(next);
}
