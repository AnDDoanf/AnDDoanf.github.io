"use client";

import MarkdownContent from "@/components/blog/MarkdownContent";
import FaithTimeline from "@/components/me/FaithTimeline";
import HobbiesGrid from "@/components/me/HobbiesGrid";
import MeQandA from "@/components/me/MeQandA";
import VisionBoard from "@/components/me/VisionBoard";
import { useI18n } from "@/components/i18n/I18nProvider";

function localizeRecord(record, lang) {
  if (lang !== "vi") return record;

  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => {
      if (key.endsWith("Vi")) return [key, value];
      const localized = record[`${key}Vi`];
      return [key, localized ?? value];
    })
  );
}

function SectionBody({ section }) {
  switch (section.slug) {
    case "hobbies":
      return <HobbiesGrid items={section.items ?? []} />;
    case "faith-testimony":
      return <FaithTimeline milestones={section.milestones ?? []} />;
    case "vision-board":
      return <VisionBoard items={section.items ?? []} />;
    case "q-and-a":
      return <MeQandA items={section.items ?? []} />;
    default:
      return null;
  }
}

export default function MeSections({ sections }) {
  const { lang } = useI18n();

  return (
    <div className="me-sections">
      {sections.map((sourceSection) => {
        const section = localizeRecord(sourceSection, lang);
        section.items = sourceSection.items?.map((item) => localizeRecord(item, lang));
        section.milestones = sourceSection.milestones?.map((item) => localizeRecord(item, lang));

        return (
        <section
          id={section.slug}
          className={`portfolio-section me-section me-section-${section.slug}`}
          key={section.slug}
        >
          <div className="me-section-heading">
            <h1 className="portfolio-section-title">{section.title}</h1>
          </div>
          <div className="me-section-intro">
            <MarkdownContent content={section.content} />
          </div>
          <SectionBody section={section} />
        </section>
        );
      })}
    </div>
  );
}
