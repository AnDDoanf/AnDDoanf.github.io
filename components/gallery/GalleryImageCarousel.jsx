"use client";

import { useEffect, useRef, useState } from "react";

import { useI18n } from "@/components/i18n/I18nProvider";

const DEFAULT_IMAGE_METRICS = {
  orientation: "unknown",
  aspectRatio: 4 / 5,
};

export default function GalleryImageCarousel({ gallery }) {
  const { t } = useI18n();
  const stageRef = useRef(null);
  const carouselRef = useRef(null);
  const wheelLockRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageMetrics, setImageMetrics] = useState(() => (
    gallery.images.map(() => DEFAULT_IMAGE_METRICS)
  ));
  const maxIndex = Math.max(0, gallery.images.length - 1);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === carouselRef.current);
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!carouselRef.current) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await carouselRef.current.requestFullscreen();
      }
    } catch (err) {
      console.error("Error attempting to toggle fullscreen:", err);
    }
  };

  function goToIndex(index) {
    const safeIndex = Math.max(0, Math.min(index, maxIndex));
    setActiveIndex(safeIndex);
  }

  function goToRelative(step) {
    goToIndex(activeIndex + step);
  }

  function rememberImageMetrics(index, event) {
    const { naturalWidth, naturalHeight } = event.currentTarget;

    if (!naturalWidth || !naturalHeight) return;

    const aspectRatio = naturalWidth / naturalHeight;
    const orientation = aspectRatio > 1.05
      ? "landscape"
      : aspectRatio < 0.95
        ? "portrait"
        : "square";

    setImageMetrics((current) => {
      const nextMetrics = {
        orientation,
        aspectRatio: Number(aspectRatio.toFixed(4)),
      };
      const existing = current[index];

      if (
        existing
        && existing.orientation === nextMetrics.orientation
        && Math.abs(existing.aspectRatio - nextMetrics.aspectRatio) < 0.001
      ) {
        return current;
      }

      const next = [...current];
      next[index] = nextMetrics;
      return next;
    });
  }

  function getSlidePosition(index) {
    const offset = index - activeIndex;

    if (offset === 0) return "active";
    if (offset === -1) return "prev";
    if (offset === 1) return "next";
    if (offset === -2) return "far-prev";
    if (offset === 2) return "far-next";
    return "hidden";
  }

  useEffect(() => {
    const stageNode = stageRef.current;
    if (!stageNode) return undefined;

    function handleStageWheel(event) {
      const verticalDelta = event.deltaY;

      if (Math.abs(verticalDelta) < 18) return;

      const allowPageScroll = activeIndex <= 0 || activeIndex >= maxIndex;

      if (allowPageScroll) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const now = Date.now();
      if (now - wheelLockRef.current < 420) {
        return;
      }

      wheelLockRef.current = now;
      setActiveIndex((currentIndex) => {
        const nextIndex = currentIndex + (verticalDelta > 0 ? 1 : -1);
        return Math.max(0, Math.min(nextIndex, maxIndex));
      });
    }

    stageNode.addEventListener("wheel", handleStageWheel, { passive: false });

    return () => {
      stageNode.removeEventListener("wheel", handleStageWheel);
    };
  }, [maxIndex]);

  function handleKeyDown(event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToRelative(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToRelative(1);
    }
  }

  return (
    <section className="gallery-viewer">
      <section
        ref={carouselRef}
        className={`gallery-carousel ${isFullscreen ? "is-fullscreen" : ""}`}
        aria-label={t("gallery.viewportLabel")}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div className="gallery-carousel-stage" ref={stageRef}>
          <button
            type="button"
            className="gallery-carousel-action-fullscreen"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? t("gallery.exitFullscreen") : t("gallery.enterFullscreen")}
            title={isFullscreen ? t("gallery.exitFullscreen") : t("gallery.enterFullscreen")}
          >
            <i className={`bi bi-${isFullscreen ? "fullscreen-exit" : "fullscreen"}`} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="gallery-carousel-action gallery-carousel-action-prev"
            onClick={() => goToRelative(-1)}
            disabled={activeIndex <= 0}
            aria-label={t("gallery.previous")}
          >
            <i className="bi bi-arrow-left" aria-hidden="true" />
          </button>

          {gallery.images.map((image, index) => {
            const position = getSlidePosition(index);
            const metrics = imageMetrics[index] ?? DEFAULT_IMAGE_METRICS;

            return (
              <button
                key={image.name}
                type="button"
                className="gallery-slide"
                data-position={position}
                data-orientation={metrics.orientation}
                onClick={() => goToIndex(index)}
                aria-label={`${t("gallery.openImage")} ${index + 1}`}
                aria-current={index === activeIndex ? "true" : "false"}
                style={{ "--gallery-slide-ratio": `${metrics.aspectRatio}` }}
              >
                <span className="gallery-slide-frame">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="gallery-slide-image"
                    loading={Math.abs(index - activeIndex) <= 1 ? "eager" : "lazy"}
                    onLoad={(event) => rememberImageMetrics(index, event)}
                  />
                </span>
              </button>
            );
          })}

          <button
            type="button"
            className="gallery-carousel-action gallery-carousel-action-next"
            onClick={() => goToRelative(1)}
            disabled={activeIndex >= maxIndex}
            aria-label={t("gallery.next")}
          >
            <i className="bi bi-arrow-right" aria-hidden="true" />
          </button>
        </div>

        <div className="gallery-slide-caption">
          <span className="gallery-slide-title">
            {gallery.images[activeIndex]?.caption ?? ""}
          </span>

          <div className="gallery-dots" aria-hidden="true">
            {gallery.images.map((image, index) => (
              <span
                key={image.name}
                className={`gallery-dot ${index === activeIndex ? "is-active" : ""}`}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="gallery-thumbnails" aria-label={t("gallery.viewportLabel")}>
        {gallery.images.map((image, index) => (
          <button
            key={image.name}
            type="button"
            className={`gallery-thumb ${index === activeIndex ? "is-active" : ""}`}
            onClick={() => goToIndex(index)}
            aria-label={`${t("gallery.openImage")} ${index + 1}`}
            aria-current={index === activeIndex ? "true" : "false"}
          >
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              onLoad={(event) => rememberImageMetrics(index, event)}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
