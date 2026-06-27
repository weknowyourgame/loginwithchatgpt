/**
 * Tokens as returned by the OAuth token endpoint, plus a computed absolute expiry.
 */
interface Tokens {
    access_token: string;
    refresh_token: string;
    id_token?: string;
    token_type: string;
    /** Absolute epoch-ms when the access token expires. */
    expires_at: number;
}
interface TokenStore {
    load(): Promise<Tokens | null>;
    save(tokens: Tokens): Promise<void>;
    clear(): Promise<void>;
}
/** Plaintext JSON store. Useful for debugging; not for production. */
declare const fileStore: TokenStore;
/** AES-256-GCM store with a keychain-backed key. The default. */
declare const encryptedFileStore: TokenStore;
declare const defaultStore: TokenStore;

interface Session {
    account: {
        email?: string;
        id?: string;
    };
    plan: {
        name?: string;
    };
    status: "connected";
}
interface LoginOptions {
    store?: TokenStore;
    /** Called with the authorize URL for display. The browser is still opened unless disabled. */
    onUrl?: (url: string) => void;
    /** Set false to skip auto-opening the system browser (caller handles it via onUrl). */
    openBrowser?: boolean;
}
/** Run the full loopback OAuth flow and persist the resulting tokens. */
declare function login(opts?: LoginOptions): Promise<Session>;
interface HeadlessLogin {
    /** Open in any browser, approve, then pass the redirected code (or full URL) to complete(). */
    url: string;
    complete(codeOrUrl: string): Promise<Session>;
}
/**
 * Headless login for environments where the loopback redirect can't be caught
 * (SSH, containers, CI). Returns the authorize URL and a complete() to call with the
 * code the user copies from the browser after approving.
 */
declare function startLogin(opts?: {
    store?: TokenStore;
}): HeadlessLogin;
declare function getSession(store?: TokenStore): Promise<Session | null>;
declare function logout(store?: TokenStore): Promise<void>;
/** Force a token refresh and persist the result. */
declare function refresh(store?: TokenStore): Promise<Session>;

export { type HeadlessLogin as H, type LoginOptions as L, type Session as S, type Tokens as T, type TokenStore as a, logout as b, defaultStore as d, encryptedFileStore as e, fileStore as f, getSession as g, login as l, refresh as r, startLogin as s };
