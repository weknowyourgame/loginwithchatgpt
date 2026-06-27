// CLI exercising the core engine: login / whoami / call / refresh / logout.
import {
  createClient,
  getSession,
  login,
  logout,
  refresh,
  startDeviceLogin,
  startLogin,
} from "./core/index";

const log = (...a: unknown[]) => console.log(...a);

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.resume();
    process.stdin.once("data", (d: Buffer) => {
      process.stdin.pause();
      resolve(d.toString().trim());
    });
  });
}

function printConnected(session: { account: { email?: string; id?: string }; plan: { name?: string } }) {
  log("🎉  Connected!");
  log(`    account : ${session.account.email ?? session.account.id ?? "(unknown)"}`);
  log(`    plan    : ${session.plan.name ?? "(unknown)"}\n`);
}

async function loginCmd() {
  // Device code: show a code, user enters it on an OpenAI page, we poll (web/headless).
  if (process.argv.includes("--device")) {
    const flow = await startDeviceLogin();
    log("\n🔐  Open this page and enter the code:\n");
    log(`    ${flow.verificationUrl}`);
    log(`    code: ${flow.userCode}\n`);
    log("    First time? Enable device code authorization in ChatGPT →");
    log("    Settings → Security & Login.\n");
    log("    Waiting for authorization…");
    printConnected(await flow.wait());
    return;
  }

  // Headless: print the URL, let the user paste the code back (SSH/containers/CI).
  if (process.argv.includes("--headless")) {
    const flow = startLogin();
    log("\n🔐  Open this URL in any browser and approve:\n");
    log(`    ${flow.url}\n`);
    log("    Then copy the code from the redirected address bar (or the whole URL).");
    log("    Codes expire in ~1 minute, so paste it promptly.");
    const pasted = await ask("\nPaste code/URL: ");
    try {
      printConnected(await flow.complete(pasted));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/invalid_grant|expired|400/.test(msg)) {
        throw new Error("Code was rejected — it likely expired or was already used. Re-run `bun run login --headless` and paste quickly.");
      }
      throw err;
    }
    return;
  }

  const session = await login({
    onUrl: (url) => {
      log("\n🔐  Opening ChatGPT login in your browser…");
      log("    If it doesn't open, paste this URL:\n");
      log(`    ${url}\n`);
    },
  });
  printConnected(session);
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
  log(out);
  log("");
}

async function streamCmd() {
  const prompt = process.argv.slice(3).join(" ") || "Count to five.";
  log(`\n💬  Prompt: ${prompt}\n`);
  for await (const delta of createClient().stream(prompt)) {
    process.stdout.write(delta);
  }
  log("\n");
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
  stream: streamCmd,
  refresh: refreshCmd,
  logout: logoutCmd,
};

const cmd = process.argv[2] ?? "login";
const run = commands[cmd];
if (!run) {
  log(`Unknown command: ${cmd}`);
  log("Usage: bun run [login|whoami|call|stream|refresh|logout]");
  process.exit(1);
}
run().catch((err) => {
  console.error(`\n❌  ${err instanceof Error ? err.message : err}\n`);
  process.exit(1);
});
