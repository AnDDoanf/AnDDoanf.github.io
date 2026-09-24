"use client";

import { useI18n } from "@/components/i18n/I18nProvider";

export default function BlogPostMetaHeader({
  title,
  date,
  author,
}) {
  const { locale } = useI18n();

  let dateStr = "";
  if (date) {
    try {
      const d = new Date(date);
      if (!Number.isNaN(d.getTime())) {
        dateStr = new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(d);
      }
    } catch {
      dateStr = String(date);
    }
  }

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
      </div>
    </header>
  );
}
