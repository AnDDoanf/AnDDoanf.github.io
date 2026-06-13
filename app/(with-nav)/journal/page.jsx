import getPostMetadata from "@/app/utils/getPostMetadata";
import BlogClient from "@/components/blog/BlogClient";

export default function JournalPage() {
  const postMetadata = getPostMetadata("data/journal_posts");

  return (
    <main className="blog-post-container post-index-page">
      <BlogClient posts={postMetadata} hrefBase="/journal" />
    </main>
  );
}
