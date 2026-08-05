"use client";

import { experiences } from '@/data/portfolio/experiences'
import TimelineNode from '@/components/portfolio/TimelineNode'
import { useI18n } from "@/components/i18n/I18nProvider";

export default function ExperienceTimeline() {
  const { lang, t } = useI18n();
  return (
    <section id="portfolio-experience" className="portfolio-section">
      <h1 className="portfolio-section-title">{t("portfolio.experience")}</h1>

      <div className="portfolio-timeline">
        {experiences.map((exp, i) => (
          <TimelineNode
            key={i}
            data={exp}
            lang={lang}
            align={i % 2 === 0 ? 'left' : 'right'}
          />
        ))}
      </div>
    </section>
  )
}
