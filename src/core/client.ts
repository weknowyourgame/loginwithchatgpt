import { config } from "./config.ts";
import { defaultStore, type TokenStore } from "./store.ts";
import { accountInfo, refreshTokens } from "./tokens.ts";

export interface RespondOptions {
  model?: string;
  instructions?: string;
  signal?: AbortSignal;
}

interface ResponsesJson {
  output_text?: string;
  output?: Array<{ content?: Array<{ text?: string }> }>;
}

/** Collect assistant text from a non-streaming Responses payload. */
function extractText(json: ResponsesJson): string {
  if (typeof json.output_text === "string") return json.output_text;
  const parts: string[] = [];
  for (const item of json.output ?? []) {
    for (const c of item.content ?? []) {
      if (typeof c.text === "string") parts.push(c.text);
    }
  }
  return parts.length ? parts.join("") : JSON.stringify(json);
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
  async function freshTokens() {
    let tokens = await store.load();
    if (!tokens) throw new Error("Not authenticated.");
    if (Date.now() >= tokens.expires_at) {
      tokens = await refreshTokens(tokens.refresh_token);
      await store.save(tokens);
    }
    return tokens;
  }

  async function send(input: string, stream: boolean, opts: RespondOptions): Promise<Response> {
    let tokens = await freshTokens();
    const { accountId } = accountInfo(tokens);

    const body = JSON.stringify({
      model: opts.model ?? config.defaultModel,
      instructions: opts.instructions ?? "You are a helpful assistant.",
      input: [{ role: "user", content: [{ type: "input_text", text: input }] }],
      stream,
      store: false,
    });

    const post = (accessToken: string) =>
      fetch(config.responsesUrl, {
        method: "POST",
        signal: opts.signal,
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
          ...(accountId ? { "chatgpt-account-id": accountId } : {}),
          "openai-beta": "responses=experimental",
          originator: "codex_cli_rs",
        },
        body,
      });

    let res = await post(tokens.access_token);
    if (res.status === 401) {
      tokens = await refreshTokens(tokens.refresh_token);
      await store.save(tokens);
      res = await post(tokens.access_token);
    }
    if (!res.ok) {
      throw new Error(`Call failed: ${res.status} ${await res.text()}`);
    }
    return res;
  }

  async function respond(input: string, opts: RespondOptions = {}): Promise<string> {
    const res = await send(input, false, opts);
    return extractText((await res.json()) as ResponsesJson);
  }

  async function* stream(input: string, opts: RespondOptions = {}): AsyncGenerator<string> {
    const res = await send(input, true, opts);
    yield* parseSse(res);
  }

  return { respond, stream };
}
