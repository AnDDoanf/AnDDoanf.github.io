"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import {
  getIsMobileViewport,
  subscribeToMobileViewport,
} from "@/components/ui/navState";

const NAV_ITEMS = [
  { href: "/", icon: "bi-house", labelKey: "nav.home" },
  { href: "/portfolio", icon: "bi-person", labelKey: "nav.about" },
  { href: "/blog", icon: "bi-pencil-square", labelKey: "nav.blogs" },
  { href: "/poetry", icon: "bi-feather", labelKey: "nav.poems" },
  // { href: "/updating", icon: "bi-egg-fried", labelKey: "nav.culinary" },
  { href: "/gallery", icon: "bi-images", labelKey: "nav.gallery" },
  { href: "/mindmap", icon: "bi-diagram-3", labelKey: "nav.mindmaps" },
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
  const [isVisible, setIsVisible] = useState(true);

  const isMobileViewport = useSyncExternalStore(
    subscribeToMobileViewport,
    getIsMobileViewport,
    () => false
  );

  useEffect(() => {
    if (!isMobileViewport) {
      setIsVisible(true);
      return;
    }

    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = currentScrollY - lastScrollY;

      // Show when scrolling up or near top; fade away when scrolling down
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
  }, [isMobileViewport]);

  useEffect(() => {
    setIsVisible(true);
  }, [pathname]);

  const navClassName = [
    "left-nav",
    isMobileViewport ? "is-mobile" : "",
    isMobileViewport && !isVisible ? "is-hidden-on-scroll" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
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
                  title={label}
                  aria-label={label}
                  aria-current={isActive ? "page" : undefined}
                >
                  <i className={`bi ${icon}`} aria-hidden="true" />
                  <span className="nav-label">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

