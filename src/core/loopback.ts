import { createServer } from "node:http";
import { config } from "./config";

const page = (body: string) =>
  `<!doctype html><html><head><meta charset="utf-8"><title>Login with ChatGPT</title>
   <style>body{font:16px -apple-system,system-ui,sans-serif;display:grid;place-items:center;height:100vh;margin:0;background:#0a0a0a;color:#fafafa}
   .card{text-align:center;max-width:420px;padding:2rem}h1{font-size:1.4rem}p{color:#a1a1aa}</style></head>
   <body><div class="card">${body}</div></body></html>`;

/**
 * One-shot loopback server on 127.0.0.1:PORT. Resolves with the auth `code` once the
 * browser redirect lands on /auth/callback. Validates `state` (anti-CSRF).
 */
export function waitForCode(expectedState: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url ?? "/", `http://127.0.0.1:${config.port}`);
      if (url.pathname !== "/auth/callback") {
        res.writeHead(404).end("Not found");
        return;
      }

      const error = url.searchParams.get("error");
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");

      const finish = (status: number, body: string, after: () => void) => {
        res.writeHead(status, { "content-type": "text/html" }).end(body);
        setTimeout(() => (server.close(), after()), 50);
      };

      if (error) {
        finish(400, page(`<h1>❌ Login failed</h1><p>${error}</p>`), () =>
          reject(new Error(`Authorization failed: ${error}`)),
        );
      } else if (!code) {
        finish(400, page(`<h1>❌ No code returned</h1>`), () => reject(new Error("No code in callback")));
      } else if (state !== expectedState) {
        finish(400, page(`<h1>❌ State mismatch</h1>`), () =>
          reject(new Error("State mismatch — possible CSRF")),
        );
      } else {
        finish(
          200,
          page(`<h1>✅ Connected to ChatGPT</h1><p>You can close this tab and return to your terminal.</p>`),
          () => resolve(code),
        );
      }
    });

    server.on("error", reject);
    server.listen(config.port, "127.0.0.1");

    setTimeout(() => {
      server.close();
      reject(new Error("Login timed out after 5 minutes"));
    }, 5 * 60_000);
  });
}
