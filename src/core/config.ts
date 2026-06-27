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

  // Codex-scoped: ChatGPT-account tokens only accept Codex models, not general chat models.
  defaultModel: "gpt-5-codex",

  // Device-code flow (headless / web, no loopback). Requires the user to enable device
  // code authorization in ChatGPT Settings -> Security & Login.
  deviceUserCodeUrl: "https://auth.openai.com/api/accounts/deviceauth/usercode",
  devicePollUrl: "https://auth.openai.com/api/accounts/deviceauth/token",
  deviceVerificationUrl: "https://auth.openai.com/codex/device",
  deviceRedirectUri: "https://auth.openai.com/deviceauth/callback",
} as const;
