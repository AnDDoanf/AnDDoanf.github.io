"use client";

import { summary, summaryVi } from '@/data/portfolio/summary'
import { useI18n } from "@/components/i18n/I18nProvider";

export default function Summary() {
  const { lang, t } = useI18n();
  return (
    <section id="portfolio-summary" className="portfolio-section">
        <h1 className="portfolio-section-title">{t("portfolio.summary")}</h1>
        <p className="portfolio-summary-text">{lang === "vi" ? summaryVi : summary}</p>
    </section>
  )
}
