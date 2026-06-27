import { a as TokenStore, L as LoginOptions } from '../auth-ezoYH4Jo.js';

interface NextHandlerOptions {
    store?: TokenStore;
    /** Forwarded to the engine's login() (e.g. onUrl, openBrowser). */
    loginOptions?: Omit<LoginOptions, "store">;
}
/**
 * Next App Router handlers backing the @react hook. Mount under a catch-all route:
 *
 *   // app/api/chatgpt/[...lwc]/route.ts
 *   import { createHandlers } from "loginwithchatgpt/next";
 *   export const { GET, POST } = createHandlers();
 *
 * Local-first only: login() runs the loopback flow on the same machine as the server.
 */
declare function createHandlers(options?: NextHandlerOptions): {
    GET: (req: Request) => Promise<Response>;
    POST: (req: Request) => Promise<Response>;
};

export { type NextHandlerOptions, createHandlers };
