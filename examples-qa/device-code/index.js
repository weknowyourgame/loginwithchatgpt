import { startDeviceLogin } from "loginwithchatgpt";

try {
  console.log("📱 Starting device-code login...\n");

  const login = await startDeviceLogin();

  console.log("┌─────────────────────────────────────┐");
  console.log("│ 🔐 DEVICE CODE AUTHENTICATION       │");
  console.log("├─────────────────────────────────────┤");
  console.log(`│ Code: ${login.userCode.padEnd(31)}│`);
  console.log("├─────────────────────────────────────┤");
  console.log(
    `│ Visit: ${login.verificationUrl.substring(8).padEnd(27)}│`
  );
  console.log("│                                     │");
  console.log("│ Enter the code above to continue.  │");
  console.log("│ Waiting for approval...             │");
  console.log("└─────────────────────────────────────┘\n");

  console.log("⏳ Polling for authorization (timeout in 15 minutes)...");

  const session = await login.wait();

  console.log("\n✅ Authentication successful!");
  console.log(`   Email: ${session.account.email}`);
  console.log(`   Plan: ${session.plan.name}`);
  console.log("\n✨ You can now use the SDK to make API calls!");
} catch (e) {
  console.error("❌ Authentication failed:", e.message);
  process.exit(1);
}
