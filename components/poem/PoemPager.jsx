"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function PoemPager({ poems }) {
  const { t } = useI18n();
  const activePoemRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [isListOpen, setIsListOpen] = useState(false);

  useEffect(() => {
    activePoemRef.current?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [index]);

  if (!poems?.length) {
    return null;
  }

  const prev = () => {
    if (index > 0) {
      setIndex(index - 1);
      setIsListOpen(false);
    }
  };
  const next = () => {
    if (index < poems.length - 1) {
      setIndex(index + 1);
      setIsListOpen(false);
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
            <button
              type="button"
              className="poem-nav-button"
              onClick={prev}
              disabled={index === 0}
            >
              <i className="bi bi-arrow-left" aria-hidden="true" />
              <span>{t("poetry.previous")}</span>
            </button>

            <button
              type="button"
              className="poem-progress"
              onClick={() => setIsListOpen(!isListOpen)}
              aria-live="polite"
              aria-expanded={isListOpen}
            >
              <p className="poem-progress-label">{t("poetry.progressLabel")}</p>
              <span className="poem-progress-value">
                {index + 1} / {poems.length}
                <span className="poem-progress-chevron">
                  <i className={`bi bi-chevron-${isListOpen ? "up" : "down"}`} aria-hidden="true" />
                </span>
              </span>
            </button>

            <button
              type="button"
              className="poem-nav-button poem-nav-button-next"
              onClick={next}
              disabled={index === poems.length - 1}
            >
              <span>{t("poetry.next")}</span>
              <i className="bi bi-arrow-right" aria-hidden="true" />
            </button>
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
                  onClick={() => {
                    setIndex(poemIndex);
                    setIsListOpen(false);
                  }}
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
