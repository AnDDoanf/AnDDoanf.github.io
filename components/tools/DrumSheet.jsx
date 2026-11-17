"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { alignSheetIndicators, renderDrumSheet } from "@/app/utils/renderDrumSheet.mjs";

export default function DrumSheet({ pattern, bars, division, timeSignature, activeStep }) {
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [width, setWidth] = useState(1000);
  const [error, setError] = useState("");

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current) return;
    try {
      // Only locally generated ABC and the bundled renderer supply this markup.
      containerRef.current.innerHTML = renderDrumSheet(window.Abc, { pattern, bars, division, timeSignature, pageWidth: width });
      alignSheetIndicators(containerRef.current);
      setError("");
    } catch {
      setError("Unable to render sheet music.");
    }
  }, [ready, pattern, bars, division, timeSignature, width]);

  useEffect(() => {
    const anchors = [...(containerRef.current?.querySelectorAll(".drum-sheet-anchor") || [])];
    let current;
    for (const anchor of anchors) {
      anchor.classList.remove("is-playing");
      if (activeStep >= 0 && Number(anchor.dataset.step) <= activeStep) current = anchor;
    }
    current?.classList.add("is-playing");
  }, [activeStep, ready, pattern, bars, division, timeSignature, width]);

  return (
    <section className="drum-sheet" aria-label="Drum sheet music">
      <Script src="/vendor/abc2svg/abc2svg-1.js" onReady={() => setReady(true)} onError={() => setError("Unable to load sheet music renderer.")} />
      <div ref={containerRef} className="drum-sheet-score" role="img" aria-label={`${bars} bar drum notation in ${timeSignature.join("/")} time`} />
      {error && <p role="status">{error}</p>}
    </section>
  );
}
