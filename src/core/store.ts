import { homedir } from "node:os";
import { join } from "node:path";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { decrypt, encrypt } from "./crypto.ts";

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
const encFile = join(dir, "tokens.enc");

const read = async (path: string): Promise<string | null> => {
  try {
    return await readFile(path, "utf8");
  } catch {
    return null;
  }
};

/** Plaintext JSON store. Useful for debugging; not for production. */
export const fileStore: TokenStore = {
  async load() {
    const raw = await read(file);
    return raw ? (JSON.parse(raw) as Tokens) : null;
  },
  async save(tokens) {
    await mkdir(dir, { recursive: true });
    await writeFile(file, JSON.stringify(tokens, null, 2));
  },
  async clear() {
    await rm(file, { force: true });
  },
};

/** AES-256-GCM store with a keychain-backed key. The default. */
export const encryptedFileStore: TokenStore = {
  async load() {
    const payload = (await read(encFile))?.trim();
    if (!payload) return null;
    try {
      return JSON.parse(await decrypt(payload)) as Tokens;
    } catch {
      return null; // corrupt or key mismatch → treat as logged out
    }
  },
  async save(tokens) {
    await mkdir(dir, { recursive: true });
    await writeFile(encFile, await encrypt(JSON.stringify(tokens)));
  },
  async clear() {
    await rm(encFile, { force: true });
  },
};

export const defaultStore: TokenStore = encryptedFileStore;
