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

function formatMessage(message, params) {
  if (typeof message !== "string" || !params) {
    return message;
  }

  return Object.entries(params).reduce((nextMessage, [key, value]) => {
    return nextMessage.replaceAll(`{${key}}`, String(value));
  }, message);
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

    const syncLanguage = (event) => {
      if (event.key !== "lang") return;
      const next = event.newValue === "vi" ? "vi" : "en";
      setLangState(next);
      document.documentElement.lang = next;
    };

    window.addEventListener("storage", syncLanguage);
    return () => window.removeEventListener("storage", syncLanguage);
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
      t: (key, params) => formatMessage(resolve(messages, key), params),
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
