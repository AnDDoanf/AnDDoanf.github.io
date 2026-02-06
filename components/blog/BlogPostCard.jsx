import Link from "next/link";
import { tagIcons } from "@/data/blog_posts/tagIcons";

export default function BlogPostCard({ post }) {
  return (
    <Link href={`/blog/${post.slug ?? ""}`} className="card">
      {/* title + tags row */}
      <div className="card-header">
        <h2 className="card-title">{post.title}</h2>

        {post.tags?.length > 0 && (
          <div className="card-tags">
            {post.tags.map((tag) => (
              <span key={tag} className="card-tag">
                <i
                  className={
                    tagIcons[tag.toLowerCase()] || tagIcons.default
                  }
                />
                <span className="card-tag-text">{tag}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <p className="card-date">{post.date}</p>
      <p className="card-excerpt">{post.excerpt}</p>
    </Link>
  );
}
