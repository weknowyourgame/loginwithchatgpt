import { homedir } from "node:os";
import { join } from "node:path";
import { mkdir } from "node:fs/promises";

/**
 * Tokens as returned by the OAuth token endpoint, plus a computed absolute expiry.
 */
export interface Tokens {
  access_token: string;
  refresh_token: string;
  id_token?: string;
  token_type: string;
  /** Absolute epoch-ms when the access token expires. */
  expires_at: number;
}

export interface TokenStore {
  load(): Promise<Tokens | null>;
  save(tokens: Tokens): Promise<void>;
  clear(): Promise<void>;
}

const dir = join(homedir(), ".loginwithchatgpt");
const file = join(dir, "tokens.json");

export const fileStore: TokenStore = {
  async load() {
    const f = Bun.file(file);
    if (!(await f.exists())) return null;
    return (await f.json()) as Tokens;
  },
  async save(tokens) {
    await mkdir(dir, { recursive: true });
    await Bun.write(file, JSON.stringify(tokens, null, 2));
  },
  async clear() {
    const f = Bun.file(file);
    if (await f.exists()) await Bun.write(file, "");
    try {
      await Bun.$`rm -f ${file}`.quiet();
    } catch {
      /* ignore */
    }
  },
};
