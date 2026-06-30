"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "../core/index";

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
const FETCH_TIMEOUT = 30000; // 30 seconds

function fetchWithTimeout(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  return fetch(url, { ...options, signal: controller.signal })
    .then((res) => {
      clearTimeout(timeoutId);
      return res;
    })
    .catch((err) => {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        throw new Error(`Request timed out after ${FETCH_TIMEOUT}ms`);
      }
      throw err;
    });
}

export function useChatGPTAuth(options: UseChatGPTAuthOptions = {}): ChatGPTAuth {
  const basePath = options.basePath ?? "/api/chatgpt";
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<Error | undefined>();

  const apply = useCallback((s: Session | null) => {
    setSession(s);
    setStatus(s ? "connected" : "idle");
    setError(undefined);
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    fetchWithTimeout(`${basePath}/session`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => active && apply(s as Session | null))
      .catch((err) => {
        if (active && err.name !== "AbortError") {
          apply(null);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [basePath, apply]);

  const login = useCallback(() => {
    if (status === "connecting") return;

    setStatus("connecting");
    setError(undefined);

    fetchWithTimeout(`${basePath}/login`, { method: "POST" })
      .then((r) => {
        if (!r.ok) throw new Error(`Login failed: ${r.status}`);
        return r.json();
      })
      .then((s) => apply(s as Session))
      .catch((e) => {
        setStatus("error");
        setError(e instanceof Error ? e : new Error(String(e)));
      });
  }, [basePath, apply, status]);

  const logout = useCallback(() => {
    setStatus("idle");
    fetchWithTimeout(`${basePath}/logout`, { method: "POST" })
      .catch((err) => {
        console.error("Logout failed:", err);
      })
      .finally(() => apply(null));
  }, [basePath, apply]);

  return { status, account: session?.account, plan: session?.plan, error, login, logout };
}
