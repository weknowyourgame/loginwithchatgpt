import { config } from "./config.ts";
import { fileStore, type TokenStore } from "./store.ts";
import { accountInfo, refreshTokens } from "./tokens.ts";

/**
 * Self-healing client that bills the user's subscription. Auto-refreshes tokens when
 * expired or on a 401. Targets the Codex `/responses` endpoint; the request shape is
 * isolated here as the most likely thing to need adjustment.
 */
export function createClient(store: TokenStore = fileStore) {
  async function freshTokens() {
    let tokens = await store.load();
    if (!tokens) throw new Error("Not authenticated.");
    if (Date.now() >= tokens.expires_at) {
      tokens = await refreshTokens(tokens.refresh_token);
      await store.save(tokens);
    }
    return tokens;
  }

  async function respond(input: string, model = "gpt-5.4"): Promise<string> {
    let tokens = await freshTokens();
    const { accountId } = accountInfo(tokens);

    const send = (accessToken: string) =>
      fetch(config.responsesUrl, {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
          ...(accountId ? { "chatgpt-account-id": accountId } : {}),
          "openai-beta": "responses=experimental",
          originator: "codex_cli_rs",
        },
        body: JSON.stringify({
          model,
          instructions: "You are a helpful assistant.",
          input: [{ role: "user", content: [{ type: "input_text", text: input }] }],
          stream: false,
          store: false,
        }),
      });

    let res = await send(tokens.access_token);

    // Self-heal once on 401: force a refresh and retry.
    if (res.status === 401) {
      tokens = await refreshTokens(tokens.refresh_token);
      await store.save(tokens);
      res = await send(tokens.access_token);
    }

    if (!res.ok) {
      throw new Error(`Call failed: ${res.status} ${await res.text()}`);
    }
    return await res.text();
  }

  return { respond };
}
