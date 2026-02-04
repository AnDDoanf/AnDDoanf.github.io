import fs from "fs";
import matter from "gray-matter";
import PoemPager from "@/components/poem/PoemPager";

function getPoems() {
  const dir = "data/poems";
  return fs.readdirSync(dir)
    .filter(f => f.endsWith(".md"))
    .map(filename => {
      const raw = fs.readFileSync(`${dir}/${filename}`, "utf-8");
      const { data, content } = matter(raw);

      return {
        slug: filename.replace(".md", ""),
        title: data.title,
        content,
      };
    });
}

export default function PoemsPage() {
  const poems = getPoems();

  return <PoemPager poems={poems} />;
}
