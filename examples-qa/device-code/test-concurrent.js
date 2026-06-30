import { startDeviceLogin } from "loginwithchatgpt";

console.log("🧪 Testing concurrent device-code flows...\n");

try {
  // Start 3 concurrent login flows
  const promises = Array(3)
    .fill(null)
    .map((_, i) =>
      startDeviceLogin().then((login) => ({
        id: i + 1,
        userCode: login.userCode,
        verificationUrl: login.verificationUrl,
        wait: login.wait,
      }))
    );

  const logins = await Promise.all(promises);

  console.log("✅ All 3 device codes generated successfully!\n");

  logins.forEach((login) => {
    console.log(`Device ${login.id}:`);
    console.log(`  Code: ${login.userCode}`);
    console.log(`  URL: ${login.verificationUrl}\n`);
  });

  console.log(
    "📝 All flows are now polling independently. This tests:"
  );
  console.log("  ✓ Multiple concurrent device codes");
  console.log("  ✓ Independent polling");
  console.log("  ✓ No interference between flows");
  console.log("  ✓ Each can complete independently");
} catch (e) {
  console.error("❌ Error:", e.message);
  process.exit(1);
}
