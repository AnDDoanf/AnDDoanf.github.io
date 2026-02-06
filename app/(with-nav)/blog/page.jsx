import getPostMetadata from "@/app/utils/getPostMetadata";
import BlogClient from "@/components/blog/BlogClient";
import GoBack from "@/components/ui/GoBack";

export default function BlogPage() {
  const postMetadata = getPostMetadata("data/blog_posts");

  return (
    <main className="blog-post-container">
      <BlogClient posts={postMetadata} />
      <GoBack href="/" />
    </main>
  );
}
