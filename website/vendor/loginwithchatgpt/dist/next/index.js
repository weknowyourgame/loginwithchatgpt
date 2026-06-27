import {
  getSession,
  login,
  logout
} from "../chunk-JZKVSGGL.js";

// src/next/handlers.ts
var json = (data, init) => new Response(JSON.stringify(data), {
  ...init,
  headers: { "content-type": "application/json", ...init?.headers }
});
var action = (req) => new URL(req.url).pathname.split("/").filter(Boolean).pop() ?? "";
function createHandlers(options = {}) {
  const { store } = options;
  async function GET(req) {
    if (action(req) === "session") return json(await getSession(store));
    return json({ error: "Not found" }, { status: 404 });
  }
  async function POST(req) {
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
export {
  createHandlers
};
