import type { Session, LoginOptions, RespondOptions, TokenStore, Tokens } from "loginwithchatgpt";
import { login, logout, getSession, refresh, createClient } from "loginwithchatgpt";

// Test: Correct usage of Session type
async function testSessionType(): Promise<void> {
  const session: Session | null = await getSession();
  if (session) {
    // session is narrowed to Session
    console.log("Status:", session.status); // ✓ 'connected' is literal type
    console.log("Email:", session.account.email); // ✓ optional email
  }
}

// Test: LoginOptions is properly typed
async function testLoginOptions(): Promise<void> {
  const opts: LoginOptions = {
    openBrowser: true,
    onUrl: (url: string) => {
      console.log("URL:", url);
    },
  };

  const session: Session = await login(opts);
  console.log("Logged in:", session.account.email);
}

// Test: RespondOptions with model selection
async function testRespondOptions(): Promise<void> {
  const opts1: RespondOptions = { model: "gpt-5.5" };
  const opts2: RespondOptions = { model: "gpt-5.4-mini", instructions: "Be concise" };
  const opts3: RespondOptions = { signal: new AbortController().signal };

  const client = createClient();
  const result: string = await client.respond("test", opts1);
  console.log("Response:", result);
}

// Test: TokenStore interface implementation
class CustomStore implements TokenStore {
  private data: Map<string, Tokens> = new Map();

  async load(): Promise<Tokens | null> {
    return this.data.get("tokens") ?? null;
  }

  async save(tokens: Tokens): Promise<void> {
    this.data.set("tokens", tokens);
  }

  async clear(): Promise<void> {
    this.data.delete("tokens");
  }
}

async function testCustomStore(): Promise<void> {
  const store = new CustomStore();
  const session: Session = await login({ store });
  console.log("Custom store session:", session.account.email);
}

// Test: Error handling
async function testErrorHandling(): Promise<void> {
  try {
    const session = await getSession();
    if (session) {
      // Can safely access properties due to narrowing
      const email: string | undefined = session.account.email;
      console.log("Email:", email);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
  }
}

// Test: Refresh with proper typing
async function testRefresh(): Promise<void> {
  try {
    const session: Session = await refresh();
    console.log("Refreshed:", session.account.id);
  } catch (e) {
    if (e instanceof Error) {
      console.error("Refresh failed:", e.message);
    }
  }
}

// All functions must have proper return types (no implicit any)
async function main(): Promise<void> {
  console.log("✅ TypeScript strict mode compilation successful!");
  console.log("All types are properly inferred and checked.");
}

main().catch((e: unknown) => {
  if (e instanceof Error) {
    console.error("Fatal error:", e.message);
  } else {
    console.error("Fatal error:", e);
  }
  process.exit(1);
});
