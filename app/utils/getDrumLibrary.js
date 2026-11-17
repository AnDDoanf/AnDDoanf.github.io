import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export default function getDrumLibrary() {
  const libraryRoot = path.join(process.cwd(), "data/drum-notation");
  const manifest = JSON.parse(fs.readFileSync(path.join(libraryRoot, "manifest.json"), "utf8"));

  return Object.fromEntries(Object.entries(manifest).map(([kind, entries]) => [
    kind,
    entries.map((entry) => {
      const markdown = fs.readFileSync(path.join(libraryRoot, entry.file), "utf8");
      const { data, content } = matter(markdown);
      const pattern = content.match(/```json\s*([\s\S]*?)\s*```/);

      return {
        ...entry,
        title: data.title || entry.title,
        category: data.category || kind,
        style: data.style || "",
        difficulty: data.difficulty || "",
        sticking: data.sticking || "",
        coordination: [data.leftFootOstinato, data.kickOstinato].filter(Boolean).join("; "),
        tempo: Number(data.tempo || 100),
        bars: Number(data.bars || 1),
        division: Number(data.division || 16),
        timeSignature: data.timeSignature || [4, 4],
        description: content.trim().split("\n\n")[0],
        reference: data.reference,
        referenceTitle: data.referenceTitle,
        pattern: pattern ? JSON.parse(pattern[1]) : {},
      };
    }),
  ]));
}
