"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useI18n } from "@/components/i18n/I18nProvider";
import Button from "@/components/ui/Button";

export default function PoemPager({ poems }) {
  const { t } = useI18n();
  const activePoemRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [isListOpen, setIsListOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!poems?.length) return;

    const syncPoemFromUrl = () => {
      let slug;
      try {
        slug = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        slug = "";
      }
      const poemIndex = poems.findIndex(poem => poem.slug === slug);
      const nextIndex = poemIndex >= 0 ? poemIndex : 0;
      setIndex(nextIndex);
      setIsListOpen(false);

      if (poemIndex < 0) {
        const url = new URL(window.location.href);
        url.hash = poems[nextIndex].slug;
        window.history.replaceState(window.history.state, "", url);
      }
    };

    syncPoemFromUrl();
    window.addEventListener("hashchange", syncPoemFromUrl);
    window.addEventListener("popstate", syncPoemFromUrl);
    return () => {
      window.removeEventListener("hashchange", syncPoemFromUrl);
      window.removeEventListener("popstate", syncPoemFromUrl);
    };
  }, [poems]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const updateViewport = () => {
      setIsMobile(mediaQuery.matches);
      if (!mediaQuery.matches) setIsListOpen(false);
    };

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    activePoemRef.current?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [index]);

  if (!poems?.length) {
    return null;
  }

  const selectPoem = (poemIndex) => {
    const url = new URL(window.location.href);
    url.hash = poems[poemIndex].slug;
    if (url.href !== window.location.href) {
      window.history.pushState(window.history.state, "", url);
    }
    setIndex(poemIndex);
    setIsListOpen(false);
  };

  const prev = () => {
    if (index > 0) {
      selectPoem(index - 1);
    }
  };
  const next = () => {
    if (index < poems.length - 1) {
      selectPoem(index + 1);
    }
  };
  const currentPoem = poems[index];

  return (
    <div className="poem-layout">
      {isListOpen && (
        <div
          className="poem-toc-backdrop"
          onClick={() => setIsListOpen(false)}
        />
      )}
      <section className="poem-book" aria-label={t("poetry.readerLabel")}>
        <article className="poem-page" key={currentPoem.slug}>
          <div className="poem-controls">
            <Button
              variant="subtle"
              size="sm"
              icon="bi-arrow-left"
              className="poem-nav-button"
              onClick={prev}
              disabled={index === 0}
            >
              {t("poetry.previous")}
            </Button>

            <button
              type="button"
              className="poem-progress"
              disabled={!isMobile}
              onClick={() => setIsListOpen(!isListOpen)}
              aria-live="polite"
              aria-expanded={isMobile ? isListOpen : undefined}
            >
              <p className="poem-progress-label">{t("poetry.progressLabel")}</p>
              <span className="poem-progress-value">
                {index + 1} / {poems.length}
                <span className="poem-progress-chevron">
                  <i className={`bi bi-chevron-${isListOpen ? "up" : "down"}`} aria-hidden="true" />
                </span>
              </span>
            </button>

            <Button
              variant="subtle"
              size="sm"
              icon="bi-arrow-right"
              iconPosition="right"
              className="poem-nav-button poem-nav-button-next"
              onClick={next}
              disabled={index === poems.length - 1}
            >
              {t("poetry.next")}
            </Button>
          </div>

          <div className="poem-page-body">
            <h1 className="poem-title">{currentPoem.title}</h1>

            <div className="poem-content">
              <ReactMarkdown>{currentPoem.content}</ReactMarkdown>
            </div>
          </div>
        </article>
      </section>

      <aside className={`poem-toc ${isListOpen ? "is-open" : ""}`} aria-label={t("poetry.listLabel")}>
        <div className="poem-toc-header">
          <h2>{t("poetry.listTitle")}</h2>
          <p>{t("poetry.collectionSummary", { count: poems.length })}</p>
        </div>

        <ul>
          {poems.map((poem, poemIndex) => {
            const isActive = poemIndex === index;

            return (
              <li
                key={poem.slug}
                className={isActive ? "active" : ""}
                ref={isActive ? activePoemRef : null}
              >
                <button
                  type="button"
                  onClick={() => selectPoem(poemIndex)}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span className="poem-toc-index">
                    {String(poemIndex + 1).padStart(2, "0")}
                  </span>
                  <span className="poem-toc-title">{poem.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
