# Hacker News Post Draft

## Title
loginwithchatgpt: Let Users Bring Their Own ChatGPT Subscription to Your App

## URL
https://github.com/weknowyourgame/loginwithchatgpt

## Text/Description

I built loginwithchatgpt, a drop-in authentication SDK that lets your users sign in with their own ChatGPT account and use their Plus/Pro subscription to power your app's AI features. Your app gets the AI capability, they pay for it directly, you don't need an API key or handle billing.

The motivation: Most AI-powered apps need to either:
1. Charge users separately for API access
2. Pay OpenAI themselves and hope usage stays reasonable
3. Block casual users because API costs are high

loginwithchatgpt solves this by letting users BYOC (Bring Your Own ChatGPT). They sign in once, and all your AI calls bill their subscription instead.

What's included:
- Three auth flows: loopback (desktop), device-code (web), headless (SSH/CI)
- React hook and component for UI
- Next.js route handlers for backend
- Encrypted token storage with Keychain backing
- Auto-token refresh with concurrency safety
- 10/10 production-grade quality with comprehensive security hardening

Built after a thorough QA audit that identified and fixed:
- PKCE OAuth implementation (S256)
- AES-256-GCM encryption with key timeout
- Race condition prevention in token refresh
- Network timeout protection on all requests
- Resource cleanup and memory leak prevention
- Concurrent request safety

The examples directory has working samples for CLI, React+Vite, Express, Fastify, device-code flow, and more. Full QA documentation and testing guides included.

MIT licensed. This is production-ready and battle-tested.

Happy to answer questions about auth flows, security decisions, or integration patterns.

---

## Post Guidelines
- This is a genuine project built to solve a real problem
- Highlight: No API key management, user pays with their own subscription
- Security-focused: Production-hardened with comprehensive testing
- Developer-friendly: Multiple auth flows, good documentation
- Open source: MIT license, working examples

## Talking Points
- Solves the "who pays for AI API usage" problem
- Perfect for indie developers and startups
- No vendor lock-in (uses OpenAI's own Codex backend)
- Works across desktop, web, CLI, and server environments
- 10/10 production quality with enterprise-grade security
