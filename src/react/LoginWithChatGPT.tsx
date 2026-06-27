import { useEffect, useRef } from "react";
import type { Session } from "../core/index";
import { useChatGPTAuth, type UseChatGPTAuthOptions } from "./useChatGPTAuth";

export interface LoginWithChatGPTProps extends UseChatGPTAuthOptions {
  onConnected?: (session: Pick<Session, "account" | "plan">) => void;
  className?: string;
}

/** Drop-in button: handles the full login/logout flow via the auth hook. */
export function LoginWithChatGPT({ onConnected, className, ...options }: LoginWithChatGPTProps) {
  const { status, account, plan, login, logout } = useChatGPTAuth(options);
  const notified = useRef(false);

  useEffect(() => {
    if (status === "connected" && account && !notified.current) {
      notified.current = true;
      onConnected?.({ account, plan: plan ?? {} });
    }
    if (status !== "connected") notified.current = false;
  }, [status, account, plan, onConnected]);

  if (status === "connected") {
    const label = account?.email ?? account?.id ?? "ChatGPT";
    return (
      <button className={className} onClick={logout}>
        {label} — disconnect
      </button>
    );
  }

  return (
    <button className={className} onClick={login} disabled={status === "connecting"}>
      {status === "connecting" ? "Connecting…" : "Login with ChatGPT"}
    </button>
  );
}
