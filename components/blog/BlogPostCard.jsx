"use client";

import { useI18n } from "@/components/i18n/I18nProvider";
import Card from "@/components/ui/Card";

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
    <Card
      as="article"
      href={href}
      className="card post-card"
      image={post.image}
      imageAlt={post.imageAlt || `${post.title} cover image`}
      eyebrow={eyebrow}
      title={post.title}
      description={post.excerpt}
      showArrow
      meta={{
        icon: "bi bi-person",
        label: authorName,
        date: formattedDate,
      }}
      tags={post.tags?.slice(0, 2).map(formatTagLabel)}
    />
  );
}
