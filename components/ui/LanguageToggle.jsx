"use client";

import { useI18n } from "@/components/i18n/I18nProvider";

export default function LanguageToggle() {
  const { lang, toggleLang, t } = useI18n();
  const ariaLabel = t("lang.toggleLabel");

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
