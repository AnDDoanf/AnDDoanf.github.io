"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

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
    <div
    className="theme-icon"
    onClick={toggleTheme}
    aria-label="Toggle theme"
    >
      {theme === "light" ? (
      <i className="bi bi-brightness-high-fill" />
      ) : (
      <i className="bi bi-moon-stars-fill" />
      )}
    </div>

  );
}
