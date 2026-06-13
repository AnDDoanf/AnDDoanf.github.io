import fs from "fs";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  createHeadingIdResolver,
  extractHeadings,
} from "@/app/utils/extractHeadings";
import getPostMetadata from "@/app/utils/getPostMetadata";
import PostNavigator from "@/components/blog/PostNavigator";
import TableOfContents from "@/components/blog/TableOfContent";
import ScrollToTop from "@/components/ui/ScrollToTop";
import { notFound } from "next/navigation";

function getPostContent(slug) {
  const file = `data/journal_posts/${slug}.md`;

  if (!slug || !fs.existsSync(file)) {
    notFound();
  }

  return matter(fs.readFileSync(file, "utf-8"));
}

export async function generateStaticParams() {
  const posts = getPostMetadata("data/journal_posts");
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostContent(slug);

  return {
    title: post.data.title || slug.replaceAll("-", " "),
  };
}

export default async function JournalPostPage({ params }) {
  const { slug } = await params;
  const post = getPostContent(slug);
  const posts = getPostMetadata("data/journal_posts");
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
        <h1>{post.data.title}</h1>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h2: ({ children }) => {
              const id = resolveHeadingId(children, 2);

              return <h2 id={id}>{children}</h2>;
            },
            h3: ({ children }) => {
              const id = resolveHeadingId(children, 3);

              return <h3 id={id}>{children}</h3>;
            },
          }}
        >
          {post.content}
        </ReactMarkdown>

        <PostNavigator
          previousPost={previousPost}
          nextPost={nextPost}
          hrefBase="/journal"
        />

        <ScrollToTop />
      </article>

      {/* Sidebar */}
      <TableOfContents headings={headings} />
    </main>
  );
}

