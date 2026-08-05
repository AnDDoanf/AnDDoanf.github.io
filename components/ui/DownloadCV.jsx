"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function DownloadCV() {
  const { t } = useI18n();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > 0); // show after scroll
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <a
      href="/Doan_Thuan_An_CV.pdf"
      target="_blank"
      rel="noopener noreferrer"
      className={`download-cv ${show ? "show" : ""}`}
      aria-label={t("portfolio.downloadCv")}
    >
      {t("portfolio.seeCv")}
    </a>
  );
}
