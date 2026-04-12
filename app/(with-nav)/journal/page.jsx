import getPostMetadata from "@/app/utils/getPostMetadata";
import BlogClient from "@/components/blog/BlogClient";
import GoBack from "@/components/ui/GoBack";

export default function JournalPage() {
  const postMetadata = getPostMetadata("data/journal_posts");

  return (
    <main className="blog-post-container">
      <BlogClient posts={postMetadata} hrefBase="/journal" />
      <GoBack href="/" />
    </main>
  );
}
