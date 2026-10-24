import type { MetadataRoute } from "next";
import getPostMetadata, { resolvePostCategory } from "@/app/utils/getPostMetadata";
import getProjectMetadata from "@/app/utils/getProjectMetadata";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = "https://anddoanf.github.io";

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/poetry`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/mindmap`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/giapha`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/me`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Dynamic Blog posts (excluding drafts)
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = getPostMetadata("data/blog_posts");
    blogRoutes = posts
      .filter((post) => resolvePostCategory(post.category) !== "draft")
      .map((post) => ({
        url: `${siteUrl}/blog/${post.slug}`,
        lastModified: post.date ? new Date(post.date) : new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      }));
  } catch {
    // Graceful fallback if data directory is empty
  }

  // Dynamic Portfolio projects
  let projectRoutes: MetadataRoute.Sitemap = [];
  try {
    const projects = getProjectMetadata();
    projectRoutes = projects.map((project) => ({
      url: `${siteUrl}/portfolio/${project.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
  } catch {
    // Graceful fallback if data directory is empty
  }

  return [...staticRoutes, ...blogRoutes, ...projectRoutes];
}
