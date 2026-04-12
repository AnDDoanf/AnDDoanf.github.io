import fs from "fs";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import getPostMetadata from "@/app/utils/getPostMetadata";
import ScrollToTop from "@/components/ui/ScrollToTop";
import GoBack from "@/components/ui/GoBack";
import { notFound } from "next/navigation";

function extractHeadings(markdown) {
  return markdown
    .split("\n")
    .filter(line => line.startsWith("## ") || line.startsWith("### "))
    .map(line => {
      const level = line.startsWith("### ") ? 3 : 2;
      const text = line.replace(/^#{2,3}\s+/, "").replaceAll("*", "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w]+/g, "-")
        .replace(/(^-|-$)/g, "");

      return { text, id, level };
    });
}


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
  return {
    title: slug.replaceAll("-", " "),
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getPostContent(slug);

  const headings = extractHeadings(post.content);

  return (
    <main className="post-layout">
      {/* Article */}
      <article className="post-content">
        <h1>{post.data.title}</h1>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h2: ({ children }) => {
              const text = String(children);
              const id = text
                .toLowerCase()
                .replace(/[^\w]+/g, "-")
                .replace(/(^-|-$)/g, "");

              return <h2 id={id}>{children}</h2>;
            },
            h3: ({ children }) => {
              const text = String(children);
              const id = text
                .toLowerCase()
                .replace(/[^\w]+/g, "-")
                .replace(/(^-|-$)/g, "");

              return <h3 id={id}>{children}</h3>;
            },
          }}
        >
          {post.content}
        </ReactMarkdown>

        <ScrollToTop />
        <GoBack href="" />
      </article>

      {/* Sidebar */}
      {headings.length > 0 && (
        <aside className="toc">
          <p className="toc-title">On this page</p>
          <ul>
            {headings.map(h => (
              <li
                key={h.id}
                className={h.level === 3 ? "toc-sub" : ""}
              >
                <a href={`#${h.id}`}>{h.text}</a>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </main>
  );
}

