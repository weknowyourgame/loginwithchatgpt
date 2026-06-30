import { createServer } from "node:http";
import { login } from "loginwithchatgpt";

console.log("🧪 Testing Port Binding Error\n");

// Simulate port 1455 being occupied
const blocker = createServer();

try {
  blocker.listen(1455, "127.0.0.1", async () => {
    console.log("✅ Port 1455 blocked");
    console.log("   Attempting to start login...\n");

    try {
      await login({ openBrowser: false });
      console.log("❌ ERROR: Should have failed with EADDRINUSE");
    } catch (e) {
      console.log("✅ Caught expected error:");
      console.log(`   ${e.message}`);
      console.log("\n📝 Recovery:");
      console.log("   1. Kill process using port 1455");
      console.log("   2. Retry login");
    }

    blocker.close();
  });
} catch (e) {
  console.error("Setup error:", e.message);
}

setTimeout(() => process.exit(0), 2000);
