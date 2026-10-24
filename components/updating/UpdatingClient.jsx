"use client";

import TopRightControls from "@/components/ui/TopRightControls";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function UpdatingClient() {
  const { t } = useI18n();

  return (
    <main className="updating-page">
      <TopRightControls />

      <Card as="div" className="updating-card">
        <h1 className="updating-title">{t("updating.title")}</h1>

        <p className="updating-text">
          {t("updating.textLine1")}
          <br />
          {t("updating.textLine2")}
        </p>

        <div className="updating-divider" />

        <Button
          href="/"
          variant="outline"
          size="md"
          icon="bi-arrow-left"
          className="updating-back-btn"
          style={{ marginTop: "1rem" }}
        >
          {t("updating.goBack")}
        </Button>
      </Card>
    </main>
  );
}
