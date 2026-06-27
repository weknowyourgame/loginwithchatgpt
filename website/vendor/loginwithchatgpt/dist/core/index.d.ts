import { S as Session, T as Tokens, a as TokenStore } from '../auth-ezoYH4Jo.js';
export { H as HeadlessLogin, L as LoginOptions, d as defaultStore, e as encryptedFileStore, f as fileStore, g as getSession, l as login, b as logout, r as refresh, s as startLogin } from '../auth-ezoYH4Jo.js';

interface DeviceLogin {
    /** Show this to the user. */
    userCode: string;
    /** The page the user opens to enter the code. */
    verificationUrl: string;
    /** Poll until the user authorizes, then exchange and store tokens. */
    wait(): Promise<Session>;
}
interface DeviceStart {
    deviceAuthId: string;
    userCode: string;
    verificationUrl: string;
    /** Suggested poll interval in ms. */
    interval: number;
}
type DevicePollResult = {
    status: "pending";
} | {
    status: "complete";
    tokens: Tokens;
};
/**
 * Stateless device-code start — for web/serverless where you can't hold a long-running
 * wait(). Returns the code to show plus the ids to poll with from a separate request.
 */
declare function deviceStart(): Promise<DeviceStart>;
/** Poll once. Pending until the user authorizes, then returns the exchanged tokens. */
declare function devicePoll(deviceAuthId: string, userCode: string): Promise<DevicePollResult>;
/**
 * Device-code login for headless/web contexts with no loopback. The user opens the
 * verification URL and enters userCode. Requires device code authorization to be enabled
 * in ChatGPT Settings -> Security & Login.
 */
declare function startDeviceLogin(opts?: {
    store?: TokenStore;
}): Promise<DeviceLogin>;

/** Pull the ChatGPT account id + plan out of the id/access token claims. */
declare function accountInfo(tokens: Tokens): {
    accountId?: string;
    plan?: string;
    email?: string;
};

interface RespondOptions {
    model?: string;
    instructions?: string;
    signal?: AbortSignal;
}
/**
 * Self-healing client that bills the user's subscription. Auto-refreshes tokens when
 * expired or on a 401. Targets the Codex `/responses` endpoint; the request shape is
 * isolated here as the most likely thing to need adjustment.
 */
declare function createClient(store?: TokenStore): {
    respond: (input: string, opts?: RespondOptions) => Promise<string>;
    stream: (input: string, opts?: RespondOptions) => AsyncGenerator<string>;
};

export { type DeviceLogin, type DevicePollResult, type DeviceStart, Session, TokenStore, Tokens, accountInfo, createClient, devicePoll, deviceStart, startDeviceLogin };
