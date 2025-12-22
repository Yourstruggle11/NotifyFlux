import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { createUser, CreateUserRequest, getCurrentUser } from "../api/usersApi";
import { issueServiceToken } from "../api/authApi";
import { emitSystemEvent } from "../api/notificationsApi";
import { getHealth, getReadiness, HealthStatus, seedDemoData, SeedResult } from "../api/observabilityApi";
import { UserProfile } from "../types";

export const AdminPage = (): JSX.Element => {
  const { state } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userForm, setUserForm] = useState<CreateUserRequest>({ userId: "", email: "", password: "", roles: ["user"] });
  const [serviceTokenUserId, setServiceTokenUserId] = useState<string>("");
  const [serviceToken, setServiceToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [systemEventCode, setSystemEventCode] = useState<string>("ops/demo");
  const [systemEventMessage, setSystemEventMessage] = useState<string>("Planned maintenance window started");
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [ready, setReady] = useState<HealthStatus | null>(null);
  const [seedResult, setSeedResult] = useState<SeedResult | null>(null);

  useEffect(() => {
    const loadProfile = async (): Promise<void> => {
      if (!state.tenantId || !state.token) {
        return;
      }
      try {
        const user = await getCurrentUser(state.tenantId, state.token);
        setProfile(user);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    void loadProfile();
  }, [state.tenantId, state.token]);

  const submitUser = async (evt: FormEvent): Promise<void> => {
    evt.preventDefault();
    setError(null);
    setMessage(null);
    if (!state.tenantId || !state.token) {
      setError("Not authenticated");
      return;
    }
    try {
      const created = await createUser(state.tenantId, state.token, userForm);
      setMessage(`User created: ${created.email}`);
      setUserForm({ userId: "", email: "", password: "", roles: ["user"] });
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const generateServiceToken = async (evt: FormEvent): Promise<void> => {
    evt.preventDefault();
    setError(null);
    setServiceToken(null);
    if (!state.tenantId || !state.token) {
      setError("Not authenticated");
      return;
    }
    try {
      const result = await issueServiceToken(state.tenantId, state.token, serviceTokenUserId || undefined);
      setServiceToken(result.token);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const sendSystemEvent = async (evt: FormEvent): Promise<void> => {
    evt.preventDefault();
    setError(null);
    setMessage(null);
    if (!state.tenantId || !state.token) {
      setError("Not authenticated");
      return;
    }
    try {
      await emitSystemEvent(state.tenantId, state.token, { code: systemEventCode, message: systemEventMessage });
      setMessage("System event emitted to all sockets in this tenant.");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const checkHealth = async (): Promise<void> => {
    try {
      const [h, r] = await Promise.all([getHealth(), getReadiness()]);
      setHealth(h);
      setReady(r);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const runSeed = async (): Promise<void> => {
    setError(null);
    setMessage(null);
    if (!state.tenantId || !state.token) {
      setError("Not authenticated");
      return;
    }
    try {
      const result = await seedDemoData(state.tenantId, state.token);
      setSeedResult(result);
      setMessage("Demo data seeded.");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="page admin">
      <header className="page-header">
        <h1>Admin Console</h1>
        <div className="nav-inline">
          <button type="button" onClick={() => navigate("/inbox")}>Back to Inbox</button>
          <button type="button" onClick={() => navigate("/realtime-log")}>Realtime Log</button>
        </div>
      </header>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      <section>
        <h2>Current User</h2>
        {profile ? (
          <pre className="metadata">{JSON.stringify(profile, null, 2)}</pre>
        ) : (
          <p className="muted">Loading profile...</p>
        )}
      </section>

      <section>
        <h2>Create User</h2>
        <form onSubmit={submitUser} className="stack">
          <label>
            User ID
            <input value={userForm.userId} onChange={(e) => setUserForm({ ...userForm, userId: e.target.value })} required />
          </label>
          <label>
            Email
            <input type="email" value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} required />
          </label>
          <label>
            Password
            <input type="password" value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} required />
          </label>
          <label>
            Roles (comma separated)
            <input
              value={userForm.roles.join(",")}
              onChange={(e) => setUserForm({ ...userForm, roles: e.target.value.split(",").map((r) => r.trim()).filter((r) => r.length > 0) as CreateUserRequest["roles"] })}
              placeholder="admin,user"
            />
          </label>
          <button type="submit">Create User</button>
        </form>
      </section>

      <section>
        <h2>Issue Service Token</h2>
        <form onSubmit={generateServiceToken} className="stack">
          <label>
            User ID (optional override)
            <input value={serviceTokenUserId} onChange={(e) => setServiceTokenUserId(e.target.value)} placeholder="defaults to current user" />
          </label>
          <button type="submit">Generate Token</button>
        </form>
        {serviceToken && (
          <div className="token-box">
            <strong>Service Token</strong>
            <textarea readOnly value={serviceToken} />
            <p className="muted small">Use this for backend-to-backend calls (role: service). Tenant scope is enforced.</p>
          </div>
        )}
      </section>

      <section>
        <h2>Emit System Event</h2>
        <p className="muted small">System events broadcast to the tenant room for operational messages (e.g., maintenance, alerts). They appear instantly in Realtime Log.</p>
        <form onSubmit={sendSystemEvent} className="stack">
          <label>
            Code
            <input value={systemEventCode} onChange={(e) => setSystemEventCode(e.target.value)} required />
          </label>
          <label>
            Message
            <input value={systemEventMessage} onChange={(e) => setSystemEventMessage(e.target.value)} required />
          </label>
          <button type="submit">Broadcast System Event</button>
        </form>
      </section>

      <section>
        <h2>Observability</h2>
        <p className="muted small">Health = process up. Ready = Mongo + Redis available.</p>
        <div className="actions">
          <button type="button" onClick={() => void checkHealth()}>Run Health & Readiness</button>
        </div>
        <div className="grid two">
          <div className="card">
            <p className="eyebrow">Health</p>
            <pre className="metadata">{health ? JSON.stringify(health, null, 2) : "Not checked"}</pre>
          </div>
          <div className="card">
            <p className="eyebrow">Readiness</p>
            <pre className="metadata">{ready ? JSON.stringify(ready, null, 2) : "Not checked"}</pre>
          </div>
        </div>
      </section>

      <section>
        <h2>Seed Demo Data</h2>
        <p className="muted small">Creates sample users (admin, service/user, user) and starter notifications to demonstrate the pipeline.</p>
        <div className="actions">
          <button type="button" onClick={() => void runSeed()}>Seed Tenant Data</button>
        </div>
        {seedResult && (
          <pre className="metadata">{JSON.stringify(seedResult, null, 2)}</pre>
        )}
      </section>
    </div>
  );
};
