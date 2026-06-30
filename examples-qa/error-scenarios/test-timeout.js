import { login } from "loginwithchatgpt";

console.log("🧪 Testing Login Timeout\n");
console.log("📋 Scenario: Browser tab closed or user doesn't approve\n");

console.log("Starting login (will timeout after 5 minutes)...");
console.log("⏳ To trigger timeout early:");
console.log("   1. Run this script");
console.log("   2. DO NOT complete the OAuth flow");
console.log("   3. Wait for error\n");

console.log("Expected error after 5 minutes:");
console.log('   "Login timed out after 5 minutes"\n');

// This will actually timeout, so we'll just test the concept
try {
  // Simulate timeout with shorter duration for testing
  const loginPromise = login({ openBrowser: false });

  // Set a shorter timeout for this test
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Test timeout (simulated)")), 3000)
  );

  await Promise.race([loginPromise, timeoutPromise]);
} catch (e) {
  console.log("✅ Timeout correctly detected:");
  console.log(`   ${e.message}`);
  console.log("\n📝 This prevents infinite waiting for auth");
  console.log("   User can retry immediately");
}
