# loginwithchatgpt

A drop-in "Login with ChatGPT" button that lets your app's users power its AI features with
their own ChatGPT subscription. The user signs in with their ChatGPT account, and your AI
calls bill against their Plus/Pro plan instead of an API key you pay for.

It uses OpenAI's Codex OAuth flow (PKCE against `auth.openai.com`) - the same mechanism the  
Codex CLI uses. One package, three entry points: a headless engine, a React component, and  
Next.js route handlers.

## Scope

This is strictly "let your users bring their own ChatGPT subscription into your app." Each  
user logs in with their own account, on their own machine, and spends their own subscription.  
It is built for local-first contexts desktop apps, Electron, CLIs, and local-first Next.js  
dev tools where the loopback OAuth redirect lands on the user's own machine.

It is not a way to pool or resell subscriptions through a central server. That is
account-sharing and will get the access revoked.

## Install

```bash
bun add loginwithchatgpt
```

`react` is an optional peer dependency - you only need it if you use the React entry point.

## Quickstart (Next.js, App Router)

Two files. First, mount the route handlers under a catch-all route:

```ts
// app/api/chatgpt/[...lwc]/route.ts
import { createHandlers } from "loginwithchatgpt/next";

export const runtime = "nodejs";
export const { GET, POST } = createHandlers();
```

Then drop the button anywhere in your UI:

```tsx
"use client";
import { LoginWithChatGPT } from "loginwithchatgpt/react";

export default function Page() {
  return <LoginWithChatGPT onConnected={(s) => console.log(s.account.email)} />;
}
```

Once a user is connected, make AI calls that bill their subscription from any server route:

```ts
// app/api/chat/route.ts
import { createClient } from "loginwithchatgpt";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { prompt } = await req.json();
  const text = await createClient().respond(prompt);
  return Response.json({ text });
}
```

## React API

```ts
import { LoginWithChatGPT, useChatGPTAuth } from "loginwithchatgpt/react";
```

`<LoginWithChatGPT />`


| Prop          | Type                | Description                                          |
| ------------- | ------------------- | ---------------------------------------------------- |
| `onConnected` | `(session) => void` | Called once when the user connects.                  |
| `basePath`    | `string`            | Route handler base path. Defaults to `/api/chatgpt`. |
| `className`   | `string`            | Applied to the button.                               |


`useChatGPTAuth(options?)` returns `{ status, account, plan, error, login, logout }`, where
`status` is one of `idle`, `connecting`, `connected`, or `error`. Use it directly if you want
to build your own button.

## Core API

```ts
import { login, logout, getSession, refresh, createClient } from "loginwithchatgpt";
```


| Function               | Description                                                          |
| ---------------------- | -------------------------------------------------------------------- |
| `login(options?)`      | Runs the loopback OAuth flow and stores tokens. Returns the session. |
| `startLogin(options?)` | Headless variant for SSH/containers/CI. Returns `{ url, complete }`.  |
| `startDeviceLogin(options?)` | Device-code flow for web/headless. Returns `{ userCode, verificationUrl, wait }`. |
| `logout(store?)`       | Clears stored tokens.                                                |
| `getSession(store?)`   | Returns the current session, or `null`.                              |
| `refresh(store?)`      | Forces a token refresh.                                              |
| `createClient(store?)` | Returns a client with `respond(prompt)` and `stream(prompt)`.        |


The client auto-refreshes tokens before expiry and retries once on a 401, so callers never
handle tokens directly.

## How it works

```
<LoginWithChatGPT />  ->  /api/chatgpt/*  ->  createHandlers (next)  ->  core engine
   browser (UI)            HTTP                server (Node)            PKCE + loopback
```

1. The button calls the route handler, which runs `login()` on the server.
2. `login()` generates a PKCE pair, opens `auth.openai.com`, and starts a one-shot loopback
  server on `127.0.0.1:1455` to catch the redirect.
3. The returned code is exchanged for tokens, which are stored encrypted.
4. `createClient()` attaches the access token to requests and refreshes it as needed.

## Token storage

Tokens are stored encrypted at rest (AES-256-GCM). The encryption key is kept in the macOS
Keychain where available, with a `0600` key-file fallback on other platforms. Storage is
pluggable through the `TokenStore` interface, so you can supply your own backend:

```ts
import { createClient, type TokenStore } from "loginwithchatgpt";

const myStore: TokenStore = { load, save, clear };
const client = createClient(myStore);
```

The default is `encryptedFileStore`; a plaintext `fileStore` is also exported for debugging.

## Package exports


| Entry                    | Runtime | Contents                                              |
| ------------------------ | ------- | ----------------------------------------------------- |
| `loginwithchatgpt`       | Node    | engine: `login`, `getSession`, `createClient`, stores |
| `loginwithchatgpt/react` | Browser | `LoginWithChatGPT`, `useChatGPTAuth`                  |
| `loginwithchatgpt/next`  | Node    | `createHandlers` for App Router                       |


## Example

A runnable Next.js demo lives in `examples/web`:

```bash
cd examples/web
bun install
bun run dev
```

## CLI

The repo includes a small CLI that exercises the engine directly:

```bash
bun run login     # run the OAuth flow and store tokens
bun run login --device     # device-code flow (shows a code, works in web/headless)
bun run login --headless   # paste-the-code flow for SSH/containers/CI
bun run whoami    # show the connected account and plan
bun run call      # one AI call billed to the subscription
bun run stream    # the same call, streamed
bun run refresh   # force a token refresh
bun run logout    # clear stored tokens
```

## Status

The auth flow (login, token storage, refresh) is implemented and working. The AI call path
targets the Codex `/responses` endpoint and requires an account with Codex access
(ChatGPT Plus or Pro); free accounts can authenticate but cannot make billed calls.

The client config (client id, endpoints) tracks OpenAI's public Codex client and may need
updating if OpenAI rotates it; it is isolated in a single file.

## Repository

[github.com/weknowyourgame/loginwithchatgpt](https://github.com/weknowyourgame/loginwithchatgpt)

## License

MIT