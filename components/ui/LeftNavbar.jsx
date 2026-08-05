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

function isNavItemActive(pathname, href) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function LeftNavbar() {
  const { t } = useI18n();
  const pathname = usePathname() ?? "/";
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

  const isVisuallyCollapsed = isMobileViewport && !isMobileOpen;
  const closeLabel = t("ui.closeNavigation");

  const navClassName = [
    "left-nav",
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
      </aside>
    </>
  );
}
