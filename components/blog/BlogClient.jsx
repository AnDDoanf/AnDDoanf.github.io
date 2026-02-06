"use client";

import { useState } from "react";
import BlogPostCard from "./BlogPostCard";

export default function BlogClient({ posts }) {
  const [query, setQuery] = useState("");

  const q = query.toLowerCase();

  const filteredPosts = posts.filter((post) => {
    const title = post.title?.toLowerCase() || "";
    const excerpt = post.excerpt?.toLowerCase() || "";
    const tags = post.tags || [];

    return (
      title.includes(q) ||
      excerpt.includes(q) ||
      tags.some((tag) => tag?.toLowerCase().includes(q))
    );
  });

  return (
      <div className="post-grid">
        <input
            type="text"
            className="blog-search"
            placeholder="Search by title, tag, or content..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
        />
        {filteredPosts.map((post) => (
          <BlogPostCard key={post.slug} post={post} />
        ))}
      </div>
  );
}
