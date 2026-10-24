import getPostMetadata, { resolvePostCategory } from "@/app/utils/getPostMetadata";

function escapeXml(unsafe: string) {
  return (unsafe || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const siteUrl = "https://anddoanf.github.io";
  let posts: any[] = [];

  try {
    const rawPosts = getPostMetadata("data/blog_posts");
    posts = rawPosts.filter((p) => resolvePostCategory(p.category) !== "draft");
  } catch {
    posts = [];
  }

  const itemsXml = posts
    .map((post) => {
      const postUrl = `${siteUrl}/blog/${post.slug}`;
      const pubDate = post.date ? new Date(post.date).toUTCString() : new Date().toUTCString();
      const title = escapeXml(post.title || post.slug);
      const description = escapeXml(post.excerpt || post.description || "");

      return `    <item>
      <title>${title}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${description}</description>
    </item>`;
    })
    .join("\n");

  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AnDDoanf — Engineering &amp; Thoughts</title>
    <link>${siteUrl}</link>
    <description>Articles, fullstack engineering journals, and reflections by An Doan</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;

  return new Response(rssFeed, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
