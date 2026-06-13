"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useI18n } from "@/components/i18n/I18nProvider";

const ROUTE_LABEL_KEYS = {
  portfolio: "nav.about",
  blog: "nav.blogs",
  journal: "nav.journal",
  poetry: "nav.poems",
  gallery: "nav.gallery",
  showroom: "nav.showrooms",
  culinary: "nav.culinary",
  updating: "updating.title",
};

function humanizeSegment(segment) {
  return decodeURIComponent(segment)
    .replace(/^\d{4}(?:-\d{2}){1,2}-/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function PageBreadcrumbs() {
  const { t } = useI18n();
  const pathname = usePathname() ?? "/";
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  const crumbs = [
    {
      href: "/",
      label: t("nav.home"),
    },
    ...segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;
      const labelKey = ROUTE_LABEL_KEYS[segment];

      return {
        href,
        label: labelKey ? t(labelKey) : humanizeSegment(segment),
      };
    }),
  ];

  return (
    <nav className="page-breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        {crumbs.map((crumb, index) => {
          const isCurrent = index === crumbs.length - 1;

          return (
            <li key={crumb.href} className="breadcrumb-item">
              {index > 0 && (
                <span className="breadcrumb-separator" aria-hidden="true">
                  <i className="bi bi-chevron-right" />
                </span>
              )}

              {isCurrent ? (
                <span className="breadcrumb-current" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link className="breadcrumb-link" href={crumb.href}>
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
