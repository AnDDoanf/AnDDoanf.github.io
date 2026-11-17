"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function DownloadCV() {
  const { t } = useI18n();
  const [controls, setControls] = useState(null);

  useEffect(() => {
    setControls(document.querySelector(".top-right-controls-leading"));
  }, []);

  if (!controls) return null;

  return createPortal(
    <a
      href="/Doan_Thuan_An_CV.pdf"
      target="_blank"
      rel="noopener noreferrer"
      className="download-cv"
      aria-label={t("portfolio.downloadCv")}
      title={t("portfolio.downloadCv")}
    >
      <i
        className="bi bi-file-earmark-arrow-down"
        aria-hidden="true"
      />
      <span>{t("portfolio.seeCv")}</span>
    </a>,
    controls
  );
}
