import getPostMetadata from "@/app/utils/getPostMetadata";
import BlogClient from "@/components/blog/BlogClient";

export default function BlogPage() {
  const postMetadata = getPostMetadata("data/blog_posts");

  return (
    <main className="blog-post-container post-index-page">
      <BlogClient posts={postMetadata} />
    </main>
  );
}
