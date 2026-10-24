"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { useI18n } from "@/components/i18n/I18nProvider";
import LanguageToggle from "@/components/ui/LanguageToggle";
import ThemeToggle from "@/components/ui/ThemeToggle";
import {
  getIsMobileViewport,
  subscribeToMobileViewport,
} from "@/components/ui/navState";

export default function TopRightControls({ showNavToggle = false }) {
  const { lang, t } = useI18n();
  const [isVisible, setIsVisible] = useState(true);
  const isMobileViewport = useSyncExternalStore(
    subscribeToMobileViewport,
    getIsMobileViewport,
    () => false
  );

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;

      if (currentScrollY < 24 || scrollDelta < -6) {
        setIsVisible(true);
      } else if (scrollDelta > 6) {
        setIsVisible(false);
      }

      lastScrollY = currentScrollY;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const openSearch = () => {
    window.dispatchEvent(new Event("open-command-palette"));
  };

  const rowClassName = [
    "toggle-row",
    isMobileViewport ? "toggle-row-mobile" : "",
    !isVisible ? "is-hidden-on-scroll" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const searchTitle = lang === "vi" ? "Tìm kiếm (Ctrl+K)" : "Search (Cmd+K)";

  return (
    <div className="theme-toggle-main">
      <div className={rowClassName}>
        <button
          type="button"
          className="theme-icon theme-icon-search"
          onClick={openSearch}
          aria-label={searchTitle}
          title={searchTitle}
        >
          <i className="bi bi-search" aria-hidden="true" style={{ fontSize: "0.95rem" }} />
        </button>
        <ThemeToggle />
        <LanguageToggle />
      </div>
    </div>
  );
}


