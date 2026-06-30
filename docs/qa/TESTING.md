# QA Testing Guide

Complete guide to running QA examples and understanding test results.

---

## Quick Start

### Run Your First Example

```bash
# CLI example - simplest to start
cd examples/qa/cli
npm install
npm run login # Start authentication
npm run whoami # Check current session
npm run logout # Clear tokens
```

### Run React Example

```bash
# React + Vite
cd examples/qa/react-vite
npm install
npm run dev # Opens http://localhost:5173
# Then click "Login with ChatGPT" button in browser
```

### Run a Server Example

```bash
# Express
cd examples/qa/express
npm install
npm run dev

# In another terminal:
curl http://localhost:3000/status
curl -X POST http://localhost:3000/login
```

---

## All 9 Examples

### 1. CLI (`examples/qa/cli/`)
**What it tests**: Full authentication lifecycle in a CLI app

**Commands**:
```bash
npm run login # Start OAuth flow (loopback)
npm run whoami # Show current session
npm run chat "hello" # Send a message to ChatGPT
npm run stream "hello" # Stream response (fast)
npm run refresh # Manually refresh token
npm run logout # Clear stored tokens
npm run test-port # Test port conflict handling
npm run test-corruption # Test corrupted token recovery
```

**Expected Behavior**:
1. `npm run login` opens browser → approve → tokens saved
2. `npm run whoami` shows email and plan
3. `npm run chat` sends prompt, gets response
4. `npm run logout` clears tokens
5. Next run requires re-auth

**Common Issues**:
- Port 1455 in use? `kill -9 $(lsof -t -i :1455)`
- Keychain locked? Use `fileStore` instead (see code)
- Network timeout? Ensure internet connection

---

### 2. React + Vite (`examples/qa/react-vite/`)
**What it tests**: React hook and component with error boundaries

**Commands**:
```bash
npm run dev # Start dev server
npm run build # Build for production
npm run preview # Preview production build
```

**Expected Behavior**:
1. Page loads with "Login with ChatGPT" button
2. Click button → browser opens OAuth → approve
3. Page updates with email and plan
4. Click "Logout" → session cleared
5. Refresh page → session restored (from localStorage)

**Test Scenarios**:
- [ ] Login from page load
- [ ] Refresh page while logged in (session restored)
- [ ] Login, logout, login again
- [ ] Multiple browser tabs (localStorage sync)
- [ ] Close browser, reopen (session persisted)

---

### 3. Express Server (`examples/qa/express/`)
**What it tests**: Server-side authentication with custom TokenStore

**Endpoints**:
```bash
GET /status # Check if authenticated
POST /login # Start device-code flow
GET /whoami # Get current session (401 if not auth)
POST /logout # Clear session
POST /test-concurrent # Test 3 concurrent logins
```

**Example Usage**:
```bash
# Start server
npm run dev

# In another terminal:
curl http://localhost:3000/status
# {"authenticated": false, "sessions": 0}

curl -X POST http://localhost:3000/login
# Returns device code and verification URL

# After you enter the code at verification URL:
curl http://localhost:3000/whoami
# {"email": "user@example.com", "plan": "Plus"}

# Test concurrent logins
curl -X POST http://localhost:3000/test-concurrent
# Starts 3 device-code flows independently
```

**What It Shows**:
- Custom TokenStore implementation
- In-memory session management
- Concurrent request handling

---

### 4. Fastify Server (`examples/qa/fastify/`)
**What it tests**: High-performance async server integration

**Same endpoints as Express** - Same API but using Fastify instead

```bash
npm run dev # Start on http://localhost:3001
```

**Differences from Express**:
- Native async/await support
- Better performance for high concurrency
- Minimal overhead

---

### 5. Device Code Flow (`examples/qa/device-code/`)
**What it tests**: `startDeviceLogin()` for web/headless environments

**Commands**:
```bash
npm run start # Start device-code flow
npm run test-concurrent # Test 3 concurrent flows
```

**Expected Behavior**:
1. Shows device code (e.g., XXXX-XXXX)
2. Shows verification URL
3. User visits URL and enters code
4. Server polls every 5 seconds
5. Completes within 15 minutes or times out

**When to Use**:
- Web servers (can't use loopback)
- Docker containers
- Remote machines
- Headless environments

**Requirements**:
- User must enable device code in ChatGPT Settings

---

### 6. Headless Login (`examples/qa/headless-login/`)
**What it tests**: `startLogin()` for SSH/CI environments

**Commands**:
```bash
npm run start # Start headless flow
npm run test-manual # Test code parsing
```

**Expected Behavior**:
1. Shows authorization URL
2. User opens URL in browser (anywhere)
3. User approves and gets redirected
4. User pastes redirect URL or code back
5. App exchanges code for tokens

**When to Use**:
- SSH sessions (no X11)
- CI/CD pipelines (GitHub Actions, GitLab CI)
- Remote servers (no browser)
- Headless containers

**Example**:
```bash
npm run start
# Output: "Paste the redirect URL or code:"
# Manually paste: http://localhost:1455/auth/callback?code=abc123&state=xyz
# Auth completes
```

---

### 7. TypeScript Strict (`examples/qa/typescript-strict/`)
**What it tests**: Type safety in strict mode

**Commands**:
```bash
npm run type-check # Verify types (tsc --noEmit)
npm run build # Compile TypeScript
npm run start # Run compiled JS
```

**Expected Behavior**:
- Zero TypeScript errors
- All types properly inferred
- Strict mode (`strictNullChecks`, `noImplicitAny`, etc.) passes

**What It Validates**:
- Session type has required `status: "connected"`
- Optional properties handled correctly
- Error handling with proper typing
- Custom TokenStore interface compliance

---

### 8. Minimal (`examples/qa/minimal/`)
**What it tests**: Bare minimum to get running (20 lines)

**Commands**:
```bash
node index.js login # Authenticate
node index.js # Make API call
```

**Code**:
```javascript
import { login, getSession, createClient } from "loginwithchatgpt";

if (process.argv[2] === "login") {
 await login();
 console.log(" Authenticated");
} else {
 const s = await getSession();
 if (!s) {
 console.log(" Not logged in");
 process.exit(1);
 }
 console.log(await createClient().respond("Hello!"));
}
```

**Use This To**:
- Understand the simplest usage
- Quick testing
- Baseline performance measurement

---

### 9. Error Scenarios (`examples/qa/error-scenarios/`)
**What it tests**: Edge cases and failure modes

**Commands**:
```bash
npm run test-port # Test port conflict
npm run test-corruption # Test corrupted token
npm run test-timeout # Test timeout handling
```

**Each Test Shows**:
- What the error is
- How to reproduce it
- Expected recovery path
- Best practices

---

## Running All Tests

```bash
#!/bin/bash
set -e

cd examples/qa

# Test each example quickly
for dir in cli minimal typescript-strict device-code error-scenarios; do
 echo "Testing $dir..."
 cd "$dir"
 npm install --silent
 echo " $dir installed"
 cd ..
done

echo ""
echo " All examples installed successfully"
echo ""
echo "Next steps:"
echo " - CLI: cd cli && npm run login"
echo " - React: cd react-vite && npm run dev"
echo " - Express: cd express && npm run dev"
```

---

## Interpreting Results

### Success Indicators
- Example runs without errors
- Expected output matches documentation
- No unhandled exceptions
- Cleanup works (tokens saved/cleared)

### Common Failures

| Error | Cause | Fix |
|-------|-------|-----|
| `EADDRINUSE` | Port occupied | `kill -9 $(lsof -t -i :PORT)` |
| `CORS error` | Browser blocking | Check route handler deployment |
| `Timeout` | OAuth not completed | Ensure browser completes flow |
| `Malformed token` | Encryption error | Delete ~/.loginwithchatgpt/ |
| `Not authenticated` | Session cleared | Re-run login flow |

---

## Test Environment Variables

### Optional Configuration

```bash
# Use plaintext token storage (debugging only)
DEBUG=true npm run start

# Specify different port
PORT=3002 npm run dev

# Reduce timeouts for testing
TIMEOUT=10000 npm run test

# Enable verbose logging
VERBOSE=true npm run login
```

---

## Metrics to Check

When testing, verify:

**Performance**:
- Cold login: 2-5 seconds
- Warm session restore: <100ms
- Token refresh: ~500ms

**Reliability**:
- Loopback catches redirects correctly
- Device code polls successfully
- Tokens persisted and restored
- Corruption handled gracefully

**Security**:
- Tokens never logged to console
- State validation prevents CSRF
- Encryption uses random IVs
- No plaintext secrets in errors

---

## Reporting Issues

If you find problems:

1. **Reproduce** in a specific example
2. **Document** exact steps and error
3. **Include** environment info:
 ```bash
 node --version
 npm --version
 uname -a
 ```
4. **Report** in GitHub issues with:
 - Which example
 - What command you ran
 - Full error output
 - Expected vs actual behavior

---

## Security Testing

For QA teams:

- [ ] Test PKCE state validation (modify state param)
- [ ] Test redirect URL validation (man-in-the-middle)
- [ ] Test token encryption (swap corrupted token)
- [ ] Test keychain fallback (simulate missing keychain)
- [ ] Test concurrent refresh (multiple simultaneous requests)
- [ ] Test expired token handling (manipulate Date.now())
- [ ] Test network failure recovery (disconnect during auth)

---

## Performance Testing

```bash
# Measure cold auth
time npm run login

# Measure warm restore
time npm run whoami

# Measure token refresh
time npm run refresh

# Bundle size
npm run build && du -sh dist/
```

---

## Integration Checklist

Before using in production:

- [ ] Run all 9 examples successfully
- [ ] Understand the 6 critical issues
- [ ] Review [docs/qa/SDK_REVIEW.md](./SDK_REVIEW.md)
- [ ] Plan for the known limitations
- [ ] Test with your specific framework
- [ ] Verify TokenStore with your database
- [ ] Monitor token refresh performance
- [ ] Plan error handling for edge cases
- [ ] Document deployment procedure
- [ ] Set up monitoring and alerts

---

For more details, see [docs/qa/README.md](./README.md).
