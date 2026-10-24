"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import { selectTheme, getThemeSnapshot } from "./themeState";

/**
 * @param {Object} props
 * @param {Array<any>} [props.items]
 */
export default function CommandPalette({ items = [] }) {
  const router = useRouter();
  const { lang, toggleLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const modalId = useId();

  // Listen for Cmd+K / Ctrl+K and custom trigger event
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    const handleCustomOpen = () => setOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleCustomOpen);
    };
  }, []);

  // Auto-focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  // Navigation pages list
  const navigationItems = [
    { id: "nav-home", title: t("nav.home") || "Home", href: "/", icon: "bi-house", group: "Pages" },
    { id: "nav-about", title: t("nav.about") || "About / Portfolio", href: "/portfolio", icon: "bi-person", group: "Pages" },
    { id: "nav-blog", title: t("nav.blogs") || "Blog", href: "/blog", icon: "bi-pencil-square", group: "Pages" },
    { id: "nav-poetry", title: t("nav.poems") || "Poetry", href: "/poetry", icon: "bi-feather", group: "Pages" },
    { id: "nav-gallery", title: t("nav.gallery") || "Gallery", href: "/gallery", icon: "bi-images", group: "Pages" },
    { id: "nav-mindmap", title: t("nav.mindmaps") || "Mindmaps", href: "/mindmap", icon: "bi-diagram-3", group: "Pages" },
    { id: "nav-giapha", title: t("giapha.title") || "Family Trees", href: "/giapha", icon: "bi-diagram-3", group: "Pages" },
  ];

  // Quick actions
  const actionItems = [
    {
      id: "act-theme",
      title: lang === "vi" ? "Đổi giao diện (Sáng / Tối)" : "Toggle Dark / Light Theme",
      icon: "bi-moon-stars",
      group: "Actions",
      action: () => {
        const [palette, mode] = getThemeSnapshot().split(":");
        selectTheme(palette || "solarized", mode === "dark" ? "light" : "dark");
      },
    },
    {
      id: "act-lang",
      title: lang === "vi" ? "Chuyển sang tiếng Anh (Switch to English)" : "Chuyển sang Tiếng Việt",
      icon: "bi-translate",
      group: "Actions",
      action: toggleLang,
    },
    {
      id: "act-cv",
      title: t("portfolio.downloadCv") || "Download CV / Resume",
      icon: "bi-file-earmark-arrow-down",
      href: "/Doan_Thuan_An_CV.pdf",
      group: "Actions",
      external: true,
    },
    {
      id: "act-top",
      title: lang === "vi" ? "Cuộn lên đầu trang" : "Scroll to Top",
      icon: "bi-arrow-up",
      group: "Actions",
      action: () => window.scrollTo({ top: 0, behavior: "smooth" }),
    },
  ];

  // Filter and rank all search entries
  const q = query.trim().toLowerCase();
  const allSearchable = [...navigationItems, ...actionItems, ...items];
  const filteredResults = !q
    ? [...navigationItems, ...actionItems, ...items.slice(0, 8)]
    : allSearchable
        .filter((item) => {
          const titleMatch = item.title?.toLowerCase().includes(q);
          const descMatch = item.description?.toLowerCase().includes(q);
          const tagMatch = item.tags?.some((tag) => tag.toLowerCase().includes(q));
          const groupMatch = item.group?.toLowerCase().includes(q);
          return titleMatch || descMatch || tagMatch || groupMatch;
        })
        .slice(0, 24);

  // Keep active index within bounds on new query
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.children[activeIndex];
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const handleSelect = (item) => {
    setOpen(false);
    if (item.action) {
      item.action();
      return;
    }
    if (item.external) {
      window.open(item.href, "_blank", "noopener,noreferrer");
      return;
    }
    if (item.href) {
      router.push(item.href);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % Math.max(1, filteredResults.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filteredResults.length) % Math.max(1, filteredResults.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredResults[activeIndex]) {
        handleSelect(filteredResults[activeIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="cmd-palette-backdrop"
      onClick={() => setOpen(false)}
      aria-hidden="true"
    >
      <div
        className="cmd-palette-modal"
        id={modalId}
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="cmd-palette-input-wrapper">
          <i className="bi bi-search cmd-palette-search-icon" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            className="cmd-palette-input"
            placeholder={lang === "vi" ? "Tìm kiếm bài viết, dự án, hành động... (ESC để đóng)" : "Search posts, projects, actions... (ESC to close)"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-autocomplete="list"
            aria-controls="cmd-palette-results"
          />
          {query ? (
            <button
              type="button"
              className="cmd-palette-clear-btn"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Clear query"
            >
              <i className="bi bi-x" aria-hidden="true" />
            </button>
          ) : (
            <kbd className="cmd-palette-kbd">ESC</kbd>
          )}
        </div>

        <div className="cmd-palette-results" id="cmd-palette-results" ref={listRef} role="listbox">
          {filteredResults.length === 0 ? (
            <div className="cmd-palette-empty">
              <i className="bi bi-search" aria-hidden="true" />
              <p>{lang === "vi" ? "Không tìm thấy kết quả phù hợp." : "No results found."}</p>
            </div>
          ) : (
            filteredResults.map((item, idx) => {
              const isSelected = idx === activeIndex;

              return (
                <div
                  key={item.id || item.href || idx}
                  className={`cmd-palette-item ${isSelected ? "is-active" : ""}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  <span className="cmd-palette-item-icon" aria-hidden="true">
                    <i className={`bi ${item.icon || "bi-file-text"}`} />
                  </span>

                  <div className="cmd-palette-item-content">
                    <span className="cmd-palette-item-title">{item.title}</span>
                    {item.description && (
                      <span className="cmd-palette-item-desc">{item.description}</span>
                    )}
                  </div>

                  {item.group && (
                    <span className="cmd-palette-item-badge">{item.group}</span>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="cmd-palette-footer">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> {lang === "vi" ? "di chuyển" : "navigate"}
          </span>
          <span>
            <kbd>↵</kbd> {lang === "vi" ? "chọn" : "select"}
          </span>
          <span>
            <kbd>esc</kbd> {lang === "vi" ? "đóng" : "close"}
          </span>
        </div>
      </div>
    </div>
  );
}
