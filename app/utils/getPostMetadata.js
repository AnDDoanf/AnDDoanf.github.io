import fs from "fs";
import matter from "gray-matter";
import { resolvePostCoverImage } from "@/app/utils/postCovers";

function getExcerpt(markdown, maxLines = 2, maxWords = 20) { 
    let excerpt = markdown
        .split("\n")
        .map(line => line.trim())
        .filter(line =>
        line &&
        !line.startsWith("#") &&     // skip headings
        !line.startsWith(">") &&     // skip blockquotes
        !line.startsWith("```")      // skip code blocks
        )
        .slice(0, maxLines)
        .join(" ")
        .replace(/!\[.*?\]\(.*?\)/g, "") // remove images
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links → text
        .replace(/[`*_>#]/g, "") // basic markdown cleanup
        .trim();
    if (excerpt.split(" ").length > maxWords) {
        excerpt = excerpt.split(" ").slice(0, maxWords).join(" ") + "...";
    }
    
    return excerpt
}

function normalizeList(value) {
    if (Array.isArray(value)) {
        return value.map((item) => String(item).trim()).filter(Boolean);
    }

    if (value == null || value === "") {
        return [];
    }

    return [String(value).trim()].filter(Boolean);
}

function formatDateLabel(date) {
    return new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
}

export default function getPostMetadata(basePath) {
    const folder = basePath + "/";
    const files = fs.readdirSync(folder);
    const markdownPosts = files.filter((file) => file.endsWith(".md"));

    const now = new Date();

    const posts = markdownPosts
        .map((filename) => {
            const fileContents = fs.readFileSync(`${basePath}/${filename}`, "utf8");
            const {data, content} = matter(fileContents);

            const rawDate = data.date;
            const postDate = rawDate ? new Date(rawDate) : null;
            const title = data.title || "Untitled Post";
            const categories = normalizeList(data.categories);
            const tags = normalizeList(data.tags);

            return {
                title,
                date: postDate,
                categories,
                tags,
                slug: filename.replace(".md", ""),
                excerpt: getExcerpt(content, 1) || "No excerpt available",
                image: resolvePostCoverImage(data.image, tags),
                imageAlt: String(data.imageAlt || `${title} cover image`).trim(),
                primaryTag: tags[0] || categories[0] || "",
            };
        })

        .filter((post) => {
            if (!post.date) return true; 
            return post.date <= now;
        })
        // optional: sort newest first
        .sort((a, b) => {
            if (!a.date || !b.date) return 0;
            return b.date - a.date;
        })
        // format date for output
        .map((post) => ({
            ...post,
            date: post.date
                ? formatDateLabel(post.date)
                : "No Date Added",
            dateIso: post.date
                ? post.date.toISOString().split("T")[0]
                : "",
        }));

    return posts;
}
