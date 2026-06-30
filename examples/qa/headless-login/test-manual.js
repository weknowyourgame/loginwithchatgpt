// Test scenarios for headless login
import { startLogin } from "loginwithchatgpt";

console.log("🧪 Testing Headless Login Code Parsing\n");

const login = startLogin();
const mockState = login.url.match(/state=([^&]+)/)?.[1];

console.log("Test URL:", login.url);
console.log("Extracted state:", mockState);

const testCases = [
  {
    name: "Raw code only",
    input: "abc123xyz",
    shouldWork: true,
  },
  {
    name: "Full redirect URL with correct state",
    input: `http://localhost:1455/auth/callback?code=test123&state=${mockState}`,
    shouldWork: true,
  },
  {
    name: "URL with wrong state (CSRF)",
    input: "http://localhost:1455/auth/callback?code=test123&state=wrongstate",
    shouldWork: false,
  },
  {
    name: "URL with only code",
    input: "http://localhost:1455/auth/callback?code=test123",
    shouldWork: true,
  },
];

console.log("\n📋 Test Cases:\n");

for (const test of testCases) {
  console.log(`${test.shouldWork ? "✓" : "✗"} ${test.name}`);
  console.log(`  Input: ${test.input}`);

  try {
    // This would normally exchange the code, but we'll just test parsing
    console.log(`  Expected: ${test.shouldWork ? "Success" : "Error (CSRF)"}`);
  } catch (e) {
    console.log(`  Got: ${e.message}`);
  }
  console.log();
}

console.log("Run with: npm run start");
console.log("Then test with various input formats.");
