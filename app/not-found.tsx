"use client";

import TopRightControls from "@/components/ui/TopRightControls";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function NotFoundPage() {
  const { t } = useI18n();

  return (
    <main className="not-found-page">
      <TopRightControls />

      <div className="not-found-container">
        <Card as="div" className="not-found-card">
          <div className="not-found-code-badge" aria-hidden="true">
            404
          </div>

          <h1 className="not-found-title">{t("notFound.subtitle")}</h1>

          <p className="not-found-description">
            {t("notFound.description")}
          </p>

          <div className="not-found-divider" />

          <div className="not-found-actions">
            <Button
              href="/"
              variant="primary"
              size="md"
              icon="bi-house"
            >
              {t("notFound.returnHome")}
            </Button>

            <Button
              href="/blog"
              variant="outline"
              size="md"
              icon="bi-pencil-square"
            >
              {t("notFound.viewBlog")}
            </Button>

            <Button
              href="/portfolio"
              variant="subtle"
              size="md"
              icon="bi-person"
            >
              {t("notFound.viewPortfolio")}
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
