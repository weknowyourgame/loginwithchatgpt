import { useChatGPTAuth } from "loginwithchatgpt/react";
import { LoginButton } from "./LoginButton";
import { SessionInfo } from "./SessionInfo";
import { ErrorBoundary } from "./ErrorBoundary";

export function App() {
  const auth = useChatGPTAuth({ basePath: "/api/chatgpt" });

  return (
    <ErrorBoundary>
      <div className="container">
        <div className="card">
          <h1>🚀 Login with ChatGPT</h1>
          <p className="subtitle">React + Vite Integration Example</p>

          {auth.status === "error" && (
            <div className="error-box">
              <strong>Error:</strong> {auth.error?.message}
            </div>
          )}

          {auth.status === "connected" ? (
            <>
              <SessionInfo account={auth.account} plan={auth.plan} />
              <button className="btn btn-danger" onClick={auth.logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <p>Connect your ChatGPT account to get started.</p>
              <LoginButton
                onClick={auth.login}
                disabled={auth.status === "connecting"}
                loading={auth.status === "connecting"}
              />
            </>
          )}

          <div className="status-badge" data-status={auth.status}>
            Status: <strong>{auth.status}</strong>
          </div>

          {auth.status === "connected" && (
            <div className="api-calls">
              <h3>Test API Calls</h3>
              <button
                className="btn btn-small"
                onClick={() => alert("Chat endpoint ready")}
              >
                Test /api/chat
              </button>
              <p className="note">
                Note: Requires next.js example running at /api/chatgpt
              </p>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
