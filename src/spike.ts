// CLI exercising the core engine: login / whoami / call / refresh / logout.
import {
  createClient,
  getSession,
  login,
  logout,
  refresh,
} from "./core/index.ts";

const log = (...a: unknown[]) => console.log(...a);

async function loginCmd() {
  const session = await login({
    onUrl: (url) => {
      log("\n🔐  Opening ChatGPT login in your browser…");
      log("    If it doesn't open, paste this URL:\n");
      log(`    ${url}\n`);
    },
  });
  log("🎉  Connected!");
  log(`    account : ${session.account.email ?? session.account.id ?? "(unknown)"}`);
  log(`    plan    : ${session.plan.name ?? "(unknown)"}\n`);
}

async function whoamiCmd() {
  const session = await getSession();
  if (!session) return log("Not logged in. Run `bun run login`.");
  log(`account : ${session.account.email ?? session.account.id ?? "(unknown)"}`);
  log(`plan    : ${session.plan.name ?? "(unknown)"}`);
  log(`status  : ${session.status}`);
}

async function callCmd() {
  const prompt = process.argv.slice(3).join(" ") || "Say hello in one short sentence.";
  log(`\n💬  Prompt: ${prompt}\n`);
  const out = await createClient().respond(prompt);
  log("📦  Raw response:\n");
  log(out);
  log("");
}

async function refreshCmd() {
  log("🔄  Refreshing…");
  const session = await refresh();
  log(`✅  Refreshed. status: ${session.status}`);
}

async function logoutCmd() {
  await logout();
  log("👋  Logged out, tokens cleared.");
}

const commands: Record<string, () => Promise<void>> = {
  login: loginCmd,
  whoami: whoamiCmd,
  call: callCmd,
  refresh: refreshCmd,
  logout: logoutCmd,
};

const cmd = process.argv[2] ?? "login";
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
