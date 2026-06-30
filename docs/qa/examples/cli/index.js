import {
  login,
  logout,
  getSession,
  refresh,
  createClient,
  fileStore,
  encryptedFileStore,
} from "loginwithchatgpt";

async function cmd_login() {
  try {
    console.log("🔐 Starting login...");
    const session = await login();
    console.log("✅ Login successful!");
    console.log(`   Account: ${session.account.email}`);
    console.log(`   Plan: ${session.plan.name}`);
  } catch (e) {
    console.error("❌ Login failed:", e.message);
    process.exit(1);
  }
}

async function cmd_whoami() {
  try {
    const session = await getSession();
    if (!session) {
      console.log("❌ Not authenticated. Run: npm run login");
      process.exit(1);
    }
    console.log("✅ Current session:");
    console.log(`   Account: ${session.account.email || "unknown"}`);
    console.log(`   Plan: ${session.plan.name || "unknown"}`);
  } catch (e) {
    console.error("❌ Error:", e.message);
    process.exit(1);
  }
}

async function cmd_chat(prompt) {
  try {
    if (!prompt) {
      console.error("Usage: npm run chat 'your prompt'");
      process.exit(1);
    }

    const session = await getSession();
    if (!session) {
      console.log("❌ Not authenticated. Run: npm run login");
      process.exit(1);
    }

    console.log("💬 Sending prompt...");
    const client = createClient();
    const response = await client.respond(prompt, { model: "gpt-5.5" });
    console.log("\n📖 Response:");
    console.log(response);
  } catch (e) {
    console.error("❌ Chat failed:", e.message);
    process.exit(1);
  }
}

async function cmd_stream(prompt) {
  try {
    if (!prompt) {
      console.error("Usage: npm run stream 'your prompt'");
      process.exit(1);
    }

    const session = await getSession();
    if (!session) {
      console.log("❌ Not authenticated. Run: npm run login");
      process.exit(1);
    }

    console.log("💬 Streaming response...\n");
    const client = createClient();
    for await (const delta of client.stream(prompt, { model: "gpt-5.4-mini" })) {
      process.stdout.write(delta);
    }
    console.log("\n");
  } catch (e) {
    console.error("\n❌ Stream failed:", e.message);
    process.exit(1);
  }
}

async function cmd_refresh() {
  try {
    console.log("🔄 Refreshing token...");
    const session = await refresh();
    console.log("✅ Token refreshed!");
    console.log(`   Account: ${session.account.email}`);
  } catch (e) {
    console.error("❌ Refresh failed:", e.message);
    process.exit(1);
  }
}

async function cmd_logout() {
  try {
    console.log("🚪 Logging out...");
    await logout();
    console.log("✅ Logged out successfully!");
  } catch (e) {
    console.error("❌ Logout failed:", e.message);
    process.exit(1);
  }
}

async function cmd_test_port() {
  console.log("🧪 Testing port binding behavior...");
  console.log("Currently: only listens on 127.0.0.1:1455");
  console.log("Should test: IPv6 support, port conflicts");
  // This is a placeholder for actual testing
  console.log("⚠️  Manual test required: kill -9 <pid> on port 1455 and re-auth");
}

async function cmd_test_corruption() {
  console.log("🧪 Testing corrupted token recovery...");
  console.log("1. Run: npm run login");
  console.log("2. Corrupt token file: echo 'garbage' > ~/.loginwithchatgpt/tokens.enc");
  console.log("3. Run: npm run whoami (should fail gracefully)");
  console.log("4. Run: npm run login (should re-auth successfully)");
}

const cmd = process.argv[2];
const arg = process.argv[3];

switch (cmd) {
  case "login":
    await cmd_login();
    break;
  case "whoami":
    await cmd_whoami();
    break;
  case "chat":
    await cmd_chat(arg);
    break;
  case "stream":
    await cmd_stream(arg);
    break;
  case "refresh":
    await cmd_refresh();
    break;
  case "logout":
    await cmd_logout();
    break;
  case "test-port":
    await cmd_test_port();
    break;
  case "test-corruption":
    await cmd_test_corruption();
    break;
  default:
    console.log(`Usage:
  npm run login              # Authenticate
  npm run whoami             # Show current session
  npm run chat "prompt"      # Send a prompt
  npm run stream "prompt"    # Stream a response
  npm run refresh            # Refresh token
  npm run logout             # Clear tokens
`);
}
