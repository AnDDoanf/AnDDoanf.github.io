"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import BlogPostCard from "./BlogPostCard";

const FAITH_TAGS = new Set([
  "christianity",
  "chritianity",
  "faith",
  "devotional",
  "discipleship",
  "disipleship",
  "theology",
  "testimony",
]);

function getBlogTab(post) {
  const tags = post.tags?.map((tag) => String(tag).trim().toLowerCase()) ?? [];
  return tags.some((tag) => FAITH_TAGS.has(tag)) ? "faith" : "life";
}

export default function BlogClient({ posts, hrefBase = "/blog", subtitle }) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("faith");

  const q = query.toLowerCase();

  const isJournal = hrefBase === "/journal";
  const displaySubtitle = subtitle !== undefined ? subtitle : (isJournal ? t("posts.journalSubtitle") : t("posts.blogSubtitle"));

  const filteredPosts = posts.filter((post) => {
    const title = post.title?.toLowerCase() || "";
    const excerpt = post.excerpt?.toLowerCase() || "";
    const primaryTag = post.primaryTag?.toLowerCase() || "";
    const tags = post.tags || [];

    const matchesTab = isJournal || getBlogTab(post) === activeTab;
    const matchesQuery = (
      title.includes(q) ||
      excerpt.includes(q) ||
      primaryTag.includes(q) ||
      tags.some((tag) => tag?.toLowerCase().includes(q))
    );

    return matchesTab && matchesQuery;
  });

  const searchPlaceholder = isJournal
    ? t("posts.searchJournal")
    : t("posts.searchBlog");

  return (
      <section className="post-index">
        <div className="post-search-shell">
          <i className="bi bi-search post-search-icon" aria-hidden="true" />
          <input
              type="text"
              className="blog-search"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={searchPlaceholder}
          />
        </div>

        {!isJournal && (
          <div className="post-category-tabs" role="tablist" aria-label={t("posts.blogCategories")}>
            {["faith", "life"].map((tab) => (
              <button
                key={tab}
                type="button"
                className={`post-category-tab ${activeTab === tab ? "is-active" : ""}`}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              >
                {t(`posts.${tab}`)}
              </button>
            ))}
          </div>
        )}

        {displaySubtitle && <p className="index-page-subtitle">{displaySubtitle}</p>}

        {filteredPosts.length > 0 ? (
          <div className="post-grid post-card-grid">
            {filteredPosts.map((post) => (
              <BlogPostCard key={post.slug} post={post} hrefBase={hrefBase} />
            ))}
          </div>
        ) : (
          <p className="post-grid-empty">{t("posts.noResults")}</p>
        )}
      </section>
  );
}
