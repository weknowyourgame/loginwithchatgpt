# Device Code Flow Example

Tests the device-code authentication flow for headless/web environments.

## What This Tests

- ✓ `startDeviceLogin()` function
- ✓ User code display
- ✓ Polling behavior
- ✓ 15-minute timeout
- ✓ Cancellation
- ✓ Multiple concurrent device codes
- ✓ Session persistence after device auth

## How to Run

```bash
cd examples-qa/device-code
npm install
npm run start

# Output will show:
# "Please enter this code at: https://auth.openai.com/codex/device"
# "Code: XXXX-XXXX"

# In your browser, visit the verification URL and enter the code
# After approval, the CLI will complete authentication
```

## Expected Behavior

1. Shows user code in terminal
2. Shows verification URL
3. Waits for user to visit URL and enter code
4. Polls OpenAI every 5 seconds
5. Completes when user approves
6. Saves tokens and allows API calls
7. Times out after 15 minutes if not completed

## Testing Scenarios

| Test | Expected |
|------|----------|
| Approval | Device auth completes, tokens saved |
| Rejection | Auth fails with appropriate error |
| Timeout | After 15 min, times out gracefully |
| Concurrent x3 | 3 unique codes generated, independent polls |
| Network failure | Handles poll errors, retries |
| Invalid code | Shows appropriate error message |

## Common Issues

- **User code not showing**: Check console output, may need to scroll up
- **Verification URL not working**: Ensure ChatGPT device-code feature is enabled
- **Timeout**: User has 15 minutes to complete auth
- **Network error during poll**: Should retry automatically

## Security Notes

- Device codes are short-lived
- Each device gets unique verification URL
- Polling respects 403/404 backoff
- No tokens stored until completion
