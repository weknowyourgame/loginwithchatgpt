import { createHash, randomBytes } from "node:crypto";

/** base64url with no padding — required for PKCE. */
const base64url = (buf: Buffer) =>
  buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export interface Pkce {
  verifier: string;
  challenge: string;
  state: string;
}

/** Generate a PKCE verifier/challenge pair (S256) plus an anti-CSRF state. */
export function createPkce(): Pkce {
  const verifier = base64url(randomBytes(64));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  const state = base64url(randomBytes(32));
  return { verifier, challenge, state };
}
