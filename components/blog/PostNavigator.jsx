"use client";

import Link from "next/link";
import { useI18n } from "@/components/i18n/I18nProvider";

function buildPostHref(hrefBase, slug) {
  const normalizedBase = hrefBase ? hrefBase.replace(/\/+$/, "") : "";
  const normalizedSlug = String(slug ?? "").replace(/^\/+/, "");

  return normalizedBase
    ? `${normalizedBase}/${normalizedSlug}`
    : `/${normalizedSlug}`;
}

function PostNavigatorCard({
  post,
  hrefBase,
  direction,
  label,
}) {
  if (!post) {
    return <div className="post-navigation-spacer" aria-hidden="true" />;
  }

  const isPrevious = direction === "previous";
  const href = post.href ?? buildPostHref(hrefBase, post.slug);

  return (
    <Link
      href={href}
      className={`post-navigation-link ${
        isPrevious ? "is-previous" : "is-next"
      }`}
    >
      <span className="post-navigation-label">
        <i
          className={`bi ${
            isPrevious ? "bi-arrow-left" : "bi-arrow-right"
          }`}
          aria-hidden="true"
        />
        {label}
      </span>

      <span className="post-navigation-title">{post.title}</span>

      <span className="post-navigation-meta">{post.date}</span>
    </Link>
  );
}

export default function PostNavigator({
  previousPost,
  nextPost,
  hrefBase,
}) {
  const { t } = useI18n();

  if (!previousPost && !nextPost) {
    return null;
  }

  const isJournal = hrefBase === "/journal";
  const previousLabel = isJournal
    ? t("posts.previousJournal")
    : t("posts.previousPost");
  const nextLabel = isJournal
    ? t("posts.nextJournal")
    : t("posts.nextPost");

  return (
    <nav className="post-navigation" aria-label={t("posts.navigation")}>
      <PostNavigatorCard
        post={previousPost}
        hrefBase={hrefBase}
        direction="previous"
        label={previousLabel}
      />
      <PostNavigatorCard
        post={nextPost}
        hrefBase={hrefBase}
        direction="next"
        label={nextLabel}
      />
    </nav>
  );
}
