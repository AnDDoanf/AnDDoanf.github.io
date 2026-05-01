"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import en from "@/data/i18n/en.json";
import vi from "@/data/i18n/vi.json";

const I18nContext = createContext(/** @type {any} */ (null));

function pickInitialLang() {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem("lang");
  if (saved === "vi" || saved === "en") return saved;
  const browser = navigator.language?.toLowerCase() ?? "";
  return browser.startsWith("vi") ? "vi" : "en";
}

function getMessages(lang) {
  return lang === "vi" ? vi : en;
}

function resolve(messages, key) {
  const parts = (key ?? "").split(".").filter(Boolean);
  let current = messages;
  for (const part of parts) current = current?.[part];
  return typeof current === "string" ? current : key;
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    const initial = pickInitialLang();
    setLangState(initial);
    document.documentElement.lang = initial;
  }, []);

  function setLang(nextLang) {
    const next = nextLang === "vi" ? "vi" : "en";
    setLangState(next);
    localStorage.setItem("lang", next);
    document.documentElement.lang = next;
  }

  const value = useMemo(() => {
    const messages = getMessages(lang);
    return {
      lang,
      setLang,
      toggleLang: () => setLang(lang === "en" ? "vi" : "en"),
      t: (key) => resolve(messages, key),
    };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within <I18nProvider>");
  }
  return ctx;
}
