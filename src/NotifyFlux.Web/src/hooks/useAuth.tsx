import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { login as loginApi } from "../api/authApi";
import { AuthState, Role } from "../types";
import { connectSocket, disconnectSocket } from "../socket/connection";

type AuthContextValue = {
  readonly state: AuthState;
  readonly login: (tenantId: string, email: string, password: string) => Promise<void>;
  readonly logout: () => void;
  readonly isAuthenticated: boolean;
};

const defaultState: AuthState = {
  tenantId: null,
  userId: null,
  roles: null,
  token: null
};

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_STORAGE_KEY = "notifyflux_auth";

const loadStoredAuth = (): AuthState => {
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return defaultState;
  }
  try {
    const parsed = JSON.parse(raw) as AuthState;
    return parsed;
  } catch {
    return defaultState;
  }
};

export const AuthProvider = ({ children }: { readonly children: ReactNode }): JSX.Element => {
  const [state, setState] = useState<AuthState>(loadStoredAuth);

  useEffect(() => {
    if (state.token) {
      connectSocket(state.token);
    }
  }, [state.token]);

  const login = useCallback(async (tenantId: string, email: string, password: string): Promise<void> => {
    const response = await loginApi(tenantId, email, password);
    const roles: ReadonlyArray<Role> = response.user.roles;
    const newState: AuthState = {
      tenantId,
      userId: response.user.userId,
      roles,
      token: response.token
    };
    setState(newState);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newState));
    connectSocket(response.token);
  }, []);

  const logout = useCallback((): void => {
    setState(defaultState);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    disconnectSocket();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    state,
    login,
    logout,
    isAuthenticated: Boolean(state.token)
  }), [state, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
