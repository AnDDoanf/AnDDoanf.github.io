"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function AboutVideo() {
  const { t } = useI18n();
  const [isExpanded, setIsExpanded] = useState(false);
  const [frameHeight, setFrameHeight] = useState(900);
  const frameRef = useRef(null);
  const resizeObserverRef = useRef(null);

  useEffect(() => {
    return () => resizeObserverRef.current?.disconnect();
  }, []);

  function syncFrameHeight() {
    const frame = frameRef.current;
    const document = frame?.contentDocument;
    if (!document) return;

    const nextHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body?.scrollHeight || 0
    );

    if (nextHeight) setFrameHeight(nextHeight);
  }

  function handleFrameLoad() {
    const document = frameRef.current?.contentDocument;
    if (!document) return;

    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = new ResizeObserver(syncFrameHeight);
    resizeObserverRef.current.observe(document.documentElement);
    if (document.body) resizeObserverRef.current.observe(document.body);

    syncFrameHeight();
  }

  return (
    <section id="portfolio-about" className="portfolio-section">
      <div className="portfolio-about-heading">
        <h1 className="portfolio-section-title">{t("portfolio.moreAboutMe")}</h1>

        <button
          type="button"
          className="portfolio-about-toggle"
          aria-expanded={isExpanded}
          aria-controls="portfolio-me-embed"
          onClick={() => setIsExpanded((current) => !current)}
        >
          {isExpanded ? t("portfolio.showLess") : t("portfolio.moreAboutMeButton")}
          <i
            className={`bi ${isExpanded ? "bi-chevron-up" : "bi-chevron-down"}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {isExpanded && (
        <iframe
          id="portfolio-me-embed"
          ref={frameRef}
          className="portfolio-me-frame"
          src="/me"
          title="More about Thuan An Doan"
          style={{ height: `${frameHeight}px` }}
          onLoad={handleFrameLoad}
          scrolling="no"
        />
      )}
    </section>
  )
}
