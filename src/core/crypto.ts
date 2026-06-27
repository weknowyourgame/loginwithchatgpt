import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { execFile } from "node:child_process";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

const SERVICE = "loginwithchatgpt";
const ACCOUNT = "token-key";
const keyFile = join(homedir(), ".loginwithchatgpt", "key");

async function keychainGet(): Promise<Buffer | null> {
  try {
    const { stdout } = await run("security", ["find-generic-password", "-a", ACCOUNT, "-s", SERVICE, "-w"]);
    return stdout.trim() ? Buffer.from(stdout.trim(), "base64") : null;
  } catch {
    return null;
  }
}

async function keychainSet(key: Buffer): Promise<boolean> {
  try {
    await run("security", ["add-generic-password", "-a", ACCOUNT, "-s", SERVICE, "-w", key.toString("base64"), "-U"]);
    return true;
  } catch {
    return false;
  }
}

async function fileGet(): Promise<Buffer | null> {
  try {
    const b64 = (await readFile(keyFile, "utf8")).trim();
    return b64 ? Buffer.from(b64, "base64") : null;
  } catch {
    return null;
  }
}

async function fileSet(key: Buffer): Promise<void> {
  await mkdir(dirname(keyFile), { recursive: true });
  await writeFile(keyFile, key.toString("base64"));
  await chmod(keyFile, 0o600);
}

let cached: Buffer | null = null;

/** Load the encryption key, generating and persisting one on first use. */
async function getKey(): Promise<Buffer> {
  if (cached) return cached;
  const darwin = process.platform === "darwin";

  let key = darwin ? await keychainGet() : await fileGet();
  if (!key) {
    key = randomBytes(32);
    const stored = darwin ? await keychainSet(key) : false;
    if (!stored) await fileSet(key); // fallback for non-darwin or keychain failure
  }
  cached = key;
  return key;
}

/** AES-256-GCM. Output: base64(iv).base64(tag).base64(ciphertext). */
export async function encrypt(plaintext: string): Promise<string> {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", await getKey(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), ct].map((b) => b.toString("base64")).join(".");
}

export async function decrypt(payload: string): Promise<string> {
  const [iv, tag, ct] = payload.split(".");
  if (!iv || !tag || !ct) throw new Error("Malformed encrypted payload");
  const decipher = createDecipheriv("aes-256-gcm", await getKey(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(ct, "base64")), decipher.final()]).toString("utf8");
}
