import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

type Theme = "dark" | "light";

type ThemeContextValue = {
  readonly theme: Theme;
  readonly toggle: () => void;
  readonly setTheme: (next: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "notifyflux_theme";

const readStoredTheme = (): Theme => {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  return "dark";
};

export const ThemeProvider = ({ children }: { readonly children: ReactNode }): JSX.Element => {
  const [theme, setTheme] = useState<Theme>(readStoredTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    toggle: () => setTheme((prev) => (prev === "dark" ? "light" : "dark")),
    setTheme
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
};
