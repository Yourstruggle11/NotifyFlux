import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../theme/ThemeProvider";

export const LoginPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggle } = useTheme();
  const [tenantId, setTenantId] = useState<string>(import.meta.env.VITE_DEFAULT_TENANT_ID ?? "demo-tenant");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const onSubmit = async (evt: FormEvent): Promise<void> => {
    evt.preventDefault();
    setError(null);
    try {
      await login(tenantId, email, password);
      navigate("/inbox");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="login-hero">
      <div className="login-panel glass">
        <div className="login-header">
          <div>
            <p className="eyebrow">SaaS notifications</p>
            <h1>Sign in to NotifyFlux</h1>
            <p className="muted small">Multi-tenant, real-time delivery with Socket.IO + Mongo change streams.</p>
          </div>
          <button type="button" className="button-secondary" onClick={() => toggle()} aria-label="Toggle theme">
            {theme === "dark" ? "Light" : "Dark"} mode
          </button>
        </div>
        <form onSubmit={onSubmit} className="stack">
          <label>
            Tenant ID
            <input value={tenantId} onChange={(e) => setTenantId(e.target.value)} required />
          </label>
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>
          <label>
            Password
            <div className="input-with-icon">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                required
              />
              <button
                type="button"
                className="icon-button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
                    <circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M3 3l18 18" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
                    <circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                )}
              </button>
            </div>
          </label>
          <button type="submit">Login</button>
          {error && <p className="error">{error}</p>}
        </form>
        <div className="muted small">
          <p>Need demo credentials? In the Admin console you can seed demo users and notifications.</p>
        </div>
      </div>
      <div className="login-cta">
        <h2>Real-time by default</h2>
        <p>MongoDB change streams fan out through Socket.IO with Redis adapter across nodes. Multi-tenant isolation baked in.</p>
        <ul>
          <li>JWT + role-based routes</li>
          <li>System-wide events for ops/maintenance</li>
          <li>Prometheus-compatible /metrics, health, readiness</li>
        </ul>
      </div>
    </div>
  );
};
