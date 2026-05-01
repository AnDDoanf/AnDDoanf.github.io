"use client";

import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import ScrollToTop from "@/components/ui/ScrollToTop";
import GoBack from "@/components/ui/GoBack";
import { useI18n } from "@/components/i18n/I18nProvider";

function extractHeadings(markdown) {
  return (markdown ?? "")
    .split("\n")
    .filter((line) => line.startsWith("## ") || line.startsWith("### "))
    .map((line) => {
      const level = line.startsWith("### ") ? 3 : 2;
      const text = line.replace(/^#{2,3}\s+/, "").replaceAll("*", "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w]+/g, "-")
        .replace(/(^-|-$)/g, "");

      return { text, id, level };
    });
}

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
                const text = String(children);
                const id = text
                  .toLowerCase()
                  .replace(/[^\w]+/g, "-")
                  .replace(/(^-|-$)/g, "");
                return <h2 id={id}>{children}</h2>;
              },
              h3: ({ children }) => {
                const text = String(children);
                const id = text
                  .toLowerCase()
                  .replace(/[^\w]+/g, "-")
                  .replace(/(^-|-$)/g, "");
                return <h3 id={id}>{children}</h3>;
              },
            }}
          >
            {content}
          </ReactMarkdown>
        )}

        <ScrollToTop />
        <GoBack href="/showroom" />
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

