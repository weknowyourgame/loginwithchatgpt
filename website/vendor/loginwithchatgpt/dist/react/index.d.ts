import { S as Session } from '../auth-ezoYH4Jo.js';
import * as react from 'react';

type AuthStatus = "idle" | "connecting" | "connected" | "error";
interface UseChatGPTAuthOptions {
    /** Base path of the @next route handlers. Defaults to "/api/chatgpt". */
    basePath?: string;
}
interface ChatGPTAuth {
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
declare function useChatGPTAuth(options?: UseChatGPTAuthOptions): ChatGPTAuth;

interface LoginWithChatGPTProps extends UseChatGPTAuthOptions {
    onConnected?: (session: Pick<Session, "account" | "plan">) => void;
    className?: string;
}
/** Drop-in button: handles the full login/logout flow via the auth hook. */
declare function LoginWithChatGPT({ onConnected, className, ...options }: LoginWithChatGPTProps): react.JSX.Element;

export { type AuthStatus, type ChatGPTAuth, LoginWithChatGPT, type LoginWithChatGPTProps, type UseChatGPTAuthOptions, useChatGPTAuth };
