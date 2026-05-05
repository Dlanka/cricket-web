import { useEffect, useMemo, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "crickapp.theme.preference";

const getStoredPreference = (): ThemePreference => {
  if (typeof window === "undefined") return "dark";
  const value = window.localStorage.getItem(STORAGE_KEY);
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }
  return "dark";
};

const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const resolveTheme = (preference: ThemePreference): ResolvedTheme => {
  if (preference === "system") {
    return getSystemTheme();
  }
  return preference;
};

const applyTheme = (theme: ResolvedTheme) => {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
};

export const useThemePreference = () => {
  const [preference, setPreference] = useState<ThemePreference>(() =>
    getStoredPreference(),
  );
  const resolvedTheme = useMemo(
    () => resolveTheme(preference),
    [preference],
  );

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, preference);
  }, [preference]);

  useEffect(() => {
    if (typeof window === "undefined" || preference !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(media.matches ? "dark" : "light");
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [preference]);

  const toggleTheme = () => {
    setPreference((current) => {
      const currentResolved = resolveTheme(current);
      return currentResolved === "dark" ? "light" : "dark";
    });
  };

  return {
    preference,
    resolvedTheme,
    setPreference,
    toggleTheme,
  };
};

