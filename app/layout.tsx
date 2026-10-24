import type { Metadata, Viewport } from "next";
import ScrollToTop from "@/components/ui/ScrollToTop";
import CommandPalette from "@/components/ui/CommandPalette";
import "bootstrap-icons/font/bootstrap-icons.css";
import "katex/dist/katex.min.css";
import "@xyflow/react/dist/style.css";
import "@/styles/globals.css";
import "@/styles/gallery.css";
import "@/styles/portfolio.css";
import "@/styles/me.css";
import "@/styles/poetry.css";
import "@/styles/updating.css";
import "@/styles/giapha.css";
import "@/styles/mindmap.css";
// import "@/styles/culinary.css";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import getPostMetadata, { resolvePostCategory } from "@/app/utils/getPostMetadata";
import getProjectMetadata from "@/app/utils/getProjectMetadata";

export const metadata: Metadata = {
  title: "AnDDoanf",
  description: "A personal website of AnDDoanf",
  icons: {
    icon: 'app/favicon.ico',
  },
  alternates: {
    types: {
      "application/rss+xml": "https://anddoanf.github.io/rss.xml",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

function getGlobalSearchItems() {
  const items: Array<{
    id: string;
    title: string;
    href: string;
    group: string;
    icon: string;
    description?: string;
    tags?: string[];
  }> = [];

  try {
    const posts = getPostMetadata("data/blog_posts");
    posts.forEach((post) => {
      if (resolvePostCategory(post.category) === "draft") return;
      items.push({
        id: `blog-${post.slug}`,
        title: post.title || post.slug,
        href: `/blog/${post.slug}`,
        group: "Blog",
        icon: "bi-file-text",
        description: post.excerpt || post.date || "",
        tags: post.tags || [],
      });
    });
  } catch {
    // Graceful fallback
  }

  try {
    const projects = getProjectMetadata();
    projects.forEach((proj: any) => {
      items.push({
        id: `proj-${proj.slug}`,
        title: proj.title || proj.slug,
        href: `/portfolio/${proj.slug}`,
        group: "Projects",
        icon: "bi-briefcase",
        description: proj.description || "",
        tags: proj.tags || [],
      });
    });
  } catch {
    // Graceful fallback
  }

  return items;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchItems = getGlobalSearchItems();

  return (
    <html lang="en">
      <body className="container">
        <I18nProvider>
          {children}
          <CommandPalette items={searchItems as any} />
        </I18nProvider>
        <ScrollToTop />
      </body>
    </html>
  );
}
