"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { useI18n } from "@/components/i18n/I18nProvider";

const MEDIA_MAX_WIDTH = 420;
const MEDIA_MAX_HEIGHT = 350;
const FRAME_HORIZONTAL_SPACE = 24;
const FRAME_VERTICAL_SPACE = 42;
const COLUMN_GAP = 32;
const ROW_GAP = 38;
const MIN_SCALE = 0.65;
const MAX_SCALE = 1.8;
const DEFAULT_SCALE = 1.1;
const PDF_CACHE_LIMIT = 12;
const PDF_RENDER_WIDTH = 900;

function wrap(value, length) {
  return ((value % length) + length) % length;
}

function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.92));
}

function buildTiles(images, viewport, view, preferredColumns) {
  if (!images.length || !viewport.width || !viewport.height) return [];

  const measurements = images.map((image) => {
    const aspectRatio = Math.min(3, Math.max(0.35, image.aspectRatio || 4 / 3));
    const isWide = aspectRatio >= MEDIA_MAX_WIDTH / MEDIA_MAX_HEIGHT;
    const isPdf = image.mediaType === "pdf";
    const mediaWidth = isWide ? MEDIA_MAX_WIDTH : MEDIA_MAX_HEIGHT * aspectRatio;
    const mediaHeight = isWide ? MEDIA_MAX_WIDTH / aspectRatio : MEDIA_MAX_HEIGHT;
    return {
      image,
      width: mediaWidth + (isPdf ? 0 : FRAME_HORIZONTAL_SPACE),
      height: mediaHeight + (isPdf ? 0 : FRAME_VERTICAL_SPACE),
    };
  });
  const columnCount = Math.max(
    1,
    Math.min(images.length, preferredColumns || Math.ceil(Math.sqrt(images.length))),
  );
  const cellWidth = Math.max(...measurements.map(({ width }) => width)) + COLUMN_GAP;
  const cellHeight = Math.max(...measurements.map(({ height }) => height)) + ROW_GAP;
  const buffer = 380;
  const minWorldX = (-view.x - buffer) / view.scale;
  const maxWorldX = (viewport.width - view.x + buffer) / view.scale;
  const minWorldY = (-view.y - buffer) / view.scale;
  const maxWorldY = (viewport.height - view.y + buffer) / view.scale;
  const minColumn = Math.floor(minWorldX / cellWidth);
  const maxColumn = Math.ceil(maxWorldX / cellWidth);
  const minRow = Math.floor(minWorldY / cellHeight);
  const maxRow = Math.ceil(maxWorldY / cellHeight);
  const tiles = [];

  for (let row = minRow; row <= maxRow; row += 1) {
    for (let column = minColumn; column <= maxColumn; column += 1) {
      const localColumn = wrap(column, columnCount);
      const imageIndex = wrap(row * columnCount + localColumn, images.length);
      const measurement = measurements[imageIndex];
      tiles.push({
        key: `${row}:${column}`,
        image: measurement.image,
        x: column * cellWidth + (cellWidth - COLUMN_GAP - measurement.width) / 2,
        y: row * cellHeight + (cellHeight - ROW_GAP - measurement.height) / 2,
        width: measurement.width,
        height: measurement.height,
      });
    }
  }

  return tiles;
}

export default function InfiniteGalleryCanvas({ gallery }) {
  const { t } = useI18n();
  const cachedPdfPages = useMemo(() => (
    gallery.type === "pdf"
      ? gallery.images.filter((image) => /[\\/]/.test(image.name))
      : []
  ), [gallery]);
  const viewportRef = useRef(null);
  const dragRef = useRef(null);
  const movedRef = useRef(false);
  const visiblePdfNamesRef = useRef(new Set());
  const pdfRuntimeRef = useRef({
    generation: 0,
    document: null,
    loadingTask: null,
    cache: new Map(),
    pending: new Set(),
    queue: [],
    rendering: false,
  });
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [view, setView] = useState({ x: 20, y: 20, scale: DEFAULT_SCALE });
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [canvasImages, setCanvasImages] = useState(() => (
    gallery.type === "pdf"
      ? cachedPdfPages.map((image) => ({ ...image, mediaType: "pdf" }))
      : gallery.images
  ));
  const [mediaStatus, setMediaStatus] = useState(
    gallery.type === "pdf" && cachedPdfPages.length === 0 ? "loading" : "ready",
  );

  useEffect(() => {
    if (gallery.type !== "pdf") {
      setCanvasImages(gallery.images);
      setMediaStatus("ready");
      return undefined;
    }

    // A PDF gallery may include pre-rendered page images as a fast cache.
    // If it does not, render the PDF itself below.
    if (cachedPdfPages.length > 0) {
      setCanvasImages(cachedPdfPages.map((image) => ({
        ...image,
        mediaType: "pdf",
      })));
      setMediaStatus("ready");
      return undefined;
    }

    let cancelled = false;
    const runtime = pdfRuntimeRef.current;
    const generation = runtime.generation + 1;
    runtime.generation = generation;
    runtime.cache.forEach(({ src }) => URL.revokeObjectURL(src));
    runtime.cache.clear();
    runtime.pending.clear();
    runtime.queue.length = 0;
    runtime.document = null;

    async function loadPdfPages() {
      setCanvasImages([]);
      setMediaStatus("loading");

      const pdfjs = await import("pdfjs-dist/build/pdf.mjs");
      if (cancelled) return;
      pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.min.mjs";
      runtime.loadingTask = pdfjs.getDocument({ url: gallery.pdf.src });
      const pdfDocument = await runtime.loadingTask.promise;
      if (cancelled || runtime.generation !== generation) {
        await pdfDocument.destroy();
        return;
      }
      runtime.document = pdfDocument;
      const pages = [];

      for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
        if (cancelled) break;
        const page = await pdfDocument.getPage(pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        page.cleanup();
        pages.push({
          name: `pdf-page-${pageNumber}`,
          src: "",
          alt: `${gallery.title}, page ${pageNumber}`,
          caption: `Page ${pageNumber}`,
          aspectRatio: baseViewport.width / baseViewport.height,
          mediaType: "pdf",
          pageNumber,
        });
      }

      if (!cancelled) setCanvasImages(pages);
    }

    loadPdfPages().catch((error) => {
      if (cancelled) return;
      console.error("Failed to render gallery PDF", error);
      setMediaStatus("error");
    });

    return () => {
      cancelled = true;
      runtime.generation += 1;
      runtime.queue.length = 0;
      runtime.pending.clear();
      runtime.cache.forEach(({ src }) => URL.revokeObjectURL(src));
      runtime.cache.clear();
      runtime.loadingTask?.destroy?.();
      runtime.document?.destroy?.();
      runtime.loadingTask = null;
      runtime.document = null;
    };
  }, [cachedPdfPages, gallery]);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return undefined;

    const updateSize = () => {
      const rect = node.getBoundingClientRect();
      setViewport({ width: rect.width, height: rect.height });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const tiles = useMemo(
    () => buildTiles(canvasImages, viewport, view, gallery.columns),
    [canvasImages, gallery.columns, viewport, view],
  );

  useEffect(() => {
    if (gallery.type !== "pdf" || cachedPdfPages.length > 0) return;

    const runtime = pdfRuntimeRef.current;
    const visibleImages = new Map();
    tiles.forEach(({ image }) => visibleImages.set(image.name, image));
    if (selectedImage?.name) visibleImages.set(selectedImage.name, selectedImage);
    visiblePdfNamesRef.current = new Set(visibleImages.keys());
    runtime.queue = runtime.queue.filter(({ image }) => {
      if (visibleImages.has(image.name)) return true;
      runtime.pending.delete(image.name);
      return false;
    });

    visibleImages.forEach((image) => {
      const cached = runtime.cache.get(image.name);
      if (cached) {
        cached.lastUsed = performance.now();
        return;
      }
      if (!image.pageNumber || runtime.pending.has(image.name)) return;
      runtime.pending.add(image.name);
      runtime.queue.push({ image, generation: runtime.generation });
    });

    renderQueuedPdfPages();
  }, [cachedPdfPages.length, gallery.type, selectedImage, tiles]);

  async function renderQueuedPdfPages() {
    const runtime = pdfRuntimeRef.current;
    if (runtime.rendering || !runtime.document) return;
    runtime.rendering = true;

    while (runtime.queue.length > 0) {
      const job = runtime.queue.shift();
      let canvas = null;
      let page = null;

      try {
        if (job.generation !== runtime.generation || !runtime.document) continue;
        page = await runtime.document.getPage(job.image.pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        const targetWidth = Math.min(
          PDF_RENDER_WIDTH * Math.min(window.devicePixelRatio || 1, 1.25),
          1200,
        );
        const pageViewport = page.getViewport({ scale: targetWidth / baseViewport.width });
        canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { alpha: false });
        if (!context) throw new Error("Unable to create a PDF page canvas.");

        canvas.width = Math.floor(pageViewport.width);
        canvas.height = Math.floor(pageViewport.height);
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: context, viewport: pageViewport }).promise;
        const blob = await canvasToBlob(canvas);
        if (!blob || job.generation !== runtime.generation) continue;

        const src = URL.createObjectURL(blob);
        runtime.cache.set(job.image.name, { src, lastUsed: performance.now() });

        const protectedNames = visiblePdfNamesRef.current;
        const cacheLimit = Math.max(PDF_CACHE_LIMIT, protectedNames.size + 4);
        const evictionCandidates = [...runtime.cache.entries()]
          .filter(([name]) => !protectedNames.has(name))
          .sort(([, left], [, right]) => left.lastUsed - right.lastUsed);
        const evictedNames = new Set();
        while (runtime.cache.size > cacheLimit && evictionCandidates.length > 0) {
          const [name, cached] = evictionCandidates.shift();
          runtime.cache.delete(name);
          URL.revokeObjectURL(cached.src);
          evictedNames.add(name);
        }

        setCanvasImages((current) => current.map((image) => {
          if (image.name === job.image.name) return { ...image, src };
          if (evictedNames.has(image.name)) return { ...image, src: "" };
          return image;
        }));
        setMediaStatus("ready");
      } catch (error) {
        if (job.generation === runtime.generation) {
          console.error(`Failed to render ${job.image.caption}`, error);
        }
      } finally {
        runtime.pending.delete(job.image.name);
        page?.cleanup?.();
        if (canvas) {
          canvas.width = 0;
          canvas.height = 0;
        }
      }
    }

    runtime.rendering = false;
  }

  function resetView() {
    setView({ x: 20, y: 20, scale: DEFAULT_SCALE });
  }

  function rememberAspectRatio(imageName, event) {
    const target = event.currentTarget;
    const width = target.naturalWidth || target.videoWidth;
    const height = target.naturalHeight || target.videoHeight;
    if (!width || !height) return;
    const aspectRatio = width / height;

    setCanvasImages((current) => {
      let changed = false;
      const next = current.map((image) => {
        if (image.name !== imageName || Math.abs((image.aspectRatio || 0) - aspectRatio) < 0.001) {
          return image;
        }
        changed = true;
        return { ...image, aspectRatio };
      });
      return changed ? next : current;
    });
  }

  function zoomTo(nextScale, clientX, clientY) {
    const node = viewportRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const cursorX = clientX ?? rect.left + rect.width / 2;
    const cursorY = clientY ?? rect.top + rect.height / 2;
    const localX = cursorX - rect.left;
    const localY = cursorY - rect.top;

    setView((current) => {
      const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, nextScale(current.scale)));
      const worldX = (localX - current.x) / current.scale;
      const worldY = (localY - current.y) / current.scale;
      return {
        scale,
        x: localX - worldX * scale,
        y: localY - worldY * scale,
      };
    });
  }

  function handleWheel(event) {
    event.preventDefault();
    if (event.ctrlKey || event.metaKey) {
      zoomTo((scale) => scale * Math.exp(-event.deltaY * 0.004), event.clientX, event.clientY);
      return;
    }
    setView((current) => ({
      ...current,
      x: current.x - event.deltaX,
      y: current.y - event.deltaY,
    }));
  }

  function handlePointerDown(event) {
    if (event.button !== 0) return;
    movedRef.current = false;
    dragRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      originX: view.x,
      originY: view.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.clientX;
    const deltaY = event.clientY - drag.clientY;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 5) movedRef.current = true;
    setView((current) => ({
      ...current,
      x: drag.originX + deltaX,
      y: drag.originY + deltaY,
    }));
  }

  function endDrag(event) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setIsDragging(false);
  }

  return (
    <section
      className="infinite-gallery"
      aria-label={t("gallery.canvasAriaLabel", { title: gallery.title })}
    >
      <div
        ref={viewportRef}
        className={`infinite-gallery-viewport ${isDragging ? "is-dragging" : ""}`}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          className="infinite-gallery-plane"
          style={{ transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})` }}
        >
          {tiles.map((tile) => (
            <button
              key={tile.key}
              type="button"
              className="infinite-gallery-frame frame-0"
              data-media-type={tile.image.mediaType ?? "image"}
              style={{
                left: `${tile.x}px`,
                top: `${tile.y}px`,
                width: `${tile.width}px`,
                height: `${tile.height}px`,
                transform: "none",
              }}
              onClick={() => {
                if (!movedRef.current && tile.image.src) setSelectedImage(tile.image);
              }}
              aria-label={t("gallery.openMedia", {
                name: tile.image.pageNumber
                  ? t("gallery.pageNumber", { page: tile.image.pageNumber })
                  : tile.image.caption,
              })}
            >
              {tile.image.src ? (
                tile.image.mediaType === "video" ? (
                  <div className="infinite-gallery-media-wrapper">
                    <video
                      src={tile.image.src}
                      muted
                      playsInline
                      preload="metadata"
                      onLoadedMetadata={(event) => rememberAspectRatio(tile.image.name, event)}
                    />
                    <span className="infinite-gallery-video-badge" aria-hidden="true">
                      <i className="bi bi-play-circle-fill" />
                    </span>
                  </div>
                ) : (
                  <img
                    src={tile.image.src}
                    alt={tile.image.pageNumber
                      ? t("gallery.pdfPageAlt", { title: gallery.title, page: tile.image.pageNumber })
                      : tile.image.alt}
                    draggable="false"
                    loading="lazy"
                    onLoad={(event) => rememberAspectRatio(tile.image.name, event)}
                  />
                )
              ) : (
                <span className="infinite-gallery-page-placeholder" aria-hidden="true">
                  {tile.image.pageNumber
                    ? t("gallery.pageNumber", { page: tile.image.pageNumber })
                    : tile.image.caption}
                </span>
              )}
              {tile.image.mediaType !== "pdf" && <span>{tile.image.caption}</span>}
            </button>
          ))}
        </div>
      </div>

      {(mediaStatus === "error" || (mediaStatus === "loading" && !canvasImages.some((image) => image.src))) && (
        <div className="infinite-gallery-status" role="status">
          {mediaStatus === "error" ? t("gallery.pdfRenderError") : t("gallery.pdfRendering")}
        </div>
      )}

      <Link
        className="infinite-gallery-back"
        href="/gallery"
        aria-label={t("gallery.backToMapLabel")}
      >
        <i className="bi bi-arrow-left" />
        <span>{t("gallery.backToMap")}</span>
      </Link>

      <p className="infinite-gallery-hint">{t("gallery.canvasHint")}</p>

      <div className="infinite-gallery-controls" aria-label={t("gallery.canvasControls")}>
        <button type="button" onClick={() => zoomTo((scale) => scale * 1.2)} aria-label={t("gallery.zoomIn")}>+</button>
        <button type="button" onClick={() => zoomTo((scale) => scale / 1.2)} aria-label={t("gallery.zoomOut")}>−</button>
        <button type="button" onClick={resetView} aria-label={t("gallery.resetCanvas")}><i className="bi bi-crosshair" /></button>
      </div>

      {selectedImage && (
        <div
          className="infinite-gallery-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedImage(null)}
          aria-label={selectedImage.pageNumber
            ? t("gallery.pageNumber", { page: selectedImage.pageNumber })
            : selectedImage.caption}
        >
          <button type="button" className="infinite-gallery-lightbox-close" onClick={() => setSelectedImage(null)} aria-label={t("gallery.closeImage")}>
            <i className="bi bi-x-lg" />
          </button>
          {selectedImage.mediaType === "video" ? (
            <div
              className="infinite-gallery-lightbox-media"
              onClick={(event) => event.stopPropagation()}
            >
              <video
                src={selectedImage.src}
                controls
                autoPlay
                playsInline
                className="infinite-gallery-lightbox-video"
              />
            </div>
          ) : (
            <button
              type="button"
              className="infinite-gallery-lightbox-image"
              onClick={() => setSelectedImage(null)}
              aria-label={t("gallery.closeImage")}
            >
              <img
                src={selectedImage.src}
                alt={selectedImage.pageNumber
                  ? t("gallery.pdfPageAlt", { title: gallery.title, page: selectedImage.pageNumber })
                  : selectedImage.alt}
              />
            </button>
          )}
          <p>
            {selectedImage.pageNumber
              ? t("gallery.pageNumber", { page: selectedImage.pageNumber })
              : selectedImage.caption}
          </p>
        </div>
      )}
    </section>
  );
}
