"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import BlogPostCard from "./BlogPostCard";

export default function BlogClient({ posts, hrefBase = "/blog", subtitle }) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");

  const q = query.toLowerCase();

  const isJournal = hrefBase === "/journal";
  const displaySubtitle = subtitle !== undefined ? subtitle : (isJournal ? t("posts.journalSubtitle") : t("posts.blogSubtitle"));

  const filteredPosts = posts.filter((post) => {
    const title = post.title?.toLowerCase() || "";
    const excerpt = post.excerpt?.toLowerCase() || "";
    const primaryTag = post.primaryTag?.toLowerCase() || "";
    const tags = post.tags || [];

    return (
      title.includes(q) ||
      excerpt.includes(q) ||
      primaryTag.includes(q) ||
      tags.some((tag) => tag?.toLowerCase().includes(q))
    );
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
