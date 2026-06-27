import { createHandlers } from "loginwithchatgpt/next";

export const runtime = "nodejs";

// Serves /api/chatgpt/login, /session, /logout for the <LoginWithChatGPT /> hook.
export const { GET, POST } = createHandlers();
