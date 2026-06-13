"use client";

import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  createHeadingIdResolver,
  extractHeadings,
} from "@/app/utils/extractHeadings";

import ScrollToTop from "@/components/ui/ScrollToTop";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function ProductionDetailsClient({
  title,
  description,
  liveHref,
  repoHref,
  coverSrc,
  coverAlt,
  content,
}) {
  const { t } = useI18n();
  const headings = extractHeadings(content);
  const resolveHeadingId = createHeadingIdResolver(headings);

  return (
    <main className="post-layout">
      <article className="post-content">
        <h1>{title}</h1>

        {coverSrc && (
          <div className="card-cover showroom-cover">
            <Image
              src={coverSrc}
              alt={coverAlt}
              fill
              sizes="100vw"
              style={{ objectFit: "cover" }}
              priority={false}
            />
          </div>
        )}

        {(liveHref || repoHref) && (
          <div className="showroom-actions">
            {liveHref && (
              <a
                className="showroom-action showroom-action-primary"
                href={liveHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("showroom.viewProduction")}
              </a>
            )}

            {repoHref && (
              <a
                className="showroom-action"
                href={repoHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("showroom.viewRepo")}
              </a>
            )}
          </div>
        )}

        {description && <p className="card-excerpt">{description}</p>}

        {content && (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => {
                const id = resolveHeadingId(children, 2);
                return <h2 id={id}>{children}</h2>;
              },
              h3: ({ children }) => {
                const id = resolveHeadingId(children, 3);
                return <h3 id={id}>{children}</h3>;
              },
            }}
          >
            {content}
          </ReactMarkdown>
        )}

        <ScrollToTop />
      </article>

      {headings.length > 0 && (
        <aside className="toc">
          <p className="toc-title">{t("showroom.onThisPage")}</p>
          <ul>
            {headings.map((h) => (
              <li key={h.id} className={h.level === 3 ? "toc-sub" : ""}>
                <a href={`#${h.id}`}>{h.text}</a>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </main>
  );
}
