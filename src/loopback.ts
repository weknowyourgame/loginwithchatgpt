import { config } from "./config.ts";

const page = (title: string, body: string) =>
  new Response(
    `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
     <style>body{font:16px -apple-system,system-ui,sans-serif;display:grid;place-items:center;height:100vh;margin:0;background:#0a0a0a;color:#fafafa}
     .card{text-align:center;max-width:420px;padding:2rem}h1{font-size:1.4rem}p{color:#a1a1aa}</style></head>
     <body><div class="card">${body}</div></body></html>`,
    { headers: { "content-type": "text/html" } },
  );

/**
 * Spin a one-shot loopback server on 127.0.0.1:PORT and resolve with the auth `code`
 * once the browser redirect lands on /auth/callback. Validates `state` (anti-CSRF).
 */
export function waitForCode(expectedState: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = Bun.serve({
      port: config.port,
      hostname: "127.0.0.1",
      fetch(req) {
        const url = new URL(req.url);
        if (url.pathname !== "/auth/callback") {
          return new Response("Not found", { status: 404 });
        }

        const error = url.searchParams.get("error");
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const done = (cb: () => void) => setTimeout(() => (server.stop(), cb()), 50);

        if (error) {
          done(() => reject(new Error(`Authorization failed: ${error}`)));
          return page("Failed", `<h1>❌ Login failed</h1><p>${error}</p>`);
        }
        if (!code) {
          done(() => reject(new Error("No code in callback")));
          return page("Failed", `<h1>❌ No code returned</h1>`);
        }
        if (state !== expectedState) {
          done(() => reject(new Error("State mismatch — possible CSRF")));
          return page("Failed", `<h1>❌ State mismatch</h1>`);
        }

        done(() => resolve(code));
        return page(
          "Connected",
          `<h1>✅ Connected to ChatGPT</h1><p>You can close this tab and return to your terminal.</p>`,
        );
      },
    });

    // Safety timeout so a never-completed login doesn't hang forever.
    setTimeout(() => {
      server.stop();
      reject(new Error("Login timed out after 5 minutes"));
    }, 5 * 60_000);
  });
}
