import { getSession, login, logout, type LoginOptions, type TokenStore } from "../core/index";

export interface NextHandlerOptions {
  store?: TokenStore;
  /** Forwarded to the engine's login() (e.g. onUrl, openBrowser). */
  loginOptions?: Omit<LoginOptions, "store">;
}

const json = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });

/** Last path segment selects the action: /api/chatgpt/<action>. */
const action = (req: Request) => new URL(req.url).pathname.split("/").filter(Boolean).pop() ?? "";

/**
 * Next App Router handlers backing the @react hook. Mount under a catch-all route:
 *
 *   // app/api/chatgpt/[...lwc]/route.ts
 *   import { createHandlers } from "loginwithchatgpt/next";
 *   export const { GET, POST } = createHandlers();
 *
 * Local-first only: login() runs the loopback flow on the same machine as the server.
 */
export function createHandlers(options: NextHandlerOptions = {}) {
  const { store } = options;

  async function GET(req: Request): Promise<Response> {
    if (action(req) === "session") return json(await getSession(store));
    return json({ error: "Not found" }, { status: 404 });
  }

  async function POST(req: Request): Promise<Response> {
    switch (action(req)) {
      case "login":
        try {
          return json(await login({ ...options.loginOptions, store }));
        } catch (e) {
          return json({ error: e instanceof Error ? e.message : "Login failed" }, { status: 500 });
        }
      case "logout":
        await logout(store);
        return json({ ok: true });
      default:
        return json({ error: "Not found" }, { status: 404 });
    }
  }

  return { GET, POST };
}
