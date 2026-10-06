"use client";

import { useI18n } from "@/components/i18n/I18nProvider";

export default function MarkdownDownload({ filename, markdown }) {
  const { lang } = useI18n();
  function download() {
    const url = URL.createObjectURL(new Blob([typeof markdown === "function" ? markdown() : markdown], { type: "text/markdown;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <button type="button" className="mindmap-action" onClick={download}>
    <i className="bi bi-download" aria-hidden="true" />
    {lang === "vi" ? "Lưu Markdown" : "Save Markdown"}
  </button>;
}
