import { startLogin } from "loginwithchatgpt";
import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

try {
  console.log("🔐 Headless Login (No Loopback)\n");

  const login = startLogin();

  console.log("📋 Authorization URL:\n");
  console.log(login.url);
  console.log("\n✨ Please:");
  console.log("1. Open the URL above in your browser");
  console.log("2. Sign in with your ChatGPT account");
  console.log("3. Approve the authorization");
  console.log("4. You'll be redirected - copy the URL from your browser\n");

  const input = await prompt(
    "Paste the redirect URL (or just the code): "
  );
  rl.close();

  console.log("\n🔄 Exchanging code for tokens...");
  const session = await login.complete(input);

  console.log("\n✅ Authentication successful!");
  console.log(`   Email: ${session.account.email}`);
  console.log(`   Plan: ${session.plan.name}`);
  console.log("\n📝 Tokens are now stored and ready for API calls!");
  console.log("   This flow works in:");
  console.log("   - SSH sessions");
  console.log("   - CI/CD pipelines");
  console.log("   - Docker containers");
  console.log("   - Any headless environment");
} catch (e) {
  console.error("❌ Authentication failed:", e.message);
  rl.close();
  process.exit(1);
}
