// src/core/auth.ts
import { spawn } from "child_process";

// src/core/pkce.ts
import { createHash, randomBytes } from "crypto";
var base64url = (buf) => buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
function createPkce() {
  const verifier = base64url(randomBytes(64));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  const state = base64url(randomBytes(32));
  return { verifier, challenge, state };
}

// src/core/loopback.ts
import { createServer } from "http";

// src/core/config.ts
var config = {
  clientId: "app_EMoamEEZ73f0CkXaXp7hrann",
  authorizeUrl: "https://auth.openai.com/oauth/authorize",
  tokenUrl: "https://auth.openai.com/oauth/token",
  // Loopback callback. Must match what's registered for the Codex client.
  port: 1455,
  redirectUri: "http://localhost:1455/auth/callback",
  scopes: ["openid", "profile", "email", "offline_access"],
  // The ChatGPT backend that bills the user's subscription.
  responsesUrl: "https://chatgpt.com/backend-api/codex/responses",
  // Codex-scoped: ChatGPT-account tokens only accept Codex models, not general chat models.
  defaultModel: "gpt-5.5",
  // Device-code flow (headless / web, no loopback). Requires the user to enable device
  // code authorization in ChatGPT Settings -> Security & Login.
  deviceUserCodeUrl: "https://auth.openai.com/api/accounts/deviceauth/usercode",
  devicePollUrl: "https://auth.openai.com/api/accounts/deviceauth/token",
  deviceVerificationUrl: "https://auth.openai.com/codex/device",
  deviceRedirectUri: "https://auth.openai.com/deviceauth/callback"
};

// src/core/loopback.ts
var page = (body) => `<!doctype html><html><head><meta charset="utf-8"><title>Login with ChatGPT</title>
   <style>body{font:16px -apple-system,system-ui,sans-serif;display:grid;place-items:center;height:100vh;margin:0;background:#0a0a0a;color:#fafafa}
   .card{text-align:center;max-width:420px;padding:2rem}h1{font-size:1.4rem}p{color:#a1a1aa}</style></head>
   <body><div class="card">${body}</div></body></html>`;
function waitForCode(expectedState) {
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
      const finish = (status, body, after) => {
        res.writeHead(status, { "content-type": "text/html" }).end(body);
        setTimeout(() => (server.close(), after()), 50);
      };
      if (error) {
        finish(
          400,
          page(`<h1>\u274C Login failed</h1><p>${error}</p>`),
          () => reject(new Error(`Authorization failed: ${error}`))
        );
      } else if (!code) {
        finish(400, page(`<h1>\u274C No code returned</h1>`), () => reject(new Error("No code in callback")));
      } else if (state !== expectedState) {
        finish(
          400,
          page(`<h1>\u274C State mismatch</h1>`),
          () => reject(new Error("State mismatch \u2014 possible CSRF"))
        );
      } else {
        finish(
          200,
          page(`<h1>\u2705 Connected to ChatGPT</h1><p>You can close this tab and return to your terminal.</p>`),
          () => resolve(code)
        );
      }
    });
    server.on("error", reject);
    server.listen(config.port, "127.0.0.1");
    setTimeout(() => {
      server.close();
      reject(new Error("Login timed out after 5 minutes"));
    }, 5 * 6e4);
  });
}

// src/core/tokens.ts
function authorizeUrl(pkce) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(" "),
    code_challenge: pkce.challenge,
    code_challenge_method: "S256",
    id_token_add_organizations: "true",
    codex_cli_simplified_flow: "true",
    state: pkce.state
  });
  return `${config.authorizeUrl}?${params.toString()}`;
}
var withExpiry = (raw) => ({
  access_token: raw.access_token,
  refresh_token: raw.refresh_token,
  id_token: raw.id_token,
  token_type: raw.token_type ?? "Bearer",
  // Renew a minute early to avoid edge-of-expiry races.
  expires_at: Date.now() + (raw.expires_in - 60) * 1e3
});
async function exchangeCode(code, verifier, redirectUri = config.redirectUri) {
  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: config.clientId,
      code_verifier: verifier
    })
  });
  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  }
  return withExpiry(await res.json());
}
async function refreshTokens(refreshToken) {
  const res = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: config.clientId,
      scope: config.scopes.join(" ")
    })
  });
  if (!res.ok) {
    throw new Error(`Refresh failed: ${res.status} ${await res.text()}`);
  }
  const next = withExpiry(await res.json());
  if (!next.refresh_token) next.refresh_token = refreshToken;
  return next;
}
function decodeJwt(token) {
  if (!token) return null;
  const part = token.split(".")[1];
  if (!part) return null;
  try {
    return JSON.parse(Buffer.from(part, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}
function accountInfo(tokens) {
  const claims = decodeJwt(tokens.id_token) ?? decodeJwt(tokens.access_token) ?? {};
  const auth = claims["https://api.openai.com/auth"] ?? {};
  return {
    accountId: auth["chatgpt_account_id"],
    plan: auth["chatgpt_plan_type"],
    email: claims["email"]
  };
}

// src/core/store.ts
import { homedir as homedir2 } from "os";
import { join as join2 } from "path";
import { mkdir as mkdir2, readFile as readFile2, rm, writeFile as writeFile2 } from "fs/promises";

// src/core/crypto.ts
import { createCipheriv, createDecipheriv, randomBytes as randomBytes2 } from "crypto";
import { execFile } from "child_process";
import { chmod, mkdir, readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import { dirname, join } from "path";
import { promisify } from "util";
var run = promisify(execFile);
var SERVICE = "loginwithchatgpt";
var ACCOUNT = "token-key";
var keyFile = join(homedir(), ".loginwithchatgpt", "key");
async function keychainGet() {
  try {
    const { stdout } = await run("security", ["find-generic-password", "-a", ACCOUNT, "-s", SERVICE, "-w"]);
    return stdout.trim() ? Buffer.from(stdout.trim(), "base64") : null;
  } catch {
    return null;
  }
}
async function keychainSet(key) {
  try {
    await run("security", ["add-generic-password", "-a", ACCOUNT, "-s", SERVICE, "-w", key.toString("base64"), "-U"]);
    return true;
  } catch {
    return false;
  }
}
async function fileGet() {
  try {
    const b64 = (await readFile(keyFile, "utf8")).trim();
    return b64 ? Buffer.from(b64, "base64") : null;
  } catch {
    return null;
  }
}
async function fileSet(key) {
  await mkdir(dirname(keyFile), { recursive: true });
  await writeFile(keyFile, key.toString("base64"));
  await chmod(keyFile, 384);
}
var cached = null;
async function getKey() {
  if (cached) return cached;
  const darwin = process.platform === "darwin";
  let key = darwin ? await keychainGet() : await fileGet();
  if (!key) {
    key = randomBytes2(32);
    const stored = darwin ? await keychainSet(key) : false;
    if (!stored) await fileSet(key);
  }
  cached = key;
  return key;
}
async function encrypt(plaintext) {
  const iv = randomBytes2(12);
  const cipher = createCipheriv("aes-256-gcm", await getKey(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), ct].map((b) => b.toString("base64")).join(".");
}
async function decrypt(payload) {
  const [iv, tag, ct] = payload.split(".");
  if (!iv || !tag || !ct) throw new Error("Malformed encrypted payload");
  const decipher = createDecipheriv("aes-256-gcm", await getKey(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(ct, "base64")), decipher.final()]).toString("utf8");
}

// src/core/store.ts
var dir = join2(homedir2(), ".loginwithchatgpt");
var file = join2(dir, "tokens.json");
var encFile = join2(dir, "tokens.enc");
var read = async (path) => {
  try {
    return await readFile2(path, "utf8");
  } catch {
    return null;
  }
};
var fileStore = {
  async load() {
    const raw = await read(file);
    return raw ? JSON.parse(raw) : null;
  },
  async save(tokens) {
    await mkdir2(dir, { recursive: true });
    await writeFile2(file, JSON.stringify(tokens, null, 2));
  },
  async clear() {
    await rm(file, { force: true });
  }
};
var encryptedFileStore = {
  async load() {
    const payload = (await read(encFile))?.trim();
    if (!payload) return null;
    try {
      return JSON.parse(await decrypt(payload));
    } catch {
      return null;
    }
  },
  async save(tokens) {
    await mkdir2(dir, { recursive: true });
    await writeFile2(encFile, await encrypt(JSON.stringify(tokens)));
  },
  async clear() {
    await rm(encFile, { force: true });
  }
};
var defaultStore = encryptedFileStore;

// src/core/auth.ts
function toSession(tokens) {
  const info = accountInfo(tokens);
  return {
    account: { email: info.email, id: info.accountId },
    plan: { name: info.plan },
    status: "connected"
  };
}
function openSystemBrowser(url) {
  const [cmd, ...args] = process.platform === "darwin" ? ["open", url] : process.platform === "win32" ? ["cmd", "/c", "start", "", url] : ["xdg-open", url];
  try {
    spawn(cmd, args, { stdio: "ignore", detached: true }).unref();
  } catch {
  }
}
async function login(opts = {}) {
  const store = opts.store ?? defaultStore;
  const pkce = createPkce();
  const url = authorizeUrl(pkce);
  const codePromise = waitForCode(pkce.state);
  opts.onUrl?.(url);
  if (opts.openBrowser !== false) await openSystemBrowser(url);
  const code = await codePromise;
  const tokens = await exchangeCode(code, pkce.verifier);
  await store.save(tokens);
  return toSession(tokens);
}
function extractCode(input, expectedState) {
  const trimmed = input.trim();
  if (!trimmed.includes("://") && !trimmed.includes("?")) return trimmed;
  const url = new URL(trimmed);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code) throw new Error("No code found in the pasted URL");
  if (state && state !== expectedState) throw new Error("State mismatch \u2014 possible CSRF");
  return code;
}
function startLogin(opts = {}) {
  const store = opts.store ?? defaultStore;
  const pkce = createPkce();
  return {
    url: authorizeUrl(pkce),
    async complete(codeOrUrl) {
      const tokens = await exchangeCode(extractCode(codeOrUrl, pkce.state), pkce.verifier);
      await store.save(tokens);
      return toSession(tokens);
    }
  };
}
async function getSession(store = defaultStore) {
  const tokens = await store.load();
  return tokens ? toSession(tokens) : null;
}
async function logout(store = defaultStore) {
  await store.clear();
}
async function refresh(store = defaultStore) {
  const tokens = await store.load();
  if (!tokens) throw new Error("Not authenticated.");
  const next = await refreshTokens(tokens.refresh_token);
  await store.save(next);
  return toSession(next);
}

// src/core/device.ts
var headers = {
  "content-type": "application/json",
  accept: "application/json",
  "user-agent": "loginwithchatgpt"
};
async function deviceStart() {
  const res = await fetch(config.deviceUserCodeUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ client_id: config.clientId })
  });
  if (!res.ok) {
    throw new Error(`Device auth start failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return {
    deviceAuthId: data.device_auth_id,
    userCode: data.user_code ?? data.usercode ?? "",
    verificationUrl: config.deviceVerificationUrl,
    interval: (data.interval ?? 5) * 1e3
  };
}
async function devicePoll(deviceAuthId, userCode) {
  const poll = await fetch(config.devicePollUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ device_auth_id: deviceAuthId, user_code: userCode })
  });
  if (poll.status === 403 || poll.status === 404) {
    return { status: "pending" };
  }
  if (!poll.ok) {
    throw new Error(`Device auth poll failed: ${poll.status} ${await poll.text()}`);
  }
  const success = await poll.json();
  const tokens = await exchangeCode(
    success.authorization_code,
    success.code_verifier,
    config.deviceRedirectUri
  );
  return { status: "complete", tokens };
}
async function startDeviceLogin(opts = {}) {
  const store = opts.store ?? defaultStore;
  const res = await fetch(config.deviceUserCodeUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ client_id: config.clientId })
  });
  if (!res.ok) {
    throw new Error(`Device auth start failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  const userCode = data.user_code ?? data.usercode ?? "";
  const deviceAuthId = data.device_auth_id;
  const interval = (data.interval ?? 5) * 1e3;
  return {
    userCode,
    verificationUrl: config.deviceVerificationUrl,
    async wait() {
      const deadline = Date.now() + 15 * 6e4;
      while (Date.now() < deadline) {
        const poll = await fetch(config.devicePollUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({ device_auth_id: deviceAuthId, user_code: userCode })
        });
        if (poll.status === 403 || poll.status === 404) {
          await new Promise((r) => setTimeout(r, interval));
          continue;
        }
        if (!poll.ok) {
          throw new Error(`Device auth poll failed: ${poll.status} ${await poll.text()}`);
        }
        const success = await poll.json();
        const tokens = await exchangeCode(
          success.authorization_code,
          success.code_verifier,
          config.deviceRedirectUri
        );
        await store.save(tokens);
        return toSession(tokens);
      }
      throw new Error("Device authorization timed out.");
    }
  };
}

// src/core/client.ts
async function* parseSse(res) {
  const reader = res.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let sep;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const event = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      for (const line of event.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") return;
        try {
          const evt = JSON.parse(data);
          if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
            yield evt.delta;
          }
        } catch {
        }
      }
    }
  }
}
function createClient(store = defaultStore) {
  async function freshTokens() {
    let tokens = await store.load();
    if (!tokens) throw new Error("Not authenticated.");
    if (Date.now() >= tokens.expires_at) {
      tokens = await refreshTokens(tokens.refresh_token);
      await store.save(tokens);
    }
    return tokens;
  }
  async function send(input, opts) {
    let tokens = await freshTokens();
    const { accountId } = accountInfo(tokens);
    const body = JSON.stringify({
      model: opts.model ?? config.defaultModel,
      instructions: opts.instructions ?? "You are a helpful assistant.",
      input: [{ role: "user", content: [{ type: "input_text", text: input }] }],
      stream: true,
      store: false
    });
    const post = (accessToken) => fetch(config.responsesUrl, {
      method: "POST",
      signal: opts.signal,
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
        ...accountId ? { "chatgpt-account-id": accountId } : {},
        "openai-beta": "responses=experimental",
        originator: "codex_cli_rs"
      },
      body
    });
    let res = await post(tokens.access_token);
    if (res.status === 401) {
      tokens = await refreshTokens(tokens.refresh_token);
      await store.save(tokens);
      res = await post(tokens.access_token);
    }
    if (!res.ok) {
      throw new Error(`Call failed: ${res.status} ${await res.text()}`);
    }
    return res;
  }
  async function respond(input, opts = {}) {
    const parts = [];
    for await (const delta of stream(input, opts)) {
      parts.push(delta);
    }
    return parts.join("");
  }
  async function* stream(input, opts = {}) {
    const res = await send(input, opts);
    yield* parseSse(res);
  }
  return { respond, stream };
}

export {
  accountInfo,
  fileStore,
  encryptedFileStore,
  defaultStore,
  login,
  startLogin,
  getSession,
  logout,
  refresh,
  deviceStart,
  devicePoll,
  startDeviceLogin,
  createClient
};
