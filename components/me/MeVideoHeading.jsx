"use client";

import { useI18n } from "@/components/i18n/I18nProvider";

export default function MeVideoHeading() {
  const { t } = useI18n();
  return <h1 className="portfolio-section-title">{t("portfolio.moreAboutMe")}</h1>;
}
