import { createHandlers } from "loginwithchatgpt/next";

export const runtime = "nodejs";

// Serves /api/chatgpt/login, /session, /logout for the playground demo.
export const { GET, POST } = createHandlers();
