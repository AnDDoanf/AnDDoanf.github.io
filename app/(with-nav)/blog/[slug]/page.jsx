import fs from "fs";
import matter from "gray-matter";
import {
  createHeadingIdResolver,
  extractHeadings,
} from "@/app/utils/extractHeadings";
import MarkdownContent from "@/components/blog/MarkdownContent";
import getPostMetadata from "@/app/utils/getPostMetadata";
import PostNavigator from "@/components/blog/PostNavigator";
import BlogPostMetaHeader from "@/components/blog/BlogPostMetaHeader";
import TableOfContents from "@/components/blog/TableOfContent";
import ScrollToTop from "@/components/ui/ScrollToTop";
import { notFound } from "next/navigation";

function getPostContent(slug) {
  const file = `data/blog_posts/${slug}.md`;

  if (!slug || !fs.existsSync(file)) {
    notFound();
  }

  return matter(fs.readFileSync(file, "utf-8"));
}

export async function generateStaticParams() {
  const posts = getPostMetadata("data/blog_posts");
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostContent(slug);
  const title = post.data.title || slug.replaceAll("-", " ");
  const description = post.data.description || post.data.excerpt || "";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.data.date ? new Date(post.data.date).toISOString() : undefined,
      authors: post.data.author?.name ? [post.data.author.name] : ["An Doan"],
      tags: post.data.tags || [],
      images: post.data.image ? [{ url: post.data.image }] : [],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getPostContent(slug);
  const posts = getPostMetadata("data/blog_posts");
  const currentIndex = posts.findIndex((entry) => entry.slug === slug);

  const headings = extractHeadings(post.content);
  const resolveHeadingId = createHeadingIdResolver(headings);
  const previousPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost =
    currentIndex >= 0 && currentIndex < posts.length - 1
      ? posts[currentIndex + 1]
      : null;

  return (
    <main className="post-layout">
      {/* Article */}
      <article className="post-content">
        <BlogPostMetaHeader
          title={post.data.title}
          date={post.data.date}
          author={post.data.author}
        />

        <MarkdownContent
          content={post.content}
          resolveHeadingId={resolveHeadingId}
        />

        <PostNavigator
          previousPost={previousPost}
          nextPost={nextPost}
          hrefBase="/blog"
        />

        <ScrollToTop />
      </article>

      {/* Sidebar */}
      <TableOfContents headings={headings} />
    </main>
  );
}
