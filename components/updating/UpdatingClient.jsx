"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageToggle from "@/components/ui/LanguageToggle";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function UpdatingClient() {
  const { t } = useI18n();

  return (
    <main className="updating-page">
      <div className="theme-toggle-main">
        <div className="toggle-row">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>

      <div className="updating-card">
        <h1 className="updating-title">{t("updating.title")}</h1>

        <p className="updating-text">
          {t("updating.textLine1")}
          <br />
          {t("updating.textLine2")}
        </p>

        <div className="updating-divider" />

        <Link href="/" className="updating-back">
          {t("updating.goBack")}
        </Link>
      </div>
    </main>
  );
}

