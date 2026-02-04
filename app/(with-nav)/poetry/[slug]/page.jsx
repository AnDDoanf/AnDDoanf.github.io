import fs from "fs";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";
import getPoemMetadata from "@/app/utils/getPoemMetadata";

function getPoem(slug) {
    const path = `data/poems/${slug}.md`;

    if (!fs.existsSync(path)) notFound();

    return matter(fs.readFileSync(path, "utf8"));
}

export async function generateStaticParams() {
    const poems = getPoemMetadata("data/poems");
    return poems.map(p => ({ slug: p.slug }));
}

export default async function PoemPage({ params }) {
    const { slug } = await params;
    const poem = getPoem(slug);

    return (
        <article className="post-content poetry">
        <h1>{poem.data.title}</h1>

        <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {poem.content}
        </ReactMarkdown>
        </article>
    );
}
