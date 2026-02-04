import getPostMetadata from "@/app/utils/getPostMetadata";
import BlogPostCard from "@/components/blog/BlogPostCard";

export default function BlogPage() {
  const postMetadata = getPostMetadata("data/blog_posts");

  return (
    <main className="blog-post-container">
      <div className="post-grid">
        {postMetadata.map((post) => (
          <BlogPostCard key={post.slug} post={post} />
        ))}
      </div>
    </main>
  );
}
