# Headless Login Example: SSH/CI/Container Environments

Tests the manual PKCE flow for environments without a loopback server.

## What This Tests

- `startLogin()` function
- Manual URL copy/paste workflow
- Extraction of code from full redirect URL or raw code
- CSRF protection (state validation)
- SSH/CI/container environments
- No browser automation required
- Works over network tunnels

## How to Run

```bash
cd examples-qa/headless-login
npm install
npm run start

# Output:
# "Please open this URL in your browser:"
# "https://auth.openai.com/oauth/authorize?..."
# "Then paste the code or full redirect URL below:"

# In another terminal or browser:
# Visit the URL, approve, get redirected to callback
# Paste the redirect URL or just the code

npm run test-manual # Test manual code entry
npm run test-ssh # Simulate SSH scenario
```

## Expected Behavior

1. Displays authorization URL
2. Waits for user input (code or full URL)
3. Extracts code from either format
4. Validates state parameter for CSRF
5. Exchanges code for tokens
6. Saves tokens
7. Ready for API calls

## Testing Scenarios

| Input | Should Work |
|-------|------------|
| Raw code: `abc123xyz` | Extract code |
| Full URL: `http://localhost:1455/auth/callback?code=abc&state=xyz` | Extract code + validate state |
| Wrong state | CSRF error |
| No code in URL | Parsing error |
| Malformed input | Clear error message |

## Use Cases

Perfect for:
- SSH sessions with no X11 forwarding
- CI/CD pipelines (GitLab CI, GitHub Actions)
- Docker containers
- Remote development
- Headless servers
- Network-isolated machines

## Common Issues

- **Redirect URL doesn't include code**: Check OAuth settings
- **State mismatch**: Browser session or time sync issue
- **Timeout waiting for input**: Close with Ctrl+C and retry

## Security Notes

- State parameter validates URL came from OpenAI
- No intermediate storage of code
- PKCE verifier never exposed over network
- User manually controls redirect URL
