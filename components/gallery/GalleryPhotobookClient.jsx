"use client";

import { useEffect, useRef, useState } from "react";

import { useI18n } from "@/components/i18n/I18nProvider";

const DEFAULT_BOOK_RATIO = 1.7778;
const PRELOAD_PAGE_DISTANCE = 2;
const RENDER_WIDTH_STEP = 48;

function clampPage(pageNumber, pageCount) {
  if (!pageCount) return 1;
  return Math.max(1, Math.min(pageNumber, pageCount));
}

function normalizeRenderWidth(width) {
  if (!width) return 0;
  return Math.max(280, Math.round(width / RENDER_WIDTH_STEP) * RENDER_WIDTH_STEP);
}

function revokePageEntry(entry) {
  if (entry?.url?.startsWith("blob:")) {
    URL.revokeObjectURL(entry.url);
  }
}

function createBlobFromCanvas(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/webp", 0.94);
  });
}

function loadScriptOnce(src, isReady) {
  if (isReady()) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[data-src="${src}"]`);

    if (existingScript) {
      existingScript.addEventListener("load", resolve, { once: true });
      existingScript.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.src = src;
    script.addEventListener("load", resolve, { once: true });
    script.addEventListener("error", reject, { once: true });
    document.body.appendChild(script);
  });
}

function PhotobookPageSurface({ entry, pageNumber }) {
  if (entry?.status === "ready" && entry.url) {
    return (
      <div className="photobook-page-media">
        <img
          src={entry.url}
          alt={`Photobook page ${pageNumber}`}
          decoding="async"
          draggable="false"
        />
      </div>
    );
  }

  return (
    <div className="photobook-page-placeholder">
      <i className="bi bi-book" aria-hidden="true" />
    </div>
  );
}

export default function GalleryPhotobookClient({ gallery }) {
  const { t } = useI18n();
  const stageRef = useRef(null);
  const bookShellRef = useRef(null);
  const flipbookRef = useRef(null);
  const viewerRef = useRef(null);
  const wheelLockRef = useRef(0);
  const turnReadyRef = useRef(false);
  const pendingRendersRef = useRef(new Set());
  const renderSessionRef = useRef(0);
  const pageCacheRef = useRef({});
  const hasTurnedRef = useRef(false);
  const accumulatedWheelRef = useRef(0);
  const lastScrollTimeRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const lastWheelTimeRef = useRef(0);
  const [scriptsReady, setScriptsReady] = useState(false);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageAspectRatio, setPageAspectRatio] = useState(DEFAULT_BOOK_RATIO);
  const [turnReady, setTurnReady] = useState(false);
  const [loadingState, setLoadingState] = useState("loading");
  const [pageCache, setPageCache] = useState({});
  const [renderWidth, setRenderWidth] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === viewerRef.current);
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!viewerRef.current) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await viewerRef.current.requestFullscreen();
      }
    } catch (err) {
      console.error("Error attempting to toggle fullscreen:", err);
    }
  };

  function syncPageCache(nextCache) {
    pageCacheRef.current = nextCache;
    setPageCache(nextCache);
  }

  function clearPageCache() {
    Object.values(pageCacheRef.current).forEach(revokePageEntry);
    pendingRendersRef.current.clear();
    syncPageCache({});
  }

  function updatePageCache(pageNumber, nextEntry) {
    const previousEntry = pageCacheRef.current[pageNumber];
    if (previousEntry?.url && previousEntry.url !== nextEntry?.url) {
      revokePageEntry(previousEntry);
    }

    syncPageCache({
      ...pageCacheRef.current,
      [pageNumber]: nextEntry,
    });
  }

  function getTurnInstance() {
    if (!turnReadyRef.current || !window.jQuery || !flipbookRef.current) return null;
    return window.jQuery(flipbookRef.current);
  }

  function destroyTurnInstance() {
    const turnInstance = getTurnInstance();
    if (!turnInstance) return;

    try {
      turnInstance.turn("destroy");
    } catch (error) {
      console.error("Failed to destroy turn.js instance", error);
    } finally {
      turnReadyRef.current = false;
      setTurnReady(false);
    }
  }

  async function renderPageSnapshot(pageNumber) {
    if (!pdfDocument || !renderWidth || !pageNumber) return;
    if (pendingRendersRef.current.has(pageNumber)) return;

    const existingEntry = pageCacheRef.current[pageNumber];
    if (existingEntry?.status === "ready") return;

    const sessionId = renderSessionRef.current;
    pendingRendersRef.current.add(pageNumber);
    updatePageCache(pageNumber, {
      ...existingEntry,
      status: "rendering",
    });

    let page = null;
    let url = "";

    try {
      page = await pdfDocument.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const nextAspectRatio = baseViewport.width / baseViewport.height;
      const deviceScale = Math.min(window.devicePixelRatio || 1, 1.75);
      const targetPixelWidth = Math.min(renderWidth * deviceScale, 2200);
      const scale = Math.max(targetPixelWidth / baseViewport.width, 0.1);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { alpha: false });

      if (!context) {
        throw new Error("Unable to create canvas context for photobook page.");
      }

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      const renderTask = page.render({
        canvasContext: context,
        viewport,
      });

      await renderTask.promise;

      const blob = await createBlobFromCanvas(canvas);
      if (!blob) {
        throw new Error("Unable to convert photobook page canvas to blob.");
      }

      url = URL.createObjectURL(blob);

      if (renderSessionRef.current !== sessionId) {
        revokePageEntry({ url });
        return;
      }

      updatePageCache(pageNumber, {
        status: "ready",
        url,
        aspectRatio: nextAspectRatio,
      });
    } catch (error) {
      if (renderSessionRef.current === sessionId) {
        console.error(`Failed to render photobook page ${pageNumber}`, error);
        updatePageCache(pageNumber, {
          status: "error",
          url: "",
          aspectRatio: existingEntry?.aspectRatio ?? pageAspectRatio,
        });
      } else if (url) {
        revokePageEntry({ url });
      }
    } finally {
      pendingRendersRef.current.delete(pageNumber);
      page?.cleanup?.();
    }
  }

  useEffect(() => {
    let isCancelled = false;

    async function loadTurnScripts() {
      try {
        await loadScriptOnce(
          "/vendor/turnjs/jquery.js",
          () => Boolean(window.jQuery),
        );
        await loadScriptOnce(
          "/vendor/turnjs/turn.js",
          () => Boolean(window.jQuery?.fn?.turn),
        );

        if (!isCancelled) {
          setScriptsReady(true);
        }
      } catch (error) {
        if (isCancelled) return;
        console.error("Failed to load turn.js scripts", error);
      }
    }

    loadTurnScripts();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const shellNode = bookShellRef.current;
    if (!shellNode) return undefined;

    function updateWidth() {
      const nextWidth = normalizeRenderWidth(shellNode.clientWidth);
      setRenderWidth((currentWidth) => (
        currentWidth === nextWidth ? currentWidth : nextWidth
      ));
    }

    updateWidth();

    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    resizeObserver.observe(shellNode);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;
    let activeDocument = null;
    let loadingTask = null;

    async function loadPdf() {
      setLoadingState("loading");
      setPdfDocument(null);
      setPageCount(0);
      setCurrentPage(1);

      const pdfjs = await import("pdfjs-dist/build/pdf.mjs");
      if (isCancelled) return;

      pdfjs.GlobalWorkerOptions.workerSrc = "/vendor/pdfjs/pdf.worker.min.mjs";
      loadingTask = pdfjs.getDocument({
        url: gallery.pdf.src,
      });

      const document = await loadingTask.promise;
      if (isCancelled) {
        await document.destroy();
        return;
      }

      activeDocument = document;
      setPdfDocument(document);
      setPageCount(document.numPages);

      const firstPage = await document.getPage(1);
      if (isCancelled) {
        firstPage.cleanup();
        return;
      }

      const viewport = firstPage.getViewport({ scale: 1 });
      setPageAspectRatio(viewport.width / viewport.height);
      firstPage.cleanup();
      setLoadingState("ready");
    }

    loadPdf().catch((error) => {
      if (isCancelled) return;
      console.error("Failed to load PDF photobook", error);
      setLoadingState("error");
    });

    return () => {
      isCancelled = true;
      loadingTask?.destroy?.();
      const destroyResult = activeDocument?.destroy?.();
      destroyResult?.catch?.(() => { });
    };
  }, [gallery.pdf.src]);

  useEffect(() => {
    return () => {
      destroyTurnInstance();
      Object.values(pageCacheRef.current).forEach(revokePageEntry);
      pageCacheRef.current = {};
      pendingRendersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    renderSessionRef.current += 1;
    clearPageCache();
  }, [pdfDocument, renderWidth]);

  useEffect(() => {
    if (loadingState !== "ready" || !pdfDocument || !renderWidth || !pageCount) {
      return;
    }

    const pagesToWarm = new Set();

    for (let delta = -PRELOAD_PAGE_DISTANCE; delta <= PRELOAD_PAGE_DISTANCE; delta += 1) {
      const pageNumber = currentPage + delta;
      if (pageNumber >= 1 && pageNumber <= pageCount) {
        pagesToWarm.add(pageNumber);
      }
    }

    pagesToWarm.forEach((pageNumber) => {
      void renderPageSnapshot(pageNumber);
    });
  }, [currentPage, loadingState, pageCount, pdfDocument, renderWidth]);

  useEffect(() => {
    const currentEntry = pageCache[currentPage];

    if (!currentEntry?.aspectRatio || !Number.isFinite(currentEntry.aspectRatio)) {
      return;
    }

    setPageAspectRatio((currentAspectRatio) => (
      Math.abs(currentAspectRatio - currentEntry.aspectRatio) < 0.001
        ? currentAspectRatio
        : currentEntry.aspectRatio
    ));
  }, [currentPage, pageCache]);

  useEffect(() => {
    const flipbookNode = flipbookRef.current;
    if (
      !scriptsReady
      || !flipbookNode
      || !pageCount
      || !renderWidth
      || !pageAspectRatio
    ) {
      return;
    }

    const $ = window.jQuery;
    const turnbook = $(flipbookNode);
    const nextHeight = Math.round(renderWidth / pageAspectRatio);

    if (!turnReadyRef.current) {
      turnbook.turn({
        width: renderWidth,
        height: nextHeight,
        display: "single",
        autoCenter: false,
        elevation: 0,
        duration: 820,
        gradients: false,
        page: currentPage,
        when: {
          turning: (_event, page) => {
            setCurrentPage(page);
          },
          turned: (_event, page) => {
            setCurrentPage(page);
          },
        },
      });

      turnReadyRef.current = true;
      setTurnReady(true);
      return;
    }

    turnbook.turn("size", renderWidth, nextHeight);
  }, [pageAspectRatio, pageCount, renderWidth, scriptsReady]);

  useEffect(() => {
    if (!turnReadyRef.current || !scriptsReady || !flipbookRef.current) {
      return;
    }

    const turnbook = window.jQuery(flipbookRef.current);
    const activePage = turnbook.turn("page");

    if (activePage !== currentPage) {
      turnbook.turn("page", currentPage);
    }
  }, [currentPage, scriptsReady]);

  useEffect(() => {
    const stageNode = stageRef.current;
    if (!stageNode) return undefined;

    function handleStageWheel(event) {
      const verticalDelta = event.deltaY;

      if (Math.abs(verticalDelta) < 18) return;

      const now = Date.now();
      const timeDiff = now - lastWheelTimeRef.current || 1;
      const speed = Math.abs(verticalDelta) / timeDiff;
      lastWheelTimeRef.current = now;

      if (currentPage === 1) {
        if (verticalDelta > 0) {
          accumulatedWheelRef.current += verticalDelta;
          if (accumulatedWheelRef.current > 800 && !hasTurnedRef.current && turnReadyRef.current) {
            hasTurnedRef.current = true;

            let duration = 820;
            if (speed > 1.5) {
              duration = 180;
            } else if (speed > 0.8) {
              duration = 350;
            } else if (speed > 0.3) {
              duration = 550;
            }

            goToRelative("next", duration);
            event.preventDefault();
            event.stopPropagation();
          }
        } else {
          accumulatedWheelRef.current = Math.max(0, accumulatedWheelRef.current + verticalDelta);
        }
        return;
      }

      const allowPageScroll = loadingState !== "ready"
        || !turnReady
        || !pageCount
        || currentPage <= 1
        || currentPage >= pageCount;

      if (allowPageScroll) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      let lockTime = 420;
      let duration = 820;

      if (speed > 1.5) {
        lockTime = 160;
        duration = 140;
      } else if (speed > 0.8) {
        lockTime = 250;
        duration = 220;
      } else if (speed > 0.3) {
        lockTime = 350;
        duration = 320;
      }

      if (now - wheelLockRef.current < lockTime) {
        return;
      }

      wheelLockRef.current = now;
      goToRelative(verticalDelta > 0 ? "next" : "prev", duration);
    }

    stageNode.addEventListener("wheel", handleStageWheel, { passive: false });

    return () => {
      stageNode.removeEventListener("wheel", handleStageWheel);
    };
  }, [currentPage, loadingState, pageCount, turnReady]);

  useEffect(() => {
    if (currentPage === 1) {
      hasTurnedRef.current = false;
      accumulatedWheelRef.current = 0;
      lastScrollTimeRef.current = Date.now();
      lastScrollYRef.current = 0;
      lastWheelTimeRef.current = Date.now();
      window.scrollTo({ top: 0 });
    }
  }, [currentPage]);

  useEffect(() => {
    if (currentPage !== 1) return;

    function handleScroll() {
      const now = Date.now();
      const timeDiff = now - lastScrollTimeRef.current || 1;
      const scrollDiff = Math.abs(window.scrollY - lastScrollYRef.current);
      const speed = scrollDiff / timeDiff;

      lastScrollTimeRef.current = now;
      lastScrollYRef.current = window.scrollY;

      if (window.scrollY > 500 && !hasTurnedRef.current && turnReadyRef.current) {
        hasTurnedRef.current = true;

        let duration = 820;
        if (speed > 3.0) {
          duration = 180;
        } else if (speed > 1.5) {
          duration = 350;
        } else if (speed > 0.5) {
          duration = 550;
        }

        goToRelative("next", duration);
      }
    }

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [currentPage]);

  useEffect(() => {
    function handleGlobalKeyDown(event) {
      const activeEl = document.activeElement;
      if (
        activeEl
        && (activeEl.tagName === "INPUT"
          || activeEl.tagName === "TEXTAREA"
          || activeEl.isContentEditable)
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToRelative("prev");
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goToRelative("next");
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  function goToRelative(direction, customDuration = null) {
    if (!turnReadyRef.current) return;

    const turnbook = getTurnInstance();
    if (!turnbook) return;

    if (customDuration !== null) {
      turnbook.turn("options", { duration: customDuration });
    } else {
      turnbook.turn("options", { duration: 820 });
    }

    if (direction === "next") {
      turnbook.turn("next");
      return;
    }

    turnbook.turn("previous");
  }

  const currentEntry = pageCache[currentPage];
  const pageStatus = pageCount > 0
    ? `${t("gallery.page")} ${currentPage} / ${pageCount}`
    : t("gallery.photobookLoading");

  return (
    <section className="gallery-viewer photobook-viewer-shell">
      <section
        ref={viewerRef}
        className={`photobook-viewer ${isFullscreen ? "is-fullscreen" : ""}`}
        aria-label={t("gallery.photobookViewportLabel")}
      >
        <div className="photobook-stage" ref={stageRef}>
          <button
            type="button"
            className="gallery-carousel-action-fullscreen photobook-fullscreen-btn"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? t("gallery.exitFullscreen") : t("gallery.enterFullscreen")}
            title={isFullscreen ? t("gallery.exitFullscreen") : t("gallery.enterFullscreen")}
          >
            <i className={`bi bi-${isFullscreen ? "fullscreen-exit" : "fullscreen"}`} aria-hidden="true" />
          </button>
          <div className="photobook-stage-rail">
            <button
              type="button"
              className="photobook-action photobook-action-prev"
              onClick={() => goToRelative("prev")}
              disabled={currentPage <= 1 || loadingState !== "ready" || !turnReady}
              aria-label={t("gallery.previous")}
            >
              <i className="bi bi-arrow-left" aria-hidden="true" />
            </button>

            <div className="photobook-book-shell" ref={bookShellRef}>
              <div className={`photobook-turnbook ${turnReady ? "is-ready" : ""}`} ref={flipbookRef}>
                {Array.from({ length: pageCount }, (_value, index) => {
                  const pageNumber = index + 1;

                  return (
                    <div className="photobook-turn-page hard" key={pageNumber}>
                      <PhotobookPageSurface
                        entry={pageCache[pageNumber]}
                        pageNumber={pageNumber}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              className="photobook-action photobook-action-next"
              onClick={() => goToRelative("next")}
              disabled={
                currentPage >= pageCount
                || loadingState !== "ready"
                || !turnReady
              }
              aria-label={t("gallery.next")}
            >
              <i className="bi bi-arrow-right" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="photobook-footer">
          <span className="photobook-counter">{pageStatus}</span>
        </div>

        {loadingState === "error" && (
          <p className="photobook-error">{t("gallery.photobookLoadError")}</p>
        )}

        {loadingState === "ready" && currentEntry?.status === "error" && (
          <p className="photobook-error">{t("gallery.photobookLoadError")}</p>
        )}
      </section>
    </section>
  );
}
