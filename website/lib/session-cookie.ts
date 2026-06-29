import { cookies } from "next/headers";
import type { Tokens } from "loginwithchatgpt";

export const TOKEN_COOKIE = "lwc_tokens";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7
};

export async function readTokens(): Promise<Tokens | null> {
  const store = await cookies();
  const raw = store.get(TOKEN_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64").toString("utf8")) as Tokens;
  } catch {
    return null;
  }
}

export async function writeTokens(tokens: Tokens): Promise<void> {
  const store = await cookies();
  // id_token is a large JWT that duplicates claims already in access_token.
  // Dropping it keeps the cookie well under the 4 KB browser limit.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id_token: _drop, ...slim } = tokens as Tokens & { id_token?: string };
  store.set(TOKEN_COOKIE, Buffer.from(JSON.stringify(slim)).toString("base64"), cookieOptions);
}

export async function clearTokens(): Promise<void> {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
}
