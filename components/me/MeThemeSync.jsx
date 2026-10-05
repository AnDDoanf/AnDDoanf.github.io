"use client";

import { useEffect } from "react";
import { subscribeToTheme } from "@/components/ui/themeState";

export default function MeThemeSync() {
  useEffect(() => {
    document.documentElement.classList.toggle("is-embedded", window.self !== window.top);

    const unsubscribe = subscribeToTheme(() => {});

    return () => {
      unsubscribe();
      document.documentElement.classList.remove("is-embedded");
    };
  }, []);

  return null;
}
