export const config = {
  clientId: "app_EMoamEEZ73f0CkXaXp7hrann",

  authorizeUrl: "https://auth.openai.com/oauth/authorize",
  tokenUrl: "https://auth.openai.com/oauth/token",

  // Loopback callback. Must match what's registered for the Codex client.
  port: 1455,
  redirectUri: "http://localhost:1455/auth/callback",

  scopes: ["openid", "profile", "email", "offline_access"],

  // The ChatGPT backend that bills the user's subscription.
  responsesUrl: "https://chatgpt.com/backend-api/codex/responses",

  // Models supported by the ChatGPT subscription backend (not the same as the direct API):
  //   gpt-5.5             — newest, recommended for complex coding (default)
  //   gpt-5.4             — flagship, strong coding + reasoning
  //   gpt-5.4-mini        — faster, lighter tasks and subagents
  //   gpt-5.3-codex-spark — near-instant iteration, Pro subscribers only (research preview)
  defaultModel: "gpt-5.5",

  // Device-code flow (headless / web, no loopback). Requires the user to enable device
  // code authorization in ChatGPT Settings -> Security & Login.
  deviceUserCodeUrl: "https://auth.openai.com/api/accounts/deviceauth/usercode",
  devicePollUrl: "https://auth.openai.com/api/accounts/deviceauth/token",
  deviceVerificationUrl: "https://auth.openai.com/codex/device",
  deviceRedirectUri: "https://auth.openai.com/deviceauth/callback",
} as const;
