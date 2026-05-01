"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function readCookieLang() {
  try {
    const match = document.cookie.match(/(?:^|;\s*)lang=([^;]+)/);
    return match?.[1] === "vi" ? "vi" : "en";
  } catch {
    return "en";
  }
}

export default function LanguageToggle({ initialLang = "en", labels }) {
  const router = useRouter();
  const [lang, setLang] = useState(initialLang === "vi" ? "vi" : "en");

  useEffect(() => {
    const cookieLang = readCookieLang();
    setLang(cookieLang);
    document.documentElement.lang = cookieLang;
  }, []);

  const nextLang = useMemo(() => (lang === "en" ? "vi" : "en"), [lang]);

  function toggleLang() {
    const next = nextLang;
    document.cookie = `lang=${next}; path=/; max-age=31536000; samesite=lax`;
    setLang(next);
    document.documentElement.lang = next;
    router.refresh();
  }

  const ariaLabel =
    labels?.toggleLabel ||
    (lang === "en" ? "Switch language" : "Chuyển ngôn ngữ");

  return (
    <button
      type="button"
      className="theme-icon"
      onClick={toggleLang}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {lang.toUpperCase()}
    </button>
  );
}

