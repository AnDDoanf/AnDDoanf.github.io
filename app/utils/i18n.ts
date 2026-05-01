import { cookies } from "next/headers";

import en from "@/data/i18n/en.json";
import vi from "@/data/i18n/vi.json";

export type Lang = "en" | "vi";

export function getLang(): Lang {
  const value = cookies().get("lang")?.value;
  return value === "vi" ? "vi" : "en";
}

export function getMessages(lang: Lang) {
  return lang === "vi" ? vi : en;
}

export function t(messages: any, key: string) {
  const parts = (key ?? "").split(".").filter(Boolean);
  let current: any = messages;
  for (const part of parts) {
    current = current?.[part];
  }
  return typeof current === "string" ? current : key;
}

