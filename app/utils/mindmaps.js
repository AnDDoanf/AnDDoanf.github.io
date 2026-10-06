import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getAllTrees } from "./giapha";
import { MINDMAP_TYPES, validateLearningMap } from "./mindmapGraph.mjs";

const directory = path.join(process.cwd(), "data/mindmaps");

export function getAllMindmaps() {
  if (!fs.existsSync(directory)) return [];
  const trees = getAllTrees();
  const slugs = new Set();
  return MINDMAP_TYPES.flatMap(type => {
    const folder = path.join(directory, type);
    if (!fs.existsSync(folder)) return [];
    return fs.readdirSync(folder).filter(file => file.endsWith(".md")).map(file => ({ type, file }));
  }).map(({ type, file }) => {
    const raw = fs.readFileSync(path.join(directory, type, file), "utf8");
    const { data, content } = matter(raw);
    const slug = file.replace(/\.md$/, "");
    if (slugs.has(slug)) throw new Error(`${file}: mindmap filenames must be unique across type folders.`);
    slugs.add(slug);
    if (data.type && data.type !== type) throw new Error(`${type}/${file}: type must match its folder.`);
    data.type = type;
    if (!data.title) throw new Error(`${file}: title is required.`);
    const tree = data.type === "family-tree" ? trees.find(tree => tree.id === data.treeId) : null;
    if (data.type === "family-tree" && !tree) throw new Error(`${file}: unknown family tree ${data.treeId}.`);
    if (data.type === "learning") validateLearningMap(data);
    return { slug, data, content, raw, tree };
  }).sort((a, b) => (a.data.order || 0) - (b.data.order || 0) || a.data.title.localeCompare(b.data.title));
}

export function getMindmapSummaries() {
  return getAllMindmaps().map(({ slug, data, tree }) => ({
    slug, title: data.title, titleVi: data.titleVi || data.title,
    description: data.description || "", descriptionVi: data.descriptionVi || data.description || "",
    cover: data.cover || "", coverAlt: data.coverAlt || "", coverAltVi: data.coverAltVi || data.coverAlt || "",
    type: data.type, count: tree ? tree.persons.length : data.nodes.length,
  }));
}
