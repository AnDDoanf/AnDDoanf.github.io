import Image from "next/image";
import Link from "next/link";
import { tagIcons } from "@/data/blog_posts/tagIcons";

function formatTagLabel(tag) {
  return String(tag ?? "")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function BlogPostCard({ post, hrefBase = "/blog" }) {
  const normalizedBase = hrefBase ? hrefBase.replace(/\/+$/, "") : "";
  const slug = post.slug ?? "";
  const fallbackHref = normalizedBase ? `${normalizedBase}/${slug}` : `/${slug}`;
  const href = post.href ?? fallbackHref;
  const primaryTag = post.primaryTag || post.tags?.[0] || "";
  const primaryIcon = tagIcons[primaryTag.toLowerCase()] || tagIcons.default;
  const label = primaryTag
    ? formatTagLabel(primaryTag)
    : hrefBase === "/journal"
      ? "Journal"
      : "Blog";

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
          <p className="post-card-eyebrow">{label}</p>

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
                <i className={primaryIcon} />
              </span>
              <div className="post-card-meta-copy">
                <p className="post-card-meta-label">{label}</p>
                <p className="post-card-date">{post.date}</p>
              </div>
            </div>

            {post.tags?.length > 1 && (
              <div className="card-tags post-card-tags" aria-hidden="true">
                {post.tags.slice(1, 3).map((tag) => (
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
