# CLI Example: Complete Authentication Flow Test

Tests all core APIs in a Node.js CLI environment with real error scenarios.

## What This Tests

- ✓ `login()` - loopback OAuth flow
- ✓ `getSession()` - session restore
- ✓ `refresh()` - token refresh
- ✓ `logout()` - token cleanup
- ✓ `createClient()` - API calls with auto-refresh
- ✓ Error handling for expired tokens
- ✓ Session persistence across runs
- ✓ Browser open on all platforms
- ✓ Port binding errors
- ✓ Network failures during auth

## How to Run

```bash
cd examples-qa/cli
npm install
npm run login           # Start authentication
npm run whoami          # Check current session
npm run chat "prompt"   # Call ChatGPT
npm run refresh         # Force token refresh
npm run logout          # Clear stored tokens
```

## Expected Behavior

1. **First run**: Browser opens to auth.openai.com, loopback catches redirect
2. **Session saved**: Tokens stored encrypted at ~/.loginwithchatgpt/tokens.enc
3. **Subsequent runs**: Session restored without re-auth
4. **Chat calls**: Auto-refresh on token expiry, retry on 401
5. **Logout**: Tokens cleared, next run requires re-auth

## Common Failures

| Scenario | Symptom | Solution |
|----------|---------|----------|
| Port 1455 occupied | "EADDRINUSE" | Kill process on 1455 or wait for release |
| Browser doesn't open | See URL in console | Manual copy/paste of URL |
| Redirect timeout | "Login timed out after 5 minutes" | Ensure browser completes OAuth flow |
| Keychain locked | Permission denied on macOS | Unlock Keychain or use fileStore |
| Token corrupted | "Malformed encrypted payload" | Delete ~/.loginwithchatgpt/ |
| Network offline | Connection refused | Device must be online for OAuth |

## Architecture Testing

This example validates:
- Core engine lifecycle (login → store → restore → refresh → logout)
- Error propagation and recovery
- Multi-run session persistence
- Token encryption/decryption
- Platform-specific browser opening
