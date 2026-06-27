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

function toSession(tokens: Tokens): Session {
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

/** Run the full loopback OAuth flow and persist the resulting tokens. */
export async function login(opts: LoginOptions = {}): Promise<Session> {
  const store = opts.store ?? defaultStore;
  const pkce = createPkce();
  const url = authorizeUrl(pkce);

  // Start listening before the browser opens to avoid missing a fast redirect.
  const codePromise = waitForCode(pkce.state);
  opts.onUrl?.(url);
  if (opts.openBrowser !== false) await openSystemBrowser(url);

  const code = await codePromise;
  const tokens = await exchangeCode(code, pkce.verifier);
  await store.save(tokens);
  return toSession(tokens);
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
