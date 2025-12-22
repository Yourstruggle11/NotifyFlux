import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { InboxPage } from "./pages/InboxPage";
import { RealtimeLogPage } from "./pages/RealtimeLogPage";
import { AdminPage } from "./pages/AdminPage";
import { useAuth } from "./hooks/useAuth";
import { AppShell } from "./components/AppShell";

const Protected = ({ children }: { readonly children: JSX.Element }): JSX.Element => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RequireAdmin = ({ children }: { readonly children: JSX.Element }): JSX.Element => {
  const { state } = useAuth();
  if (!state.roles?.includes("admin")) {
    return <Navigate to="/inbox" replace />;
  }
  return children;
};

const App = (): JSX.Element => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/inbox" element={<Protected><AppShell title="Inbox"><InboxPage /></AppShell></Protected>} />
    <Route path="/admin" element={<Protected><RequireAdmin><AppShell title="Admin Console"><AdminPage /></AppShell></RequireAdmin></Protected>} />
    <Route path="/realtime-log" element={<Protected><AppShell title="Realtime Log"><RealtimeLogPage /></AppShell></Protected>} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default App;
