# SDK QA Brain - loginwithchatgpt Testing Log

## Phase 1: Initial Exploration & Assessment

### Repository State
- **Location**: /Users/sarthakkapila/loginwithchatgpt
- **Current Status**: Clean git state
- **Main Branch**: master
- **Package Version**: 0.1.0 (pre-release)

### Existing Structure
```
src/
  core/
    - auth.ts (login, startLogin, getSession, logout, refresh)
    - device.ts (startDeviceLogin, deviceStart, devicePoll)
    - client.ts (createClient for API calls)
    - store.ts (fileStore, encryptedFileStore, defaultStore)
    - crypto.ts (AES-256-GCM encryption)
    - tokens.ts (token management, refresh)
    - loopback.ts (OAuth redirect capture on localhost:1455)
    - pkce.ts (PKCE generation)
    - config.ts (OpenAI client config)
  react/
    - useChatGPTAuth.ts (React hook for auth state)
    - LoginWithChatGPT.tsx (React component)
  next/
    - handlers.ts (Next.js route handlers)

examples/
  web/ (existing Next.js example)
```

### Initial Observations
1. Package is at v0.1.0 - early stage but has core functionality
2. Three auth flows: loopback, device-code, headless
3. Encryption is AES-256-GCM (good)
4. PKCE implementation for OAuth (good)
5. Token auto-refresh mechanism mentioned
6. Only one example exists (examples/web)

### Key APIs to Test
- Core: login(), startLogin(), startDeviceLogin(), logout(), getSession(), refresh(), createClient()
- React: useChatGPTAuth(), <LoginWithChatGPT/>
- Next.js: createHandlers()
- Stores: fileStore, encryptedFileStore, defaultStore
- Types: Session, LoginOptions, TokenStore, Tokens, DeviceLogin, etc.

### Risk Areas to Investigate
1. **PKCE Implementation** - Is state validation correct? CSRF protection?
2. **Token Refresh Race Conditions** - Multiple concurrent requests?
3. **Error Handling** - What happens with expired tokens, network failures?
4. **Platform Compatibility** - Browser open works on all platforms?
5. **Encryption Key Management** - Keychain fallback handling?
6. **Memory Leaks** - Token cleanup, listener cleanup?
7. **React Strict Mode** - Double-render issues?
8. **TypeScript Strictness** - Type safety edge cases?

### Testing Strategy
1. Create 26+ working examples covering all frameworks
2. Run each example and verify basic functionality
3. Attempt to break each auth flow
4. Test error scenarios
5. Validate TypeScript types
6. Check security assumptions
7. Measure performance
8. Generate comprehensive report

### Session Goals
- [ ] Explore codebase fully ✓
- [ ] Create comprehensive examples (IN PROGRESS)
- [ ] Stress test all APIs
- [ ] Identify critical issues
- [ ] Produce SDK_REVIEW.md
- [ ] Commit changes at each phase

---

## Phase 2: Detailed Code Audit (COMPLETED)

### Key Implementation Details

**Config (src/core/config.ts)**
- Client ID: app_EMoamEEZ73f0CkXaXp7hrann (Codex CLI registered)
- OAuth URLs point to auth.openai.com
- Loopback on port 1455 (127.0.0.1)
- API endpoint: chatgpt.com/backend-api/codex/responses
- Default model: gpt-5.5
- Device-code URLs configured

**PKCE (src/core/pkce.ts)**
- 64-byte verifier → SHA256 → challenge (S256)
- 32-byte state for CSRF
- Proper base64url encoding with no padding

**Crypto (src/core/crypto.ts)**
- AES-256-GCM encryption
- IV + Tag + Ciphertext format
- Keychain on macOS, file fallback
- Key cached in memory (POTENTIAL CONCERN)
- File permissions set to 0o600 (good)

**Auth Flows**
1. login() → loopback on 127.0.0.1:1455
2. startLogin() → headless, manual code paste
3. startDeviceLogin() → device-code flow with 15min timeout
4. Token refresh → 60-second early renewal

**Client (src/core/client.ts)**
- createClient() auto-refreshes tokens
- 401 retry only once (POTENTIAL CONCERN)
- Stream parsing for SSE
- No exponential backoff
- No cleanup on error

**Device Flow Issues Identified**
- Hard-coded 15-minute timeout (no option to override)
- Polling starts immediately (could hammer server)
- No exponential backoff
- Error handling minimal

**Token Refresh Issues**
- Tokens renewed when expires_at <= Date.now()
- 60-second buffer (good)
- Only 1 retry on 401 (what if refresh itself fails?)

**Security Considerations**
- PKCE properly implemented
- State validation correct
- Keychain backed
- Token leakage possible in long-running processes (cached key)
- No server-side logout (tokens only cleared locally)

### Critical Questions to Investigate
1. What happens if port 1455 is occupied?
2. How does IPv6 work? (Only listening on 127.0.0.1)
3. What if device code times out mid-auth?
4. Can token refresh race conditions occur?
5. Memory leak with cached key on long-running servers?
6. What if encryption key is corrupted?
7. Does device code polling cause 403 spam?
8. Can PKCE replay attacks happen?
9. What about clock skew in token expiry?
10. Error recovery in client after network failure?

---

## Phase 3: Example Creation (IN PROGRESS)

Creating comprehensive examples to test real-world usage patterns.

### Example Categories
1. Basic Auth Flows
2. Framework Integrations
3. Error Scenarios
4. Edge Cases
5. Environment-specific

