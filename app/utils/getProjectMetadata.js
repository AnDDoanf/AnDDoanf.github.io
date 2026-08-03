import fs from "fs";
import matter from "gray-matter";

export default function getProjectMetadata(basePath = "data/portfolio/projects") {
  if (!fs.existsSync(basePath)) {
    return [];
  }

  const files = fs.readdirSync(basePath);
  const markdownProjects = files.filter((file) => file.endsWith(".md"));

  const projects = markdownProjects.map((filename) => {
    const fileContents = fs.readFileSync(`${basePath}/${filename}`, "utf8");
    const { data } = matter(fileContents);

    return {
      title: data.title || "Untitled Project",
      category: data.category || "Individual",
      description: data.description || "",
      image: data.image || "/showroom/production-1.svg",
      tags: Array.isArray(data.tags) ? data.tags : [],
      links: data.links || {},
      slug: filename.replace(".md", ""),
    };
  });

  return projects;
}
