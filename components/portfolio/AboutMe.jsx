"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function AboutMe() {
  const { t, lang } = useI18n();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFrameMounted, setIsFrameMounted] = useState(false);
  const [isFrameReady, setIsFrameReady] = useState(false);
  const [frameHeight, setFrameHeight] = useState(900);
  const frameRef = useRef(null);
  const resizeObserverRef = useRef(null);

  useEffect(() => {
    return () => resizeObserverRef.current?.disconnect();
  }, []);

  useEffect(() => {
    if (isExpanded || !isFrameMounted) return;

    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 450;
    const timeout = window.setTimeout(() => {
      resizeObserverRef.current?.disconnect();
      setIsFrameMounted(false);
      setIsFrameReady(false);
    }, delay);
    return () => window.clearTimeout(timeout);
  }, [isExpanded, isFrameMounted]);

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

    // Apply the embedded layout before revealing the iframe's first paint.
    document.documentElement.classList.add("is-embedded");

    resizeObserverRef.current?.disconnect();
    resizeObserverRef.current = new ResizeObserver(syncFrameHeight);
    resizeObserverRef.current.observe(document.documentElement);
    if (document.body) resizeObserverRef.current.observe(document.body);

    syncFrameHeight();
    setIsFrameReady(true);
  }

  return (
    <section id="portfolio-about" className="portfolio-section portfolio-about-section">
      <div className="portfolio-about-heading">
        <h1 className="portfolio-section-title">{t("portfolio.moreAboutMe")}</h1>

        <button
          type="button"
          className="portfolio-about-toggle"
          aria-expanded={isExpanded}
          aria-controls="portfolio-me-embed"
          onClick={() => {
            if (!isExpanded) setIsFrameMounted(true);
            setIsExpanded((current) => !current);
          }}
        >
          {isExpanded ? t("portfolio.showLess") : t("portfolio.moreAboutMeButton")}
          <i
            className="bi bi-chevron-down"
            aria-hidden="true"
          />
        </button>
      </div>

      <div
        id="portfolio-me-embed"
        className={`portfolio-me-panel${isExpanded ? " is-open" : ""}`}
        style={{ height: isExpanded ? (isFrameReady ? `${frameHeight}px` : "520px") : "0px" }}
        aria-hidden={!isExpanded}
        aria-busy={isExpanded && !isFrameReady}
        inert={!isExpanded}
      >
      {isFrameMounted && !isFrameReady && (
        <div
          className="portfolio-me-skeleton"
          role="status"
          aria-label={lang === "vi" ? "Đang tải nội dung giới thiệu" : "Loading more about me"}
        >
          <div className="portfolio-me-skeleton-video" aria-hidden="true" />
          <div className="portfolio-me-skeleton-title" aria-hidden="true" />
          <div className="portfolio-me-skeleton-line" aria-hidden="true" />
          <div className="portfolio-me-skeleton-line" aria-hidden="true" />
          <div className="portfolio-me-skeleton-line short" aria-hidden="true" />
        </div>
      )}
      {isFrameMounted && (
        <iframe
          ref={frameRef}
          className="portfolio-me-frame"
          src="/me"
          title="More about Thuan An Doan"
          style={{
            height: `${frameHeight}px`,
            visibility: isFrameReady ? "visible" : "hidden",
            opacity: isFrameReady ? 1 : 0,
          }}
          onLoad={handleFrameLoad}
          scrolling="no"
        />
      )}
      </div>
    </section>
  )
}
