"use client";

import { useI18n } from "@/components/i18n/I18nProvider";

export default function TableOfContents({ headings }) {
  const { t } = useI18n();

  if (!headings.length) return null;

  return (
    <aside className="toc">
      <p className="toc-title">{t("posts.onThisPage")}</p>
      <ul>
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={heading.level === 3 ? "toc-sub" : ""}
          >
            <a href={`#${heading.id}`}>{heading.text}</a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
