"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function DownloadCV() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > 0);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href="/Doan_Thuan_An_CV.pdf"
      target="_blank"
      rel="noopener noreferrer"
      className={`download-cv ${show ? "show" : ""}`}
      aria-label={t("portfolio.downloadCv")}
      title={t("portfolio.downloadCv")}
    >
      <i
        className="bi bi-file-earmark-arrow-down"
        aria-hidden="true"
        style={{ marginRight: "0.45rem", fontSize: "1.05rem" }}
      />
      <span>{t("portfolio.seeCv")}</span>
    </a>
  );
}
