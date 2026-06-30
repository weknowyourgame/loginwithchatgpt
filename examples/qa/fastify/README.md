# Fastify Example: High-Performance Server Authentication

Tests the SDK in a Fastify server environment.

## What This Tests

- Fastify route handlers
- Async/await in handlers
- Custom error handling
- Session management
- Concurrent requests
- JSON response types
- HTTP status codes

## How to Run

```bash
cd examples-qa/fastify
npm install
npm run dev

# Test endpoints:
curl http://localhost:3001/status
curl -X POST http://localhost:3001/login
curl http://localhost:3001/whoami
```

## Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | /status | Check if authenticated |
| POST | /login | Start device-code flow |
| GET | /whoami | Get current session (401 if not auth) |
| POST | /logout | Clear session |
| POST | /test/concurrent | Start 3 concurrent logins |

## Expected Responses

**GET /status** (no session)
```json
{ "authenticated": false, "sessions": 0 }
```

**GET /status** (authenticated)
```json
{ "authenticated": true, "email": "user@example.com" }
```

**GET /whoami** (401)
```json
{ "statusCode": 401, "error": "Unauthorized" }
```
