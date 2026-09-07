import fs from "fs";
import path from "path";
import matter from "gray-matter";

const GIAPHA_DIR = path.join(process.cwd(), "data", "giapha");

export function getAllTrees() {
  if (!fs.existsSync(GIAPHA_DIR)) {
    return [];
  }

  const files = fs.readdirSync(GIAPHA_DIR).filter((f) => f.endsWith(".md"));
  const trees = files.map((file) => {
    const fullPath = path.join(GIAPHA_DIR, file);
    const fileContent = fs.readFileSync(fullPath, "utf-8");
    const { data, content } = matter(fileContent);

    const persons = Array.isArray(data.persons) ? data.persons : [];

    // Normalize and cross-link relationships
    const personMap = new Map();
    persons.forEach((p) => {
      personMap.set(p.id, {
        ...p,
        first_name: p.first_name || "",
        middle_name: p.middle_name || "",
        last_name: p.last_name || "",
        display_name: p.display_name || `${p.last_name} ${p.middle_name} ${p.first_name}`.trim(),
        maiden_name: p.maiden_name || "",
        gender: p.gender || "unknown",
        birth_date: p.birth_date || "",
        birth_date_precision: p.birth_date_precision || "year",
        death_date: p.death_date || null,
        death_date_precision: p.death_date_precision || "unknown",
        is_living: Boolean(p.is_living),
        birth_place: p.birth_place || "",
        death_place: p.death_place || "",
        occupation: p.occupation || "",
        biography: p.biography || "",
        avatar_url: p.avatar_url || "",
        generation: Number(p.generation) || 1,
        category: p.category || "General",
        parent_ids: Array.isArray(p.parent_ids) ? p.parent_ids : [],
        spouse_ids: Array.isArray(p.spouse_ids) ? p.spouse_ids : [],
        children_ids: Array.isArray(p.children_ids) ? p.children_ids : [],
      });
    });

    // Cross-link children and spouses
    personMap.forEach((p) => {
      // Connect parent -> children
      p.parent_ids.forEach((parentId) => {
        const parent = personMap.get(parentId);
        if (parent && !parent.children_ids.includes(p.id)) {
          parent.children_ids.push(p.id);
        }
      });
      // Connect spouse <-> spouse
      p.spouse_ids.forEach((spouseId) => {
        const spouse = personMap.get(spouseId);
        if (spouse && !spouse.spouse_ids.includes(p.id)) {
          spouse.spouse_ids.push(p.id);
        }
      });
    });

    const normalizedPersons = Array.from(personMap.values());
    const generationsList = Array.from(
      new Set(normalizedPersons.map((p) => p.generation))
    ).sort((a, b) => a - b);

    return {
      id: data.id || file.replace(/\.md$/, ""),
      title: data.title || "Gia Phả",
      titleEn: data.titleEn || data.title || "Family Tree",
      branch: data.branch || "",
      origin: data.origin || "",
      motto: data.motto || "",
      coverSrc: data.coverSrc || "",
      categories: Array.isArray(data.categories) ? data.categories : [],
      timeline: Array.isArray(data.timeline) ? data.timeline : [],
      generations: generationsList,
      persons: normalizedPersons,
      chronicle: content || "",
      stats: {
        total: normalizedPersons.length,
        generations: generationsList.length,
        living: normalizedPersons.filter((p) => p.is_living).length,
        deceased: normalizedPersons.filter((p) => !p.is_living).length,
        male: normalizedPersons.filter((p) => p.gender === "male").length,
        female: normalizedPersons.filter((p) => p.gender === "female").length,
      },
    };
  });

  return trees;
}

export function getTreeById(id) {
  const trees = getAllTrees();
  return trees.find((t) => t.id === id) || null;
}
