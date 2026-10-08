"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function MindmapLibrary({ maps }) {
  const { lang } = useI18n();
  const [type, setType] = useState("all");
  const [query, setQuery] = useState("");
  const labels = lang === "vi"
    ? { all: "Tất cả", "family-tree": "Gia phả", learning: "Học tập" }
    : { all: "All", "family-tree": "Family tree", learning: "Learning" };
  const filtered = maps.filter(map => (type === "all" || map.type === type) &&
    [map.title, map.titleVi, map.description, map.descriptionVi].join(" ").toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));

  return <section className="mindmap-library blog-post-container post-index-page" aria-label={"Mindmaps"}>
    <div className="mindmap-library-tools">
      <div className="post-search-shell">
        <i className="bi bi-search post-search-icon" aria-hidden="true" />
        <input className="blog-search" type="search" value={query} onChange={event => setQuery(event.target.value)} aria-label={lang === "vi" ? "Tìm sơ đồ" : "Search mindmaps"} placeholder={lang === "vi" ? "Tìm sơ đồ theo tiêu đề hoặc ý tưởng…" : "Search mindmaps by title or idea…"} />
      </div>
      <div className="post-category-tabs mindmap-filters-hidden" role="group" aria-label={lang === "vi" ? "Loại sơ đồ" : "Mindmap type"}>
        {Object.entries(labels).map(([value, label]) => <button className={`post-category-tab ${type === value ? "is-active" : ""}`} type="button" key={value} aria-pressed={type === value} onClick={() => setType(value)}>{label}</button>)}
      </div>
    </div>
    <div className="mindmap-grid">
      {filtered.map(map => <Link className="mindmap-card" href={`/mindmap/${map.slug}`} key={map.slug}>
        <div className={`mindmap-card-preview ${map.type}`}>
          {map.cover ? <Image src={map.cover} alt={lang === "vi" ? map.coverAltVi : map.coverAlt} fill sizes="(max-width: 700px) 100vw, 50vw" className="mindmap-cover" /> : <><i className={`bi bi-${map.type === "family-tree" ? "diagram-3" : "lightbulb"}`} aria-hidden="true" /><span /><span /><span /></>}
        </div>
        <div className="mindmap-card-body"><p className="mindmap-eyebrow">{labels[map.type]}</p>
          <h2>{lang === "vi" ? map.titleVi || map.title : map.title}</h2><p>{lang === "vi" ? map.descriptionVi || map.description : map.description}</p>
          <div className="mindmap-card-footer"><span>{map.count} {map.type === "family-tree" ? (lang === "vi" ? "thành viên" : "people") : (lang === "vi" ? "chủ đề" : "topics")}</span><i className="bi bi-arrow-up-right" aria-hidden="true" /></div>
        </div>
      </Link>)}
    </div>
    {!filtered.length && <p role="status">{lang === "vi" ? "Không tìm thấy sơ đồ phù hợp." : "No mindmaps match your search."}</p>}
  </section>;
}
