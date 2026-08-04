"use client";

import Image from "next/image";
import Link from "next/link";

import { useI18n } from "@/components/i18n/I18nProvider";

function GalleryCardCover({ gallery, t }) {
  if (gallery.coverSrc) {
    return (
      <div className="card-cover gallery-card-cover" aria-hidden="true">
        <Image
          src={gallery.coverSrc}
          alt={gallery.coverAlt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: "cover" }}
          priority={false}
        />
      </div>
    );
  }

  return (
    <div
      className="card-cover gallery-card-cover gallery-card-cover-fallback"
      aria-hidden="true"
    >
      <div className="gallery-card-cover-book">
        <span className="gallery-card-cover-spine" />
        <span className="gallery-card-cover-page gallery-card-cover-page-back" />
        <span className="gallery-card-cover-page gallery-card-cover-page-front" />
      </div>
      <span className="gallery-card-cover-label">{t("gallery.photobook")}</span>
    </div>
  );
}

function GalleryCard({ gallery }) {
  const { t } = useI18n();
  const imageLabel = gallery.imageCount === 1
    ? t("gallery.imageSingular")
    : t("gallery.imagePlural");
  const cardMeta = gallery.type === "photobook"
    ? t("gallery.photobook")
    : `${gallery.imageCount} ${imageLabel}`;

  return (
    <article className="card gallery-card">
      <Link className="gallery-card-link" href={`/gallery/${gallery.slug}`}>
        <GalleryCardCover gallery={gallery} t={t} />

        <div className="gallery-card-body">
          <p className="gallery-card-meta">{cardMeta}</p>
          <h2 className="gallery-card-title">{gallery.title}</h2>

          {gallery.description && (
            <p className="gallery-card-description">{gallery.description}</p>
          )}
        </div>
      </Link>
    </article>
  );
}

export default function GalleryPageClient({ galleries }) {
  const { t } = useI18n();

  return (
    <section className="blog-post-container gallery-index-page">
      {galleries.length > 0 ? (
        <div className="post-grid gallery-grid">
          {galleries.map((gallery) => (
            <GalleryCard key={gallery.slug} gallery={gallery} />
          ))}
        </div>
      ) : (
        <p className="gallery-empty">{t("gallery.empty")}</p>
      )}
    </section>
  );
}
