// utils/journal.js
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_PATH = path.join(process.cwd(), "data/blog_posts");

export function getJournalPost(slug) {
  const filePath = path.join(BLOG_PATH, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const file = fs.readFileSync(filePath, "utf-8");

  const { data, content } = matter(file);

  return {
    meta: data,
    content,
  };
}

export function getAllJournalPosts() {
  if (!fs.existsSync(BLOG_PATH)) return [];
  const files = fs.readdirSync(BLOG_PATH);

  return files
    .filter((file) => file.toLowerCase().endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/i, "");
      const filePath = path.join(BLOG_PATH, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(fileContent);

      return {
        slug,
        ...data,
      };
    })
    .filter((post) => post.category === "journal");
}
