// utils/journal.js
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const JOURNAL_PATH = path.join(process.cwd(), "data/journal_posts");

export function getJournalPost(slug) {
  const filePath = path.join(JOURNAL_PATH, `${slug}.md`);
  const file = fs.readFileSync(filePath, "utf-8");

  const { data, content } = matter(file);

  return {
    meta: data,
    content,
  };
}

// ✅ ADD THIS
export function getAllJournalPosts() {
  const files = fs.readdirSync(JOURNAL_PATH);

  return files
    .filter((file) => file.toLowerCase().endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/i, "");
      const filePath = path.join(JOURNAL_PATH, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(fileContent);

      return {
        slug,
        ...data,
      };
    });
}
