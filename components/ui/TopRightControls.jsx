"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { useI18n } from "@/components/i18n/I18nProvider";
import LanguageToggle from "@/components/ui/LanguageToggle";
import ThemeToggle from "@/components/ui/ThemeToggle";
import {
  getIsMobileNavOpen,
  getIsMobileViewport,
  setIsMobileNavOpen,
  subscribeToMobileNav,
  subscribeToMobileViewport,
} from "@/components/ui/navState";

export default function TopRightControls() {
  const { t } = useI18n();
  const [isVisible, setIsVisible] = useState(true);
  const isMobileViewport = useSyncExternalStore(
    subscribeToMobileViewport,
    getIsMobileViewport,
    () => false
  );
  const isMobileNavOpen = useSyncExternalStore(
    subscribeToMobileNav,
    getIsMobileNavOpen,
    () => false
  );

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;

      if (isMobileNavOpen || currentScrollY < 24 || scrollDelta < -6) {
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
  }, [isMobileNavOpen]);

  const menuLabel = isMobileNavOpen
    ? t("ui.closeNavigation")
    : t("ui.openNavigation");

  const rowClassName = [
    "toggle-row",
    isMobileViewport ? "toggle-row-mobile" : "",
    !isVisible ? "is-hidden-on-scroll" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="theme-toggle-main">
      <div className={rowClassName}>
        <ThemeToggle />
        <LanguageToggle />

        {isMobileViewport && (
          <button
            type="button"
            className="theme-icon theme-icon-menu"
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            aria-label={menuLabel}
            aria-expanded={isMobileNavOpen}
            aria-controls="primary-navigation"
            title={menuLabel}
          >
            <i
              className={`bi ${
                isMobileNavOpen ? "bi-x-lg" : "bi-list"
              }`}
              aria-hidden="true"
            />
          </button>
        )}
      </div>
    </div>
  );
}

