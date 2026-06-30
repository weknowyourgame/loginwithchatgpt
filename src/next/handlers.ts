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
let loginInProgress: Promise<unknown> | null = null;

export function createHandlers(options: NextHandlerOptions = {}) {
  const { store } = options;

  async function GET(req: Request): Promise<Response> {
    try {
      switch (action(req)) {
        case "session":
          return json(await getSession(store));
        default:
          return json({ error: "Not found" }, { status: 404 });
      }
    } catch (err) {
      console.error("GET handler error:", err);
      return json(
        { error: err instanceof Error ? err.message : "Internal server error" },
        { status: 500 }
      );
    }
  }

  async function POST(req: Request): Promise<Response> {
    try {
      switch (action(req)) {
        case "login":
          if (loginInProgress) {
            return json(
              { error: "Login already in progress" },
              { status: 409 }
            );
          }

          loginInProgress = (async () => {
            try {
              return await login({ ...options.loginOptions, store });
            } finally {
              loginInProgress = null;
            }
          })();

          const result = await loginInProgress;
          return json(result);

        case "logout":
          try {
            await logout(store);
            return json({ ok: true });
          } catch (err) {
            console.error("Logout error:", err);
            return json({ ok: false }, { status: 500 });
          }

        default:
          return json({ error: "Not found" }, { status: 404 });
      }
    } catch (err) {
      console.error("POST handler error:", err);
      return json(
        { error: err instanceof Error ? err.message : "Internal server error" },
        { status: 500 }
      );
    }
  }

  return { GET, POST };
}
