"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function TableOfContents({ headings }) {
  const { t } = useI18n();
  const [activeId, setActiveId] = useState("");
  const selectedId = useRef(null);
  const selectionTimer = useRef(null);

  useEffect(() => {
    const sections = headings
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);
    let frame = null;

    const updateActiveSection = () => {
      frame = null;
      if (selectedId.current) return;

      const readingLine = Math.min(160, window.innerHeight * 0.25);
      let currentId = "";
      for (const section of sections) {
        if (section.getBoundingClientRect().top > readingLine) break;
        currentId = section.id;
      }

      if (
        sections.length &&
        window.scrollY > 0 &&
        window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 2
      ) {
        currentId = sections[sections.length - 1].id;
      }
      setActiveId(currentId);
    };

    const scheduleUpdate = () => {
      if (frame === null) frame = requestAnimationFrame(updateActiveSection);
    };

    const finishSelection = () => {
      clearTimeout(selectionTimer.current);
      selectedId.current = null;
      // Keep the clicked title selected until the next manual scroll.
    };

    const onScroll = () => {
      if (selectedId.current) {
        clearTimeout(selectionTimer.current);
        selectionTimer.current = setTimeout(finishSelection, 180);
        return;
      }
      scheduleUpdate();
    };

    scheduleUpdate();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scrollend", finishSelection);
    window.addEventListener("resize", scheduleUpdate);
    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(document.body);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", finishSelection);
      window.removeEventListener("resize", scheduleUpdate);
      resizeObserver.disconnect();
      clearTimeout(selectionTimer.current);
      selectedId.current = null;
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [headings]);

  const selectHeading = (id) => {
    setActiveId(id);
    selectedId.current = id;
    clearTimeout(selectionTimer.current);
    // Also release the selection when the target is already in view.
    selectionTimer.current = setTimeout(() => {
      selectedId.current = null;
    }, 1000);
  };

  if (!headings.length) return null;

  return (
    <aside className="toc post-toc" aria-label={t("posts.onThisPage")}>
      <p className="toc-title">{t("posts.onThisPage")}</p>
      <ul>
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={heading.level === 3 ? "toc-sub" : ""}
          >
            <a
              href={`#${heading.id}`}
              onClick={() => selectHeading(heading.id)}
              aria-current={activeId === heading.id ? "location" : undefined}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
