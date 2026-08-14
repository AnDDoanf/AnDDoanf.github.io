import matter from "gray-matter";

export const GALLERY_STYLES = ["editorial", "framed", "polaroid"];
export const GALLERY_TYPES = ["images", "pdf"];

const DEFAULT_GALLERY_STYLE = "editorial";
const DEFAULT_GALLERY_TYPE = "images";

function humanizeSlug(value) {
  return String(value ?? "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function buildExcerpt(content, maxWords = 18) {
  const words = String(content ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !line.startsWith("!"))
    .join(" ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_>#]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "";
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")}...`;
}

export function normalizeGalleryStyle(style) {
  const nextStyle = String(style ?? "").trim().toLowerCase();
  return GALLERY_STYLES.includes(nextStyle)
    ? nextStyle
    : DEFAULT_GALLERY_STYLE;
}

export function normalizeGalleryType(type) {
  const nextType = String(type ?? "").trim().toLowerCase();

  if (nextType === "image" || nextType === "gallery") {
    return "images";
  }

  if (nextType === "photobook") {
    return "pdf";
  }

  return GALLERY_TYPES.includes(nextType)
    ? nextType
    : DEFAULT_GALLERY_TYPE;
}

export function parseGalleryMarkdown(fileContents, fallbackTitle = "Gallery") {
  const { data, content } = matter(fileContents);
  const title = String(data.title ?? humanizeSlug(fallbackTitle) ?? "Gallery").trim()
    || "Gallery";

  return {
    title,
    description:
      String(data.description ?? "").trim() || buildExcerpt(content),
    type: normalizeGalleryType(data.type),
    style: normalizeGalleryStyle(data.style),
    cover: String(data.cover ?? "").trim(),
    pdf: String(data.pdf ?? "").trim(),
    location: String(data.location ?? data.title ?? humanizeSlug(fallbackTitle)).trim(),
    latitude: Number.isFinite(Number(data.latitude)) ? Number(data.latitude) : null,
    longitude: Number.isFinite(Number(data.longitude)) ? Number(data.longitude) : null,
    mapX: Number.isFinite(Number(data.mapX)) ? Number(data.mapX) : null,
    mapY: Number.isFinite(Number(data.mapY)) ? Number(data.mapY) : null,
    mapOffsetX: Number.isFinite(Number(data.mapOffsetX)) ? Number(data.mapOffsetX) : 0,
    mapOffsetY: Number.isFinite(Number(data.mapOffsetY)) ? Number(data.mapOffsetY) : 0,
    labelX: Number.isFinite(Number(data.labelX)) ? Number(data.labelX) : null,
    labelY: Number.isFinite(Number(data.labelY)) ? Number(data.labelY) : null,
    columns: Number.isInteger(Number(data.columns)) && Number(data.columns) > 0
      ? Number(data.columns)
      : null,
    content,
    meta: data,
  };
}
