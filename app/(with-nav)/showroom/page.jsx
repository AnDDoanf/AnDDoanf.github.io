"use client";

import Link from "next/link";
import GoBack from "@/components/ui/GoBack";
import productions from "@/data/showroom/productions";
import Image from "next/image";
import { useI18n } from "@/components/i18n/I18nProvider";

function getHrefLabel(href) {
  if (!href) return "";
  if (href.startsWith("/")) return "Internal link";
  try {
    return new URL(href).host;
  } catch {
    return href;
  }
}

function ProductionCard({ production }) {
  const { t } = useI18n();
  const slug = production.slug ?? "";
  const detailsHref = slug ? `/showroom/${slug}` : "";
  const liveHref = production.liveHref ?? production.href ?? "";
  const title = production.title ?? "Untitled";
  const description = production.description ?? "";
  const tags = production.tags ?? [];
  const hrefLabel = getHrefLabel(liveHref);
  const coverSrc = production.coverSrc ?? "";
  const coverAlt = production.coverAlt ?? title;

  const CardInner = (
    <>
      {coverSrc && (
        <div className="card-cover" aria-hidden="true">
          <Image
            src={coverSrc}
            alt={coverAlt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
            priority={false}
          />
        </div>
      )}

      <div className="card-header">
        <h2 className="card-title">{title}</h2>
        {liveHref && <i className="bi bi-box-arrow-up-right" aria-hidden="true" />}
      </div>

      {hrefLabel && <p className="card-date">{hrefLabel}</p>}
      {description && <p className="card-excerpt">{description}</p>}

      {tags.length > 0 && (
        <div className="card-tags">
          {tags.map((tag) => (
            <span key={tag} className="card-tag">
              <span className="card-tag-text">{tag}</span>
            </span>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="card">
      {CardInner}

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

        {detailsHref && (
          <Link className="showroom-action" href={detailsHref}>
            {t("showroom.viewDescription")}
          </Link>
        )}
      </div>
    </div>
  );
}

export default function ShowroomPage() {
  const { t } = useI18n();
  return (
    <section className="blog-post-container">
      <h1>{t("showroom.title")}</h1>
      <p>{t("showroom.subtitle")}</p>

      <div className="post-grid showroom-grid">
        {productions.map((production) => (
          <ProductionCard
            key={production.slug ?? `${production.title ?? "production"}:${production.liveHref ?? ""}`}
            production={production}
          />
        ))}
      </div>

      <GoBack href="/" />
    </section>
  );
}
