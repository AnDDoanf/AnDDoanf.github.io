"use client";

import GoBack from "@/components/ui/GoBack";
import GalleryImageCarousel from "@/components/gallery/GalleryImageCarousel";
import GalleryPhotobookClient from "@/components/gallery/GalleryPhotobookClient";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function GalleryDetailsClient({ gallery }) {
  const { t } = useI18n();
  const imageLabel = gallery.imageCount === 1
    ? t("gallery.imageSingular")
    : t("gallery.imagePlural");

  const summaryPills = gallery.type === "photobook"
    ? [t("gallery.photobook"), "PDF"]
    : [`${gallery.imageCount} ${imageLabel}`, gallery.style];

  return (
    <main className={`gallery-detail gallery-style-${gallery.style}`}>
      <header className="gallery-header">
        <div className="gallery-header-copy">
          <p className="gallery-kicker">{t("gallery.label")}</p>
          <h1>{gallery.title}</h1>

          {gallery.description && (
            <p className="gallery-description">{gallery.description}</p>
          )}
        </div>

        <div className="gallery-summary">
          {summaryPills.map((pill) => (
            <span className="gallery-summary-pill" key={pill}>
              {pill}
            </span>
          ))}
        </div>
      </header>

      {gallery.type === "photobook" ? (
        <GalleryPhotobookClient gallery={gallery} />
      ) : (
        <GalleryImageCarousel gallery={gallery} />
      )}

      <GoBack href="/gallery" />
    </main>
  );
}
