import fs from "fs";
import matter from "gray-matter";
import { notFound } from "next/navigation";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import productions from "@/data/showroom/productions";
import ScrollToTop from "@/components/ui/ScrollToTop";
import GoBack from "@/components/ui/GoBack";
import { getLang, getMessages, t } from "@/app/utils/i18n";

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

function getProduction(slug) {
  const production = productions.find((p) => p.slug === slug);
  if (!production) notFound();
  return production;
}

function getProductionContent(slug) {
  const file = `data/showroom/productions/${slug}.md`;
  if (!slug || !fs.existsSync(file)) {
    notFound();
  }
  return matter(fs.readFileSync(file, "utf-8"));
}

export async function generateStaticParams() {
  return productions
    .filter((p) => p.slug)
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const production = productions.find((p) => p.slug === slug);
  if (!production) return {};
  return { title: production.title ?? slug };
}

export default async function ShowroomProductionPage({ params }) {
  const { slug } = await params;
  const production = getProduction(slug);
  const doc = getProductionContent(slug);
  const lang = getLang();
  const messages = getMessages(lang);

  const title = doc.data?.title ?? production.title ?? slug;
  const description = production.description ?? "";
  const liveHref = production.liveHref ?? production.href ?? "";
  const repoHref = production.repoHref ?? "";
  const coverSrc = production.coverSrc ?? "";
  const coverAlt = production.coverAlt ?? title;
  const content = doc.content ?? "";

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
                {t(messages, "showroom.viewProduction")}
              </a>
            )}

            {repoHref && (
              <a
                className="showroom-action"
                href={repoHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t(messages, "showroom.viewRepo")}
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
          <p className="toc-title">{t(messages, "showroom.onThisPage")}</p>
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
