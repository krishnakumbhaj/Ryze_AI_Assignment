"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type PreviewTheme = "light" | "dark";

interface ThemeContextType {
  theme: PreviewTheme;
  toggleTheme: () => void;
  setTheme: (theme: PreviewTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function PreviewThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<PreviewTheme>("light");

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const setTheme = useCallback((newTheme: PreviewTheme) => {
    setThemeState(newTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function usePreviewTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("usePreviewTheme must be used within a PreviewThemeProvider");
  }
  return context;
}

// Theme-aware class helper
export function getThemeClasses(theme: PreviewTheme) {
  return {
    bg: theme === "dark" ? "bg-gray-900" : "bg-white",
    bgSecondary: theme === "dark" ? "bg-gray-800" : "bg-gray-50",
    bgCard: theme === "dark" ? "bg-gray-800" : "bg-white",
    text: theme === "dark" ? "text-gray-100" : "text-gray-900",
    textSecondary: theme === "dark" ? "text-gray-400" : "text-gray-600",
    textMuted: theme === "dark" ? "text-gray-500" : "text-gray-500",
    border: theme === "dark" ? "border-gray-700" : "border-gray-200",
    inputBg: theme === "dark" ? "bg-gray-700" : "bg-white",
    inputBorder: theme === "dark" ? "border-gray-600" : "border-gray-300",
    inputText: theme === "dark" ? "text-gray-100" : "text-gray-900",
    inputPlaceholder: theme === "dark" ? "placeholder:text-gray-500" : "placeholder:text-gray-400",
    hover: theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100",
    shadow: theme === "dark" ? "shadow-lg shadow-black/20" : "shadow-sm",
  };
}
