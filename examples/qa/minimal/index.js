import { login, getSession, createClient } from "loginwithchatgpt";

const cmd = process.argv[2];

if (cmd === "login") {
  try {
    await login();
    console.log("✅ Authenticated");
  } catch (e) {
    console.error("❌", e.message);
    process.exit(1);
  }
} else {
  try {
    const s = await getSession();
    if (!s) {
      console.log("❌ Not logged in. Run: node index.js login");
      process.exit(1);
    }
    const c = createClient();
    console.log(await c.respond("Hello!"));
  } catch (e) {
    console.error("❌", e.message);
    process.exit(1);
  }
}
