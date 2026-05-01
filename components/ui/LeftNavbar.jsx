"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function LeftNavbar() {
  const { t } = useI18n();
  return (
    <aside className="left-nav">
        <Link href="/">
            <h2 className="nav-title">
                <span>AnDDoanf </span>
            </h2>
        </Link>
        <nav>
            <ul className="nav-list">
            <li>
                <Link href="/">
                <i className="bi bi-house"></i>
                <span>{t("nav.home")}</span>
                </Link>
            </li>

            <li>
                <Link href="/portfolio">
                <i className="bi bi-person"></i>
                <span>{t("nav.about")}</span>
                </Link>
            </li>

            <li>
                <Link href="/blog">
                <i className="bi bi-pencil-square"></i>
                <span>{t("nav.blogs")}</span>
                </Link>
            </li>

            <li>
                <Link href="/journal">
                <i className="bi bi-journal-text"></i>
                <span>{t("nav.journal")}</span>
                </Link>
            </li>

            <li>
                <Link href="/poetry">
                <i className="bi bi-feather"></i>
                <span>{t("nav.poems")}</span>
                </Link>
            </li>

            <li>
                <Link href="/updating">
                <i className="bi bi-egg-fried"></i>
                <span>{t("nav.culinary")}</span>
                </Link>
            </li>

            <li>
                <Link href="/showroom">
                <i className="bi bi-shop"></i>
                <span>{t("nav.showrooms")}</span>
                </Link>
            </li>
            </ul>
            
        </nav>
    </aside>
  );
}
