export function LoginButton({ onClick, disabled, loading }) {
  return (
    <button
      className="btn btn-primary"
      onClick={onClick}
      disabled={disabled}
      style={{
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {loading ? (
        <>
          <span className="spinner"></span> Connecting...
        </>
      ) : (
        <>
          <span>🔐</span> Login with ChatGPT
        </>
      )}
    </button>
  );
}
