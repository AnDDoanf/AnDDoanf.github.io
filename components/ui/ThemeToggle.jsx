"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function ThemeToggle() {
  const { t } = useI18n();
  const [theme, setTheme] = useState("light");
  const nextTheme = theme === "light" ? "dark" : "light";
  const nextThemeLabel = t(`theme.${nextTheme}`);
  const toggleLabel = t("theme.switchTo", { theme: nextThemeLabel });

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }

  return (
    <button
      type="button"
      className="theme-icon"
      onClick={toggleTheme}
      aria-label={toggleLabel}
      title={toggleLabel}
    >
      {theme === "light" ? (
        <Sun size={22} strokeWidth={2.2} aria-hidden="true" />
      ) : (
        <Moon size={22} strokeWidth={2.2} aria-hidden="true" />
      )}
    </button>

  );
}
