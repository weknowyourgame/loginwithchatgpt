# Error Scenarios Example: Testing Failure Modes

Comprehensive testing of error handling across all auth flows.

## What This Tests

- Port 1455 already in use
- Browser closed during auth
- Redirect timeout (5 minutes)
- Invalid redirect URL
- State mismatch (CSRF)
- Expired auth code
- Corrupted token storage
- Network failures
- Invalid model name
- Concurrent logout during refresh
- Token refresh failure
- Malformed token response

## How to Run

```bash
cd examples-qa/error-scenarios
npm install
npm run test-port # Test port binding error
npm run test-timeout # Test 5 min timeout
npm run test-corruption # Test corrupted tokens
npm run test-all # Run all scenarios
```

## Scenarios Tested

### Port Binding (EADDRINUSE)
**Trigger**: Run `npm run test-port` after starting another service on 1455
**Expected**: Clear error "EADDRINUSE: address already in use"
**Recovery**: Kill process on port, retry login

### Browser Closed
**Trigger**: Start login, close browser before OAuth completes
**Expected**: "Login timed out after 5 minutes"
**Recovery**: Retry login, complete OAuth flow

### State Mismatch
**Trigger**: Manually modify state param in redirect URL
**Expected**: "State mismatch — possible CSRF"
**Recovery**: Manual browser refresh needed (loopback will reject)

### Corrupted Token Storage
**Trigger**: `echo 'garbage' > ~/.loginwithchatgpt/tokens.enc`
**Expected**: Graceful fallback to null session
**Recovery**: Re-authenticate with `npm run login`

### Token Expiry Refresh
**Trigger**: Wait for token expiry or mock Date.now()
**Expected**: Auto-refresh on next API call
**Recovery**: Automatic (transparent to caller)

### Network Failure
**Trigger**: Disconnect network during token exchange
**Expected**: Clear error about connection failure
**Recovery**: Retry auth when network restored

## Expected Outputs

Each test should show:
```
 Error correctly caught
 Error message is clear
 Recovery steps shown
```

## Assertions

- [ ] All errors throw properly (don't hang)
- [ ] Error messages are actionable
- [ ] No data corruption on error
- [ ] State is consistent after error
- [ ] Retry succeeds after fixing condition

## Critical Paths

1. **Loopback failure** → should not hang indefinitely
2. **Token corruption** → should not crash app
3. **Network down** → should fail fast
4. **Concurrent operations** → should not race
5. **Token refresh during logout** → should complete one operation
