"use client";

// src/react/useChatGPTAuth.ts
import { useCallback, useEffect, useState } from "react";
function useChatGPTAuth(options = {}) {
  const basePath = options.basePath ?? "/api/chatgpt";
  const [status, setStatus] = useState("idle");
  const [session, setSession] = useState(null);
  const [error, setError] = useState();
  const apply = useCallback((s) => {
    setSession(s);
    setStatus(s ? "connected" : "idle");
  }, []);
  useEffect(() => {
    let active = true;
    fetch(`${basePath}/session`).then((r) => r.ok ? r.json() : null).then((s) => active && apply(s)).catch(() => active && apply(null));
    return () => {
      active = false;
    };
  }, [basePath, apply]);
  const login = useCallback(() => {
    setStatus("connecting");
    setError(void 0);
    fetch(`${basePath}/login`, { method: "POST" }).then((r) => {
      if (!r.ok) throw new Error(`Login failed: ${r.status}`);
      return r.json();
    }).then((s) => apply(s)).catch((e) => {
      setStatus("error");
      setError(e instanceof Error ? e : new Error(String(e)));
    });
  }, [basePath, apply]);
  const logout = useCallback(() => {
    fetch(`${basePath}/logout`, { method: "POST" }).finally(() => apply(null));
  }, [basePath, apply]);
  return { status, account: session?.account, plan: session?.plan, error, login, logout };
}

// src/react/LoginWithChatGPT.tsx
import { useEffect as useEffect2, useRef } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
function LoginWithChatGPT({ onConnected, className, ...options }) {
  const { status, account, plan, login, logout } = useChatGPTAuth(options);
  const notified = useRef(false);
  useEffect2(() => {
    if (status === "connected" && account && !notified.current) {
      notified.current = true;
      onConnected?.({ account, plan: plan ?? {} });
    }
    if (status !== "connected") notified.current = false;
  }, [status, account, plan, onConnected]);
  if (status === "connected") {
    const label = account?.email ?? account?.id ?? "ChatGPT";
    return /* @__PURE__ */ jsxs("button", { className, onClick: logout, children: [
      label,
      " \u2014 disconnect"
    ] });
  }
  return /* @__PURE__ */ jsx("button", { className, onClick: login, disabled: status === "connecting", children: status === "connecting" ? "Connecting\u2026" : "Login with ChatGPT" });
}
export {
  LoginWithChatGPT,
  useChatGPTAuth
};
