import fs from "fs";
import path from "path";

import { parseGalleryMarkdown } from "./galleryParser.js";

const GALLERY_ROOT = path.join(process.cwd(), "data", "gallery");
const PUBLIC_GALLERY_ROOT = path.join(process.cwd(), "public", "gallery");
const IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".avif",
  ".svg",
]);
const VIDEO_EXTENSIONS = new Set([
  ".mp4",
  ".mov",
  ".webm",
  ".m4v",
  ".ogv",
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

function formatImageCaption(value, index) {
  const filename = path.basename(String(value ?? ""), path.extname(String(value ?? "")));
  const timestamp = filename.match(
    /^(\d{4}-\d{2}-\d{2})_(\d{2})-(\d{2})-(\d{2})(?:$|[-_ ])/,
  );

  if (timestamp) {
    return `${timestamp[1]} ${timestamp[2]}:${timestamp[3]}:${timestamp[4]}`;
  }

  return humanizeName(filename) || `Image ${index + 1}`;
}

function toPublicGallerySrc(slug, filename) {
  const encode = (segment) => encodeURIComponent(segment);
  const encodedPath = filename.split(/[\\/]/).map(encode).join("/");
  return `/gallery/${encode(slug)}/${encodedPath}`;
}

function getGalleryDirectories() {
  return [...new Set([GALLERY_ROOT, PUBLIC_GALLERY_ROOT].flatMap((root) => (
    fs.existsSync(root)
      ? fs.readdirSync(root, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
      : []
  )))].sort(sortNaturally);
}

function getGalleryFolderPath(slug) {
  return path.join(GALLERY_ROOT, slug);
}

function findGalleryMarkdown(folderPath) {
  if (!fs.existsSync(folderPath)) return "";
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
    return parseGalleryMarkdown("", slug);
  }

  const filePath = path.join(folderPath, markdownFile);
  const fileContents = fs.readFileSync(filePath, "utf8");
  return parseGalleryMarkdown(fileContents, slug);
}

function readMappedImages(slug) {
  const mappingPath = path.join(getGalleryFolderPath(slug), "images.json");
  const mapping = JSON.parse(fs.readFileSync(mappingPath, "utf8"));
  if (!Array.isArray(mapping.images)) {
    throw new Error(`${mappingPath}: expected an images array`);
  }

  const names = new Set();
  const httpsUrl = (value, field) => {
    if (typeof value !== "string" || new URL(value).protocol !== "https:") {
      throw new Error(`${mappingPath}: ${field} must be an HTTPS URL`);
    }
    return value;
  };

  return mapping.images.map((image, index) => {
    if (!image || typeof image.name !== "string" || !image.name.trim() || names.has(image.name)) {
      throw new Error(`${mappingPath}: missing or duplicate name at entry ${index + 1}`);
    }
    names.add(image.name);
    const caption = typeof image.displayName === "string" && image.displayName.trim()
      ? image.displayName.trim()
      : formatImageCaption(image.name, index);
    const mediaType = image.mediaType ?? "image";
    if (!["image", "video"].includes(mediaType)) {
      throw new Error(`${mappingPath}: unsupported mediaType at entry ${index + 1}`);
    }
    const embedSrc = image.embedSrc ? httpsUrl(image.embedSrc, "embedSrc") : undefined;
    if (embedSrc && (mediaType !== "video" || !/^https:\/\/drive\.google\.com\/file\/d\/[\w-]+\/preview$/.test(embedSrc))) {
      throw new Error(`${mappingPath}: embedSrc must be a Google Drive video preview`);
    }
    return {
      name: image.name,
      src: httpsUrl(image.src, "src"),
      thumbnailSrc: image.thumbnailSrc ? httpsUrl(image.thumbnailSrc, "thumbnailSrc") : undefined,
      originalUrl: image.originalUrl ? httpsUrl(image.originalUrl, "originalUrl") : undefined,
      embedSrc,
      alt: caption,
      caption,
      mediaType,
    };
  });
}

function readGalleryImages(slug, source) {
  if (source === "mapping") return readMappedImages(slug);
  if (source !== "local") throw new Error(`${slug}: source must be local or mapping`);
  const folderPath = path.join(PUBLIC_GALLERY_ROOT, slug);
  if (!fs.existsSync(folderPath)) return [];

  function collectImages(directory, relativeRoot = "") {
    return fs.readdirSync(directory, { withFileTypes: true })
      .sort((left, right) => sortNaturally(left.name, right.name))
      .flatMap((entry) => {
        const relativePath = path.join(relativeRoot, entry.name);
        if (entry.isDirectory()) {
          return collectImages(path.join(directory, entry.name), relativePath);
        }
        const ext = path.extname(entry.name).toLowerCase();
        return entry.isFile() && (IMAGE_EXTENSIONS.has(ext) || VIDEO_EXTENSIONS.has(ext))
          ? [relativePath]
          : [];
      });
  }

  return collectImages(folderPath)
    .map((filename, index) => {
      const caption = formatImageCaption(filename, index);
      const ext = path.extname(filename).toLowerCase();
      const mediaType = VIDEO_EXTENSIONS.has(ext) ? "video" : "image";
      return {
        name: filename,
        src: toPublicGallerySrc(slug, filename),
        alt: caption,
        caption,
        mediaType,
      };
    });
}

function readGalleryPdf(slug, preferredPdfName = "") {
  const folderPath = path.join(PUBLIC_GALLERY_ROOT, slug);
  if (!fs.existsSync(folderPath)) return null;
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
  if (preferredCoverName) {
    const match = images.find((image) => (
      image.name === preferredCoverName || path.basename(image.name) === preferredCoverName
    ));
    if (match) return match;
  }
  return images.find((image) => image.mediaType !== "video") ?? images[0];
}

export function loadGalleryCollection() {
  return getGalleryDirectories()
    .map((slug) => {
      const doc = readGalleryDoc(slug);
      const images = readGalleryImages(slug, doc.source);
      const pdf = readGalleryPdf(slug, doc.pdf);
      const cover = pickCover(images, doc.cover);
      const type = doc.type === "pdf" || (!cover && pdf)
        ? "pdf"
        : "images";

      if (type === "pdf" && !pdf) return null;
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
        location: doc.location,
        latitude: doc.latitude,
        longitude: doc.longitude,
        mapX: doc.mapX,
        mapY: doc.mapY,
        mapOffsetX: doc.mapOffsetX,
        mapOffsetY: doc.mapOffsetY,
        labelX: doc.labelX,
        labelY: doc.labelY,
      };
    })
    .filter(Boolean);
}

export function loadGallery(slug) {
  if (typeof slug !== "string" || !slug || slug === "." || slug === ".." || /[\\/]/.test(slug)) return null;
  const folderPath = getGalleryFolderPath(slug);
  if (!fs.existsSync(folderPath) && !fs.existsSync(path.join(PUBLIC_GALLERY_ROOT, slug))) return null;

  const doc = readGalleryDoc(slug);
  const images = readGalleryImages(slug, doc.source);
  const pdf = readGalleryPdf(slug, doc.pdf);
  const cover = pickCover(images, doc.cover);
  const type = doc.type === "pdf" || (!cover && pdf)
    ? "pdf"
    : "images";

  if (type === "pdf" && !pdf) return null;
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
    location: doc.location,
    latitude: doc.latitude,
    longitude: doc.longitude,
    mapOffsetX: doc.mapOffsetX,
    mapOffsetY: doc.mapOffsetY,
    columns: doc.columns,
  };
}
