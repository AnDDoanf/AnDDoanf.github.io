"use client";

import { useEffect, useState } from "react";
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
  "christian",
]);

const JOURNAL_TAGS = new Set([
  "programming",
  "fullstack",
  "frontend",
  "system",
  "engineering",
  "react",
  "rendering",
  "system-design",
  "automotive",
  "webdev",
  "languages",
  "projects",
]);

const BLOG_TABS = ["life", "faith", "journal"];

function getBlogTab(post) {
  if (post.category) {
    const cat = String(post.category).trim().toLowerCase();
    if (BLOG_TABS.includes(cat)) {
      return cat;
    }
  }

  const tags = post.tags?.map((tag) => String(tag).trim().toLowerCase()) ?? [];
  if (tags.some((tag) => FAITH_TAGS.has(tag))) return "faith";
  if (tags.some((tag) => JOURNAL_TAGS.has(tag))) return "journal";
  return "life";
}

export default function BlogClient({ posts, hrefBase = "/blog", subtitle }) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("life");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab")?.toLowerCase();
      if (tabParam && BLOG_TABS.includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (tab === "life") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", tab);
      }
      window.history.replaceState({}, "", url.toString());
    }
  };

  const q = query.toLowerCase();

  const isJournal = hrefBase === "/journal";
  const displaySubtitle =
    subtitle !== undefined
      ? subtitle
      : activeTab === "journal" || isJournal
        ? t("posts.journalSubtitle")
        : t("posts.blogSubtitle");

  const filteredPosts = posts.filter((post) => {
    const title = post.title?.toLowerCase() || "";
    const excerpt = post.excerpt?.toLowerCase() || "";
    const primaryTag = post.primaryTag?.toLowerCase() || "";
    const tags = post.tags || [];
    const category = post.category?.toLowerCase() || "";

    const matchesTab = isJournal || getBlogTab(post) === activeTab;
    const matchesQuery =
      title.includes(q) ||
      excerpt.includes(q) ||
      category.includes(q) ||
      primaryTag.includes(q) ||
      tags.some((tag) => tag?.toLowerCase().includes(q));

    return matchesTab && matchesQuery;
  });

  const searchPlaceholder =
    activeTab === "journal" || isJournal
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
        <div
          className="post-category-tabs"
          role="tablist"
          aria-label={t("posts.blogCategories")}
        >
          {BLOG_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`post-category-tab ${activeTab === tab ? "is-active" : ""}`}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => handleTabChange(tab)}
            >
              {t(`posts.${tab}`)}
            </button>
          ))}
        </div>
      )}

      {displaySubtitle && (
        <p className="index-page-subtitle">{displaySubtitle}</p>
      )}

      {filteredPosts.length > 0 ? (
        <div className="post-grid post-card-grid">
          {filteredPosts.map((post) => (
            <BlogPostCard key={post.slug} post={post} hrefBase="/blog" />
          ))}
        </div>
      ) : (
        <p className="post-grid-empty">{t("posts.noResults")}</p>
      )}
    </section>
  );
}
