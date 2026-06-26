/**
 * Phase 0 feasibility spike — runnable.
 *
 *   bun run login     → full loopback OAuth, store tokens
 *   bun run whoami    → show connected account + plan
 *   bun run call      → make one AI call billed to the subscription
 *   bun run refresh   → force a token refresh
 *   bun run logout    → clear stored tokens
 *
 * Proves the Phase 0 gate: token mints, call bills the sub, refresh works.
 */
import { createClient } from "./client.ts";
import { createPkce } from "./pkce.ts";
import { fileStore } from "./store.ts";
import { accountInfo, authorizeUrl, exchangeCode, refreshTokens } from "./tokens.ts";
import { waitForCode } from "./loopback.ts";

const log = (...a: unknown[]) => console.log(...a);

async function openBrowser(url: string) {
  const cmd =
    process.platform === "darwin" ? ["open", url]
    : process.platform === "win32" ? ["cmd", "/c", "start", "", url]
    : ["xdg-open", url];
  try {
    await Bun.spawn(cmd).exited;
  } catch {
    /* fall back to manual */
  }
}

async function login() {
  const pkce = createPkce();
  const url = authorizeUrl(pkce);

  log("\n🔐  Opening ChatGPT login in your browser…");
  log("    If it doesn't open, paste this URL:\n");
  log(`    ${url}\n`);

  const codePromise = waitForCode(pkce.state); // start listening BEFORE opening browser
  await openBrowser(url);
  const code = await codePromise;

  log("✅  Got authorization code, exchanging for tokens…");
  const tokens = await exchangeCode(code, pkce.verifier);
  await fileStore.save(tokens);

  const info = accountInfo(tokens);
  log("\n🎉  Connected!");
  log(`    account : ${info.email ?? info.accountId ?? "(unknown)"}`);
  log(`    plan    : ${info.plan ?? "(unknown)"}`);
  log(`    expires : ${new Date(tokens.expires_at).toLocaleString()}\n`);
}

async function whoami() {
  const tokens = await fileStore.load();
  if (!tokens) return log("Not logged in. Run `bun run login`.");
  const info = accountInfo(tokens);
  log(`account : ${info.email ?? info.accountId ?? "(unknown)"}`);
  log(`plan    : ${info.plan ?? "(unknown)"}`);
  log(`expires : ${new Date(tokens.expires_at).toLocaleString()}`);
  log(`valid   : ${Date.now() < tokens.expires_at ? "yes" : "expired"}`);
}

async function call() {
  const prompt = process.argv.slice(3).join(" ") || "Say hello in one short sentence.";
  log(`\n💬  Prompt: ${prompt}\n`);
  const chatgpt = createClient();
  const out = await chatgpt.respond(prompt);
  log("📦  Raw response:\n");
  log(out);
  log("");
}

async function refresh() {
  const tokens = await fileStore.load();
  if (!tokens) return log("Not logged in. Run `bun run login`.");
  log("🔄  Refreshing…");
  const next = await refreshTokens(tokens.refresh_token);
  await fileStore.save(next);
  log(`✅  New access token expires: ${new Date(next.expires_at).toLocaleString()}`);
}

async function logout() {
  await fileStore.clear();
  log("👋  Logged out, tokens cleared.");
}

const cmd = process.argv[2] ?? "login";
const commands: Record<string, () => Promise<void>> = { login, whoami, call, refresh, logout };

const run = commands[cmd];
if (!run) {
  log(`Unknown command: ${cmd}`);
  log("Usage: bun run [login|whoami|call|refresh|logout]");
  process.exit(1);
}
run().catch((err) => {
  console.error(`\n❌  ${err instanceof Error ? err.message : err}\n`);
  process.exit(1);
});
