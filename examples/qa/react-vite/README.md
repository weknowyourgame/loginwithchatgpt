# React + Vite Example: Browser-Based Authentication

Tests React integration with session persistence, error boundaries, and loading states.

## What This Tests

- React hook: `useChatGPTAuth()`
- React component: `<LoginWithChatGPT/>`
- Session persistence (localStorage)
- Login/logout state transitions
- Error handling and display
- Loading states during auth
- Protected routes
- Error boundaries
- React StrictMode double-render
- Multiple component instances
- Concurrent login attempts

## How to Run

```bash
cd examples-qa/react-vite
npm install
npm run dev # Start dev server on localhost:5173
```

Visit `http://localhost:5173` and:
1. Click "Login with ChatGPT"
2. Browser opens to auth.openai.com
3. Approve and redirect back
4. Session should be restored on refresh
5. Try logout and login again

## Expected Behavior

| Action | Expected |
|--------|----------|
| Load page | Shows login button, no session required |
| Click login | Status → "connecting", disabled |
| Approve OAuth | Status → "connected", shows email/plan |
| Refresh page | Session restored instantly |
| Click logout | Status → "idle", session cleared |
| Multiple instances | All tabs stay in sync (via storage events) |
| Strict Mode | No double-render issues with auth |

## Common Failures

| Issue | Cause | Fix |
|-------|-------|-----|
| Session not persisting | localStorage disabled | Check browser settings |
| Login button unresponsive | CORS issue | Verify next.js example is running |
| "basePath not found" error | Wrong route handler path | Update basePath prop |
| Infinite loading | fetch error | Check console for network errors |
| Logout fails silently | Route not found | Ensure handlers are deployed |

## Advanced Tests

### Error Boundary
- Component should gracefully handle errors
- Test by throwing in a child component
- Should show fallback UI, not crash app

### StrictMode
- React.StrictMode intentionally double-renders
- useChatGPTAuth should handle cleanup properly
- Verify no duplicate auth requests in console

### Concurrent Logins
- Click login multiple times quickly
- Should debounce/cancel earlier attempts
- Only one OAuth window should open

### Session Restoration
- Login, close tab, open new tab
- Verify session loads from localStorage
- Test across different browsers/devices

### Token Expiry
- Wait for token expiry (or mock Date.now())
- Next API call should auto-refresh
- User should see no interruption
