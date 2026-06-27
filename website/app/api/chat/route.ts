import { createClient, type TokenStore, type Tokens } from "loginwithchatgpt";

import { readTokens, writeTokens } from "@/lib/session-cookie";

export const runtime = "nodejs";

// AI call billed to the logged-in user's ChatGPT subscription. Tokens come from the
// session cookie; the client is seeded with an in-memory store so a refresh persists back.
export async function POST(req: Request): Promise<Response> {
  const { prompt } = (await req.json()) as { prompt?: string };
  if (!prompt) {
    return Response.json({ error: "Missing prompt" }, { status: 400 });
  }

  const tokens = await readTokens();
  if (!tokens) {
    return Response.json({ error: "Not connected" }, { status: 401 });
  }

  let latest: Tokens = tokens;
  const store: TokenStore = {
    load: async () => latest,
    save: async (t) => {
      latest = t;
    },
    clear: async () => {}
  };

  try {
    const text = await createClient(store).respond(prompt);
    if (latest !== tokens) {
      await writeTokens(latest);
    }
    return Response.json({ text });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Request failed" }, { status: 500 });
  }
}
