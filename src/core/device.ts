import { config } from "./config";
import { exchangeCode } from "./tokens";
import { toSession, type Session } from "./auth";
import { defaultStore, type TokenStore, type Tokens } from "./store";

const headers = {
  "content-type": "application/json",
  accept: "application/json",
  "user-agent": "loginwithchatgpt",
};

interface UserCodeResponse {
  device_auth_id: string;
  user_code?: string;
  usercode?: string;
  interval?: number;
}

interface PollSuccess {
  authorization_code: string;
  code_verifier: string;
}

export interface DeviceLogin {
  /** Show this to the user. */
  userCode: string;
  /** The page the user opens to enter the code. */
  verificationUrl: string;
  /** Poll until the user authorizes, then exchange and store tokens. */
  wait(): Promise<Session>;
}

export interface DeviceStart {
  deviceAuthId: string;
  userCode: string;
  verificationUrl: string;
  /** Suggested poll interval in ms. */
  interval: number;
}

export type DevicePollResult =
  | { status: "pending" }
  | { status: "complete"; tokens: Tokens };

/**
 * Stateless device-code start — for web/serverless where you can't hold a long-running
 * wait(). Returns the code to show plus the ids to poll with from a separate request.
 */
export async function deviceStart(): Promise<DeviceStart> {
  const res = await fetch(config.deviceUserCodeUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ client_id: config.clientId }),
  });
  if (!res.ok) {
    throw new Error(`Device auth start failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as UserCodeResponse;
  return {
    deviceAuthId: data.device_auth_id,
    userCode: data.user_code ?? data.usercode ?? "",
    verificationUrl: config.deviceVerificationUrl,
    interval: (data.interval ?? 5) * 1000,
  };
}

/** Poll once. Pending until the user authorizes, then returns the exchanged tokens. */
export async function devicePoll(deviceAuthId: string, userCode: string): Promise<DevicePollResult> {
  const poll = await fetch(config.devicePollUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ device_auth_id: deviceAuthId, user_code: userCode }),
  });
  if (poll.status === 403 || poll.status === 404) {
    return { status: "pending" };
  }
  if (!poll.ok) {
    throw new Error(`Device auth poll failed: ${poll.status} ${await poll.text()}`);
  }
  const success = (await poll.json()) as PollSuccess;
  const tokens = await exchangeCode(
    success.authorization_code,
    success.code_verifier,
    config.deviceRedirectUri,
  );
  return { status: "complete", tokens };
}

/**
 * Device-code login for headless/web contexts with no loopback. The user opens the
 * verification URL and enters userCode. Requires device code authorization to be enabled
 * in ChatGPT Settings -> Security & Login.
 */
export async function startDeviceLogin(opts: { store?: TokenStore } = {}): Promise<DeviceLogin> {
  const store = opts.store ?? defaultStore;

  const res = await fetch(config.deviceUserCodeUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ client_id: config.clientId }),
  });
  if (!res.ok) {
    throw new Error(`Device auth start failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as UserCodeResponse;
  const userCode = data.user_code ?? data.usercode ?? "";
  const deviceAuthId = data.device_auth_id;
  const interval = (data.interval ?? 5) * 1000;

  return {
    userCode,
    verificationUrl: config.deviceVerificationUrl,
    async wait(): Promise<Session> {
      const deadline = Date.now() + 15 * 60_000;
      while (Date.now() < deadline) {
        const poll = await fetch(config.devicePollUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({ device_auth_id: deviceAuthId, user_code: userCode }),
        });

        if (poll.status === 403 || poll.status === 404) {
          await new Promise((r) => setTimeout(r, interval));
          continue;
        }
        if (!poll.ok) {
          throw new Error(`Device auth poll failed: ${poll.status} ${await poll.text()}`);
        }

        const success = (await poll.json()) as PollSuccess;
        const tokens = await exchangeCode(
          success.authorization_code,
          success.code_verifier,
          config.deviceRedirectUri,
        );
        await store.save(tokens);
        return toSession(tokens);
      }
      throw new Error("Device authorization timed out.");
    },
  };
}
