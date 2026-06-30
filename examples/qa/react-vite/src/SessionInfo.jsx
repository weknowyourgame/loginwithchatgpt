export function SessionInfo({ account, plan }) {
  return (
    <div className="session-info">
      <div className="info-item">
        <span className="label">Email:</span>
        <span className="value">{account?.email || "unknown"}</span>
      </div>
      <div className="info-item">
        <span className="label">Plan:</span>
        <span className="value">{plan?.name || "unknown"}</span>
      </div>
    </div>
  );
}
