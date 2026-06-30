# Express Example: Server-Based Authentication

Tests the SDK in an Express.js server environment with session management.

## What This Tests

- Custom TokenStore implementation
- Server-side session management
- Multiple concurrent auth requests
- Express middleware integration
- Protected routes
- Error handling in express
- Session timeout
- Race conditions in concurrent requests
- Token refresh in request handler

## How to Run

```bash
cd examples-qa/express
npm install
npm run dev

# In another terminal:
curl http://localhost:3000/status # Check session
curl -X POST http://localhost:3000/login # Start device-code login
curl http://localhost:3000/whoami # Check auth (after login)
```

## Expected Behavior

1. **GET /status** → Returns { authenticated: false } initially
2. **POST /login** → Starts device-code flow, returns userCode + verificationUrl
3. **GET /whoami** → Returns current session or 401
4. **POST /logout** → Clears session
5. **Multiple requests** → Should handle concurrent requests properly

## Testing Scenarios

| Test | Endpoint | Expected |
|------|----------|----------|
| No session | /whoami | 401 Unauthorized |
| After login | /whoami | 200 with session |
| Concurrent login x3 | POST /login | All succeed, unique codes |
| Token expired | /whoami | Auto-refresh or 401 |
| Logout | POST /logout | Session cleared |

## Common Issues

- **Port already in use**: Change PORT env var
- **Device code timeout**: User must complete within 15 minutes
- **Session not shared**: Verify store implementation
- **Concurrent corruption**: Check race conditions in token save

## Architecture Notes

Uses a simple in-memory store for demo (should use DB in production):
- Stores per-session tokens
- Handles concurrent requests
- Auto-cleanup on logout
