"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";

const tocItems = [
  { id: 'portfolio-hero', labelKey: 'portfolio.intro' },
  { id: 'portfolio-summary', labelKey: 'portfolio.summary' },
  { id: 'portfolio-experience', labelKey: 'portfolio.experience' },
  { id: 'portfolio-skills', labelKey: 'portfolio.skills' },
  { id: 'portfolio-projects', labelKey: 'portfolio.projects' },
  // { id: 'portfolio-about', labelKey: 'portfolio.moreAboutMe' },
];

export default function PortfolioTOC() {
  const { t } = useI18n();
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px", // Trigger active state when section passes through the center of viewport
      threshold: 0,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    tocItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => {
      tocItems.forEach((item) => {
        const el = document.getElementById(item.id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  return (
    <aside className="portfolio-toc">
      <p className="portfolio-toc-title">{t("portfolio.contents")}</p>

      <ul className="portfolio-toc-list">
        {tocItems.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`portfolio-toc-link ${isActive ? "active" : ""}`}
              >
                {t(item.labelKey)}
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
