"use client";

import { useEffect } from "react";

export default function MeThemeSync() {
  useEffect(() => {
    document.documentElement.classList.toggle("is-embedded", window.self !== window.top);

    const applySavedTheme = () => {
      const theme = localStorage.getItem("theme") || "light";
      document.documentElement.setAttribute("data-theme", theme);
    };

    applySavedTheme();
    window.addEventListener("storage", applySavedTheme);

    return () => {
      window.removeEventListener("storage", applySavedTheme);
      document.documentElement.classList.remove("is-embedded");
    };
  }, []);

  return null;
}
