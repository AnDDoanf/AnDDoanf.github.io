"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import {
  getIsMobileNavOpen,
  getIsMobileViewport,
  setIsMobileNavOpen,
  subscribeToMobileNav,
  subscribeToMobileViewport,
} from "@/components/ui/navState";

const NAV_ITEMS = [
  { href: "/", icon: "bi-house", labelKey: "nav.home" },
  { href: "/portfolio", icon: "bi-person", labelKey: "nav.about" },
  { href: "/blog", icon: "bi-pencil-square", labelKey: "nav.blogs" },
  { href: "/journal", icon: "bi-journal-text", labelKey: "nav.journal" },
  { href: "/poetry", icon: "bi-feather", labelKey: "nav.poems" },
  // { href: "/updating", icon: "bi-egg-fried", labelKey: "nav.culinary" },
  { href: "/gallery", icon: "bi-images", labelKey: "nav.gallery" },
  { href: "/showroom", icon: "bi-shop", labelKey: "nav.showrooms" },
];

const NAV_COLLAPSE_STORAGE_KEY = "left-nav-collapsed";
const NAV_COLLAPSE_EVENT = "left-nav-collapse-change";
function getStoredCollapsedState() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(NAV_COLLAPSE_STORAGE_KEY) === "true";
}

function subscribeToCollapsedState(callback) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleCollapsedStateChange = (event) => {
    if (
      event instanceof StorageEvent &&
      event.key !== null &&
      event.key !== NAV_COLLAPSE_STORAGE_KEY
    ) {
      return;
    }

    callback();
  };

  window.addEventListener("storage", handleCollapsedStateChange);
  window.addEventListener(NAV_COLLAPSE_EVENT, handleCollapsedStateChange);

  return () => {
    window.removeEventListener("storage", handleCollapsedStateChange);
    window.removeEventListener(NAV_COLLAPSE_EVENT, handleCollapsedStateChange);
  };
}

function setStoredCollapsedState(nextValue) {
  window.localStorage.setItem(NAV_COLLAPSE_STORAGE_KEY, String(nextValue));
  window.dispatchEvent(new Event(NAV_COLLAPSE_EVENT));
}

function isNavItemActive(pathname, href) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function LeftNavbar() {
  const { t } = useI18n();
  const pathname = usePathname() ?? "/";
  const isCollapsed = useSyncExternalStore(
    subscribeToCollapsedState,
    getStoredCollapsedState,
    () => false
  );
  const isMobileViewport = useSyncExternalStore(
    subscribeToMobileViewport,
    getIsMobileViewport,
    () => false
  );
  const isMobileOpen = useSyncExternalStore(
    subscribeToMobileNav,
    getIsMobileNavOpen,
    () => false
  );

  const isExpanded = isMobileViewport ? isMobileOpen : !isCollapsed;
  const isVisuallyCollapsed = !isExpanded;

  const toggleLabel = isExpanded
    ? t("ui.collapseNavigation")
    : t("ui.expandNavigation");
  const closeLabel = t("ui.closeNavigation");
  const toggleIconClass = isMobileViewport
    ? isExpanded
      ? "bi-chevron-left"
      : "bi-chevron-right"
    : isExpanded
      ? "bi-chevron-double-left"
      : "bi-chevron-double-right";

  const navClassName = [
    "left-nav",
    isVisuallyCollapsed ? "is-collapsed" : "",
    isMobileViewport ? "is-mobile" : "",
    isMobileViewport && isMobileOpen ? "is-mobile-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    if (!isMobileViewport && isMobileOpen) {
      setIsMobileNavOpen(false);
    }
  }, [isMobileOpen, isMobileViewport]);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  function handleToggle() {
    setStoredCollapsedState(!isCollapsed);
  }

  return (
    <>
      {isMobileViewport && isMobileOpen && (
        <button
          type="button"
          className="nav-backdrop"
          aria-label={closeLabel}
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      <aside className={navClassName}>
        <nav id="primary-navigation" aria-label={t("ui.primaryNavigation")}>
          <ul className="nav-list">
            {NAV_ITEMS.map(({ href, icon, labelKey }) => {
              const label = t(labelKey);
              const isActive = isNavItemActive(pathname, href);

              return (
                <li key={href} className={isActive ? "is-active" : undefined}>
                  <Link
                    href={href}
                    title={isVisuallyCollapsed ? label : undefined}
                    aria-label={isVisuallyCollapsed ? label : undefined}
                    aria-current={isActive ? "page" : undefined}
                    onClick={isMobileViewport ? () => setIsMobileNavOpen(false) : undefined}
                  >
                    <i className={`bi ${icon}`} aria-hidden="true"></i>
                    <span className="nav-label">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        {!isMobileViewport && (
          <button
            type="button"
            className="nav-collapse-toggle"
            onClick={handleToggle}
            aria-controls="primary-navigation"
            aria-expanded={isExpanded}
            aria-label={toggleLabel}
            title={toggleLabel}
          >
            <i
              className={`bi ${toggleIconClass}`}
              aria-hidden="true"
            ></i>
            <span className="sr-only">{toggleLabel}</span>
          </button>
        )}
      </aside>
    </>
  );
}

