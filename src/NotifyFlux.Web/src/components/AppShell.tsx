import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../theme/ThemeProvider";
import { SystemEventToasts } from "./SystemEventToasts";

type AppShellProps = {
  readonly title: string;
  readonly children: JSX.Element | readonly JSX.Element[];
};

export const AppShell = ({ title, children }: AppShellProps): JSX.Element => {
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = state.roles?.includes("admin") ?? false;
  const { theme, toggle } = useTheme();

  return (
    <div className="shell">
      <aside className="shell-sidebar">
        <div className="logo" onClick={() => navigate("/inbox")}>NotifyFlux</div>
        <nav>
          <NavLink to="/inbox" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Inbox</NavLink>
          <NavLink to="/realtime-log" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Realtime Log</NavLink>
          {isAdmin && <NavLink to="/admin" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>Admin</NavLink>}
        </nav>
        <div className="sidebar-footer">
          <div className="tenant-pill">Tenant: {state.tenantId ?? "-"}</div>
        </div>
      </aside>
      <main className="shell-main">
        <header className="shell-header">
          <div>
            <p className="eyebrow">Multi-tenant real-time notifications</p>
            <h1>{title}</h1>
          </div>
          <div className="user-chip">
            <button type="button" className="button-secondary" onClick={() => toggle()} aria-label="Toggle theme">
              {theme === "dark" ? "Light" : "Dark"} mode
            </button>
            <div>
              <div className="label">{state.userId ?? "unknown user"}</div>
              <div className="muted small">{state.roles?.join(", ") ?? "roles: none"}</div>
            </div>
            <button type="button" onClick={() => logout()}>Logout</button>
          </div>
        </header>
        <div className="shell-content">
          {children}
        </div>
      </main>
      <SystemEventToasts />
    </div>
  );
};
