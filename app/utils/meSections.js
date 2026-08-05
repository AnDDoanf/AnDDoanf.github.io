import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ME_SECTIONS_PATH = path.join(process.cwd(), "data", "me");

export function getMeSections() {
  return fs
    .readdirSync(ME_SECTIONS_PATH)
    .filter((file) => file.toLowerCase().endsWith(".md"))
    .map((file) => {
      const source = fs.readFileSync(path.join(ME_SECTIONS_PATH, file), "utf-8");
      const { data, content } = matter(source);

      return {
        ...data,
        slug: file.replace(/\.md$/i, ""),
        title: data.title,
        eyebrow: data.eyebrow,
        order: Number(data.order) || 0,
        content,
      };
    })
    .sort((a, b) => a.order - b.order);
}
