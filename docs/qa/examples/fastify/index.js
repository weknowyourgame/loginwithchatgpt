import Fastify from "fastify";
import { startDeviceLogin, getSession, logout } from "loginwithchatgpt";

const fastify = Fastify({ logger: true });
const PORT = process.env.PORT || 3001;

// In-memory session store
const sessions = new Map();

class SessionStore {
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

// Routes
fastify.get("/status", async (request, reply) => {
  const sessionId = request.query.session || "default";
  return {
    authenticated: sessions.has(sessionId),
    sessions: sessions.size,
    timestamp: new Date().toISOString(),
  };
});

fastify.post("/login", async (request, reply) => {
  try {
    const sessionId = request.query.session || "default";
    const store = new SessionStore(sessionId);

    const login = await startDeviceLogin({ store });

    return {
      sessionId,
      userCode: login.userCode,
      verificationUrl: login.verificationUrl,
      message:
        "Open verificationUrl and enter the code, then wait for /poll endpoint",
    };
  } catch (error) {
    reply.code(500);
    return { error: error.message };
  }
});

fastify.get("/whoami", async (request, reply) => {
  try {
    const sessionId = request.query.session || "default";
    const store = new SessionStore(sessionId);

    const session = await getSession(store);
    if (!session) {
      reply.code(401);
      return { error: "Not authenticated" };
    }

    return {
      email: session.account.email,
      plan: session.plan.name,
      sessionId,
    };
  } catch (error) {
    reply.code(500);
    return { error: error.message };
  }
});

fastify.post("/logout", async (request, reply) => {
  try {
    const sessionId = request.query.session || "default";
    const store = new SessionStore(sessionId);

    await logout(store);
    return { message: "Logged out", sessionId };
  } catch (error) {
    reply.code(500);
    return { error: error.message };
  }
});

// Health check
fastify.get("/health", async () => ({
  status: "ok",
  uptime: process.uptime(),
}));

await fastify.listen({ port: PORT, host: "127.0.0.1" });
console.log(`🚀 Fastify server running on http://127.0.0.1:${PORT}`);
console.log("Endpoints:");
console.log("  GET  /status     - Check auth status");
console.log("  POST /login      - Start device-code login");
console.log("  GET  /whoami     - Get current session");
console.log("  POST /logout     - Logout");
console.log("  GET  /health     - Health check");
