"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/components/i18n/I18nProvider";

function formatTagLabel(tag) {
  return String(tag ?? "")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function BlogPostCard({ post, hrefBase = "/blog" }) {
  const { t, locale } = useI18n();
  const normalizedBase = hrefBase ? hrefBase.replace(/\/+$/, "") : "";
  const slug = post.slug ?? "";
  const fallbackHref = normalizedBase ? `${normalizedBase}/${slug}` : `/${slug}`;
  const href = post.href ?? fallbackHref;
  const primaryTag = post.primaryTag || post.tags?.[0] || "";

  const categoryKey = post.category?.toLowerCase();
  const categoryLabel =
    categoryKey && (categoryKey === "life" || categoryKey === "faith" || categoryKey === "journal")
      ? t(`posts.${categoryKey}`)
      : post.category
        ? formatTagLabel(post.category)
        : "";

  const tagLabel = primaryTag ? formatTagLabel(primaryTag) : "";
  const fallbackBlog = t("posts.blogTitle");
  const eyebrow = categoryLabel || tagLabel || fallbackBlog;

  const authorName =
    post.author?.name ||
    (typeof post.author === "string" ? post.author : "An Doan");

  const formattedDate = post.dateIso
    ? new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(post.dateIso))
    : post.date;

  return (
    <article className="card post-card">
      <Link href={href} className="post-card-link">
        <div className="card-cover post-card-cover" aria-hidden="true">
          <Image
            src={post.image}
            alt={post.imageAlt || `${post.title} cover image`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
            priority={false}
          />
        </div>

        <div className="post-card-body">
          <p className="post-card-eyebrow">{eyebrow}</p>

          <div className="post-card-heading">
            <h2 className="post-card-title">{post.title}</h2>
            <span className="post-card-arrow" aria-hidden="true">
              <i className="bi bi-arrow-up-right" />
            </span>
          </div>

          <p className="post-card-excerpt">{post.excerpt}</p>

          <div className="post-card-footer">
            <div className="post-card-meta">
              <span className="post-card-icon" aria-hidden="true">
                <i className="bi bi-person" />
              </span>
              <div className="post-card-meta-copy">
                <p className="post-card-meta-label">{authorName}</p>
                <p className="post-card-date">{formattedDate}</p>
              </div>
            </div>

            {post.tags?.length > 0 && (
              <div className="card-tags post-card-tags" aria-hidden="true">
                {post.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="card-tag post-card-tag">
                    {formatTagLabel(tag)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
