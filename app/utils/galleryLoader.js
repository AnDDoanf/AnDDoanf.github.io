import fs from "fs";
import path from "path";

import { parseGalleryMarkdown } from "@/app/utils/galleryParser";

const GALLERY_ROOT = path.join(process.cwd(), "data", "gallery");
const IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".avif",
  ".svg",
]);
const PDF_EXTENSIONS = new Set([".pdf"]);
const MARKDOWN_PRIORITY = ["gallery.md", "index.md", "story.md", "readme.md"];

function sortNaturally(left, right) {
  return left.localeCompare(right, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function humanizeName(value) {
  return String(value ?? "")
    .replace(/\.[^.]+$/, "")
    .replace(/^[\d\-_ ]+/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function toPublicGallerySrc(slug, filename) {
  const encode = (segment) => encodeURIComponent(segment);
  return `/gallery/${encode(slug)}/${encode(filename)}`;
}

function getGalleryDirectories() {
  if (!fs.existsSync(GALLERY_ROOT)) return [];

  return fs.readdirSync(GALLERY_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort(sortNaturally);
}

function getGalleryFolderPath(slug) {
  return path.join(GALLERY_ROOT, slug);
}

function findGalleryMarkdown(folderPath) {
  const markdownFiles = fs.readdirSync(folderPath)
    .filter((file) => file.toLowerCase().endsWith(".md"))
    .sort(sortNaturally);

  if (markdownFiles.length === 0) return "";

  for (const preferredName of MARKDOWN_PRIORITY) {
    const match = markdownFiles.find(
      (file) => file.toLowerCase() === preferredName,
    );
    if (match) return match;
  }

  return markdownFiles[0];
}

function readGalleryDoc(slug) {
  const folderPath = getGalleryFolderPath(slug);
  const markdownFile = findGalleryMarkdown(folderPath);

  if (!markdownFile) {
    return {
      title: humanizeName(slug) || "Gallery",
      description: "",
      type: "images",
      style: "editorial",
      cover: "",
      pdf: "",
      content: "",
      meta: {},
    };
  }

  const filePath = path.join(folderPath, markdownFile);
  const fileContents = fs.readFileSync(filePath, "utf8");
  return parseGalleryMarkdown(fileContents, slug);
}

function readGalleryImages(slug) {
  const folderPath = getGalleryFolderPath(slug);

  return fs.readdirSync(folderPath)
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort(sortNaturally)
    .map((filename, index) => {
      const caption = humanizeName(filename) || `Image ${index + 1}`;
      return {
        name: filename,
        src: toPublicGallerySrc(slug, filename),
        alt: caption,
        caption,
      };
    });
}

function readGalleryPdf(slug, preferredPdfName = "") {
  const folderPath = getGalleryFolderPath(slug);
  const pdfFiles = fs.readdirSync(folderPath)
    .filter((file) => PDF_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort(sortNaturally);

  if (pdfFiles.length === 0) return null;

  const filename = preferredPdfName && pdfFiles.includes(preferredPdfName)
    ? preferredPdfName
    : pdfFiles[0];

  return {
    name: filename,
    src: toPublicGallerySrc(slug, filename),
  };
}

function pickCover(images, preferredCoverName) {
  if (images.length === 0) return null;
  if (!preferredCoverName) return images[0];

  return images.find((image) => image.name === preferredCoverName) ?? images[0];
}

export function loadGalleryCollection() {
  return getGalleryDirectories()
    .map((slug) => {
      const doc = readGalleryDoc(slug);
      const images = readGalleryImages(slug);
      const pdf = readGalleryPdf(slug, doc.pdf);
      const cover = pickCover(images, doc.cover);
      const type = doc.type === "photobook" || (!cover && pdf)
        ? "photobook"
        : "images";

      if (type === "photobook" && !pdf) return null;
      if (type === "images" && !cover) return null;

      return {
        slug,
        title: doc.title,
        description: doc.description,
        type,
        style: doc.style,
        imageCount: images.length,
        coverSrc: cover?.src ?? "",
        coverAlt: cover?.alt ?? doc.title,
        pdfName: pdf?.name ?? "",
      };
    })
    .filter(Boolean);
}

export function loadGallery(slug) {
  const folderPath = getGalleryFolderPath(slug);
  if (!slug || !fs.existsSync(folderPath)) return null;

  const doc = readGalleryDoc(slug);
  const images = readGalleryImages(slug);
  const pdf = readGalleryPdf(slug, doc.pdf);
  const cover = pickCover(images, doc.cover);
  const type = doc.type === "photobook" || (!cover && pdf)
    ? "photobook"
    : "images";

  if (type === "photobook" && !pdf) return null;
  if (type === "images" && !cover) return null;

  return {
    slug,
    title: doc.title,
    description: doc.description,
    type,
    style: doc.style,
    content: doc.content,
    imageCount: images.length,
    coverSrc: cover?.src ?? "",
    coverAlt: cover?.alt ?? doc.title,
    images,
    pdf,
  };
}
