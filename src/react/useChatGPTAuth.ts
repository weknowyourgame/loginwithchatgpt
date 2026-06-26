import { useCallback, useEffect, useState } from "react";
import type { Session } from "../core/index.ts";

export type AuthStatus = "idle" | "connecting" | "connected" | "error";

export interface UseChatGPTAuthOptions {
  /** Base path of the @next route handlers. Defaults to "/api/chatgpt". */
  basePath?: string;
}

export interface ChatGPTAuth {
  status: AuthStatus;
  account?: Session["account"];
  plan?: Session["plan"];
  error?: Error;
  login: () => void;
  logout: () => void;
}

/**
 * Client-side auth state. Drives login/logout against the server route handlers;
 * never touches the engine directly (the browser can't run it).
 */
export function useChatGPTAuth(options: UseChatGPTAuthOptions = {}): ChatGPTAuth {
  const basePath = options.basePath ?? "/api/chatgpt";
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<Error | undefined>();

  const apply = useCallback((s: Session | null) => {
    setSession(s);
    setStatus(s ? "connected" : "idle");
  }, []);

  useEffect(() => {
    let active = true;
    fetch(`${basePath}/session`)
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => active && apply(s as Session | null))
      .catch(() => active && apply(null));
    return () => {
      active = false;
    };
  }, [basePath, apply]);

  const login = useCallback(() => {
    setStatus("connecting");
    setError(undefined);
    fetch(`${basePath}/login`, { method: "POST" })
      .then((r) => {
        if (!r.ok) throw new Error(`Login failed: ${r.status}`);
        return r.json();
      })
      .then((s) => apply(s as Session))
      .catch((e) => {
        setStatus("error");
        setError(e instanceof Error ? e : new Error(String(e)));
      });
  }, [basePath, apply]);

  const logout = useCallback(() => {
    fetch(`${basePath}/logout`, { method: "POST" }).finally(() => apply(null));
  }, [basePath, apply]);

  return { status, account: session?.account, plan: session?.plan, error, login, logout };
}
