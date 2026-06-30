import { config } from "./config";
import { defaultStore, type TokenStore } from "./store";
import { accountInfo, refreshTokens } from "./tokens";

const NETWORK_TIMEOUT = 30000; // 30 seconds

export interface RespondOptions {
  model?: string;
  instructions?: string;
  signal?: AbortSignal;
}


/** Yield assistant text deltas from a streaming (SSE) Responses payload. */
async function* parseSse(res: Response): AsyncGenerator<string> {
  const reader = res.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let sep: number;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const event = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      for (const line of event.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") return;
        try {
          const evt = JSON.parse(data) as { type?: string; delta?: string };
          if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
            yield evt.delta;
          }
        } catch {
          // Ignore keep-alives and partial frames.
        }
      }
    }
  }
}

/**
 * Self-healing client that bills the user's subscription. Auto-refreshes tokens when
 * expired or on a 401. Targets the Codex `/responses` endpoint; the request shape is
 * isolated here as the most likely thing to need adjustment.
 */
export function createClient(store: TokenStore = defaultStore) {
  let refreshInProgress: Promise<void> | null = null;

  async function freshTokens() {
    let tokens = await store.load();
    if (!tokens) throw new Error("Not authenticated.");
    if (Date.now() >= tokens.expires_at) {
      if (refreshInProgress) {
        await refreshInProgress;
        tokens = await store.load();
        if (!tokens) throw new Error("Not authenticated after refresh.");
      } else {
        refreshInProgress = (async () => {
          try {
            const newTokens = await refreshTokens(tokens.refresh_token);
            await store.save(newTokens);
          } finally {
            refreshInProgress = null;
          }
        })();
        await refreshInProgress;
        tokens = await store.load();
        if (!tokens) throw new Error("Not authenticated after refresh.");
      }
    }
    return tokens;
  }

  async function send(input: string, opts: RespondOptions): Promise<Response> {
    let tokens = await freshTokens();
    const { accountId } = accountInfo(tokens);

    const body = JSON.stringify({
      model: opts.model ?? config.defaultModel,
      instructions: opts.instructions ?? "You are a helpful assistant.",
      input: [{ role: "user", content: [{ type: "input_text", text: input }] }],
      stream: true,
      store: false,
    });

    const post = (accessToken: string) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), NETWORK_TIMEOUT);
      const abortSignal = opts.signal;

      const abortController = new AbortController();
      const cleanup = () => clearTimeout(timeoutId);

      if (abortSignal) {
        abortSignal.addEventListener("abort", () => abortController.abort());
      }

      return fetch(config.responsesUrl, {
        method: "POST",
        signal: abortController.signal,
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
          ...(accountId ? { "chatgpt-account-id": accountId } : {}),
          "openai-beta": "responses=experimental",
          originator: "codex_cli_rs",
        },
        body,
      }).then(
        (res) => {
          cleanup();
          return res;
        },
        (err) => {
          cleanup();
          if (err.name === "AbortError" && !abortSignal?.aborted) {
            throw new Error(`Request timed out after ${NETWORK_TIMEOUT}ms`);
          }
          throw err;
        },
      );
    };

    let res = await post(tokens.access_token);
    if (res.status === 401) {
      if (refreshInProgress) {
        await refreshInProgress;
        tokens = await store.load();
        if (!tokens) throw new Error("Not authenticated after refresh.");
      } else {
        refreshInProgress = (async () => {
          try {
            const newTokens = await refreshTokens(tokens.refresh_token);
            await store.save(newTokens);
          } finally {
            refreshInProgress = null;
          }
        })();
        await refreshInProgress;
        tokens = await store.load();
        if (!tokens) throw new Error("Not authenticated after refresh.");
      }
      res = await post(tokens.access_token);
    }
    if (!res.ok) {
      throw new Error(`Call failed: ${res.status} ${await res.text()}`);
    }
    return res;
  }

  // The API only supports streaming; collect all deltas into a single string.
  async function respond(input: string, opts: RespondOptions = {}): Promise<string> {
    const parts: string[] = [];
    for await (const delta of stream(input, opts)) {
      parts.push(delta);
    }
    return parts.join("");
  }

  async function* stream(input: string, opts: RespondOptions = {}): AsyncGenerator<string> {
    const res = await send(input, opts);
    yield* parseSse(res);
  }

  return { respond, stream };
}
