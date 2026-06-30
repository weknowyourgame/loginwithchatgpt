import express from "express";
import {
  startDeviceLogin,
  deviceStart,
  devicePoll,
  getSession,
  logout,
} from "loginwithchatgpt";

const app = express();
const PORT = process.env.PORT || 3000;

// Demo: in-memory session store
// In production: use Redis or database
const sessions = new Map();

// Custom TokenStore for this server
class ServerSessionStore {
  constructor(sessionId) {
    this.sessionId = sessionId;
  }

  async load() {
    return sessions.get(this.sessionId) || null;
  }

  async save(tokens) {
    sessions.set(this.sessionId, tokens);
  }

  async clear() {
    sessions.delete(this.sessionId);
  }
}

app.use(express.json());

// Health check
app.get("/status", (req, res) => {
  const sessionId = req.query.session || "default";
  const hasSession = sessions.has(sessionId);
  res.json({
    authenticated: hasSession,
    sessions: sessions.size,
    timestamp: new Date().toISOString(),
  });
});

// Start device-code login
app.post("/login", async (req, res) => {
  try {
    const sessionId = req.query.session || "default";
    const store = new ServerSessionStore(sessionId);

    const login = await startDeviceLogin({ store });
    res.json({
      sessionId,
      userCode: login.userCode,
      verificationUrl: login.verificationUrl,
      poll: `/poll?session=${sessionId}`,
      instructions:
        "Open verificationUrl and enter the userCode, then poll the /poll endpoint",
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Poll for device-code completion
app.get("/poll", async (req, res) => {
  try {
    const sessionId = req.query.session || "default";
    const store = new ServerSessionStore(sessionId);

    const session = await getSession(store);
    if (session) {
      return res.json({ status: "authenticated", session });
    }

    // Check if device code is still valid (would need more state tracking)
    res.json({ status: "pending", message: "Still waiting for user approval" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Get current session
app.get("/whoami", async (req, res) => {
  try {
    const sessionId = req.query.session || "default";
    const store = new ServerSessionStore(sessionId);

    const session = await getSession(store);
    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    res.json({
      email: session.account.email,
      plan: session.plan.name,
      sessionId,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Logout
app.post("/logout", async (req, res) => {
  try {
    const sessionId = req.query.session || "default";
    const store = new ServerSessionStore(sessionId);

    await logout(store);
    res.json({ message: "Logged out", sessionId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Test concurrent logins
app.post("/test-concurrent", async (req, res) => {
  try {
    const promises = Array(3)
      .fill(null)
      .map((_, i) => {
        const store = new ServerSessionStore(`concurrent-${i}`);
        return startDeviceLogin({ store });
      });

    const results = await Promise.all(promises);
    res.json({
      logins: results.map((r) => ({
        userCode: r.userCode,
        verificationUrl: r.verificationUrl,
      })),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Test token corruption recovery
app.post("/test-corruption", async (req, res) => {
  try {
    const sessionId = "corruption-test";
    const store = new ServerSessionStore(sessionId);

    // Save corrupted token
    sessions.set(sessionId, null);

    // Should recover gracefully
    const session = await getSession(store);
    res.json({
      recovered: session === null,
      message: "Should not crash on corrupted token",
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Express server running on http://localhost:${PORT}`);
  console.log("\nEndpoints:");
  console.log("  GET  /status                 - Check authentication status");
  console.log("  POST /login                  - Start device-code login");
  console.log("  GET  /poll                   - Poll for completion");
  console.log("  GET  /whoami                 - Get current session");
  console.log("  POST /logout                 - Logout");
  console.log("  POST /test-concurrent        - Test 3 concurrent logins");
  console.log("  POST /test-corruption        - Test corruption recovery");
});
