"use client";

import { useI18n } from "@/components/i18n/I18nProvider";

export default function BlogPostMetaHeader({
  title,
  date,
  author,
  content = "",
  readingTime,
}) {
  const { lang, locale } = useI18n();
  const currentLang = lang || locale || "en";

  let dateStr = "";
  if (date) {
    try {
      const d = new Date(date);
      if (!Number.isNaN(d.getTime())) {
        dateStr = new Intl.DateTimeFormat(currentLang === "vi" ? "vi-VN" : "en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(d);
      }
    } catch {
      dateStr = String(date);
    }
  }

  // Calculate estimated reading time if not provided explicitly
  const displayReadingTime = (() => {
    if (readingTime) return readingTime;
    if (!content) return null;
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return currentLang === "vi" ? `${minutes} phút đọc` : `${minutes} min read`;
  })();

  return (
    <header className="post-header">
      <h1>{title}</h1>
      <div className="post-meta-bar">
        {dateStr && (
          <time dateTime={String(date)} className="post-meta-date">
            {dateStr}
          </time>
        )}
        {dateStr && author?.name && (
          <span className="post-meta-sep" aria-hidden="true" />
        )}
        {author?.name && (
          <span className="post-meta-author">{author.name}</span>
        )}
        {displayReadingTime && (
          <>
            <span className="post-meta-sep" aria-hidden="true" />
            <span className="post-meta-reading-time">
              <i className="bi bi-clock me-1" aria-hidden="true" style={{ marginRight: "0.3rem" }} />
              {displayReadingTime}
            </span>
          </>
        )}
      </div>
    </header>
  );
}
