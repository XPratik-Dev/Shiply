"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

type Theme = "light" | "dark";

function readCookieTheme(): Theme | null {
  const match = document.cookie.match(/(?:^|; )theme=(dark|light)(?:;|$)/);
  return match?.[1] === "dark" || match?.[1] === "light" ? match[1] : null;
}

function readTheme(): Theme {
  if (typeof window === "undefined") return "light";

  try {
    const storedTheme = window.localStorage.getItem("theme");
    if (storedTheme === "dark" || storedTheme === "light") return storedTheme;
  } catch {}

  const cookieTheme = readCookieTheme();
  if (cookieTheme) return cookieTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

function saveTheme(theme: Theme) {
  try {
    window.localStorage.setItem("theme", theme);
  } catch {}

  document.cookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Lax`;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const nextTheme = document.documentElement.classList.contains("dark") ? "dark" : readTheme();
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = document.documentElement.classList.contains("dark") ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    saveTheme(nextTheme);
  }

  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      title={isDark ? "Use light mode" : "Use dark mode"}
      aria-label={isDark ? "Use light mode" : "Use dark mode"}
    >
      {isDark ? (
        <Sun className="h-4 w-4" aria-hidden />
      ) : (
        <Moon className="h-4 w-4" aria-hidden />
      )}
    </Button>
  );
}
