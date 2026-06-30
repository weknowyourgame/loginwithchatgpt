import { config } from "./config";
import type { Pkce } from "./pkce";
import type { Tokens } from "./store";

/** Build the authorize URL the user's browser opens to consent. */
export function authorizeUrl(pkce: Pkce): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(" "),
    code_challenge: pkce.challenge,
    code_challenge_method: "S256",
    id_token_add_organizations: "true",
    codex_cli_simplified_flow: "true",
    state: pkce.state,
  });
  return `${config.authorizeUrl}?${params.toString()}`;
}

interface RawTokenResponse {
  access_token: string;
  refresh_token: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
}

const withExpiry = (raw: RawTokenResponse): Tokens => ({
  access_token: raw.access_token,
  refresh_token: raw.refresh_token,
  id_token: raw.id_token,
  token_type: raw.token_type ?? "Bearer",
  // Renew a minute early to avoid edge-of-expiry races.
  expires_at: Date.now() + (raw.expires_in - 60) * 1000,
});

const NETWORK_TIMEOUT = 30000; // 30 seconds

function fetchWithTimeout(url: string, options: RequestInit & { timeout?: number } = {}) {
  const { timeout = NETWORK_TIMEOUT, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  return fetch(url, { ...fetchOptions, signal: controller.signal })
    .then((res) => {
      clearTimeout(timeoutId);
      return res;
    })
    .catch((err) => {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        throw new Error(`Request timed out after ${timeout}ms`);
      }
      throw err;
    });
}

/** Exchange an authorization code + PKCE verifier for tokens. */
export async function exchangeCode(
  code: string,
  verifier: string,
  redirectUri: string = config.redirectUri,
): Promise<Tokens> {
  const res = await fetchWithTimeout(config.tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: config.clientId,
      code_verifier: verifier,
    }),
  });
  if (!res.ok) {
    throw new Error(`Token exchange failed: ${res.status} ${await res.text()}`);
  }
  return withExpiry((await res.json()) as RawTokenResponse);
}

/** Use a refresh token to mint a fresh access token. */
export async function refreshTokens(refreshToken: string): Promise<Tokens> {
  const res = await fetchWithTimeout(config.tokenUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: config.clientId,
      scope: config.scopes.join(" "),
    }),
  });
  if (!res.ok) {
    throw new Error(`Refresh failed: ${res.status} ${await res.text()}`);
  }
  const next = withExpiry((await res.json()) as RawTokenResponse);
  if (!next.refresh_token) next.refresh_token = refreshToken;
  return next;
}

/** Decode a JWT payload (no signature verification — just reading claims). */
export function decodeJwt(token?: string): Record<string, unknown> | null {
  if (!token) return null;
  const part = token.split(".")[1];
  if (!part) return null;
  try {
    return JSON.parse(Buffer.from(part, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

/** Pull the ChatGPT account id + plan out of the id/access token claims. */
export function accountInfo(tokens: Tokens): { accountId?: string; plan?: string; email?: string } {
  const claims = decodeJwt(tokens.id_token) ?? decodeJwt(tokens.access_token) ?? {};
  const auth = (claims["https://api.openai.com/auth"] ?? {}) as Record<string, unknown>;
  return {
    accountId: auth["chatgpt_account_id"] as string | undefined,
    plan: auth["chatgpt_plan_type"] as string | undefined,
    email: claims["email"] as string | undefined,
  };
}
