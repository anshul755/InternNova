/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const THEME_STORAGE_KEY = "internnova-theme";
const THEME_META_SELECTOR = 'meta[name="theme-color"]';

const ThemeContext = createContext(null);

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readStoredTheme() {
  if (typeof window === "undefined") return "system";

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" || stored === "system"
      ? stored
      : "system";
  } catch {
    return "system";
  }
}

function setThemeAttributes(theme) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;

  const meta = document.querySelector(THEME_META_SELECTOR);
  if (meta) {
    meta.setAttribute("content", theme === "dark" ? "#07120c" : "#eef5eb");
  }
}

export function ThemeProvider({ children }) {
  const [themePreference, setThemePreference] = useState(readStoredTheme);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  const resolvedTheme =
    themePreference === "system" ? systemTheme : themePreference;

  useEffect(() => {
    setThemeAttributes(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    handleChange(mediaQuery);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      if (themePreference === "system") {
        window.localStorage.removeItem(THEME_STORAGE_KEY);
      } else {
        window.localStorage.setItem(THEME_STORAGE_KEY, themePreference);
      }
    } catch {
      // Ignore storage failures and keep the in-memory theme active.
    }
  }, [themePreference]);

  const setTheme = useCallback((nextTheme) => {
    setThemePreference(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemePreference((currentPreference) => {
      const currentResolved =
        currentPreference === "system" ? getSystemTheme() : currentPreference;
      return currentResolved === "dark" ? "light" : "dark";
    });
  }, []);

  const value = useMemo(
    () => ({
      themePreference,
      resolvedTheme,
      isDark: resolvedTheme === "dark",
      isLight: resolvedTheme === "light",
      isSystem: themePreference === "system",
      setTheme,
      toggleTheme,
    }),
    [resolvedTheme, setTheme, themePreference, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }

  return context;
}
