import fs from "fs";
import matter from "gray-matter";

function extractExcerpt(content, maxWords = 12) {
    const text = content
        .replace(/[#>*_`]/g, "")
        .replace(/\n+/g, " ")
        .trim();

    return text.split(" ").slice(0, maxWords).join(" ");
}

export default function getPoemMetadata(basePath) {
    const files = fs.readdirSync(basePath).filter(f => f.endsWith(".md"));
    const now = new Date();

    const poems = files
        .map((filename) => {
        const file = fs.readFileSync(`${basePath}/${filename}`, "utf8");
        const { data, content } = matter(file);
        const poemDate = data.date ? new Date(data.date) : null;
        console.log('showing time: ' + (poemDate));
        return {
            title: data.title,
            date: poemDate,
            slug: filename.replace(".md", ""),
            excerpt: extractExcerpt(content),
        };
        })
        .filter((poem) => {
            if (!poem.date) return true; 
            return poem.date <= now;
        })
        .sort((a, b) => {
            if (!a.date || !b.date) return 0;
            return b.date - a.date;
        })
        .map((poem) => ({
            ...poem,
            date: poem.date
                ? poem.date.toISOString().split("T")[0]
                : "No Date Added",
        }));
    return poems;
}
