"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n/I18nProvider";
import LanguageToggle from "@/components/ui/LanguageToggle";

export default function MePageIntro() {
  const { t } = useI18n();

  return (
    <header className="me-hero me-standalone-only">
      <div className="me-language-toggle">
        <LanguageToggle />
      </div>
      <p className="me-kicker">{t("me.personBehindPortfolio")}</p>
      <h1>{t("me.hello")}</h1>
      <p className="me-intro">{t("me.intro")}</p>
      <Link className="me-back-link" href="/portfolio" target="_top">
        <i className="bi bi-arrow-left" aria-hidden="true" />
        {t("me.backToPortfolio")}
      </Link>
    </header>
  );
}
