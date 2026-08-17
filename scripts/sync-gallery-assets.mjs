import fs from "fs";
import path from "path";

const workspaceRoot = process.cwd();
const sourceRoot = path.join(workspaceRoot, "data", "gallery");
const targetRoot = path.join(workspaceRoot, "public", "gallery");
const imageExtensions = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".avif",
  ".svg",
]);
const videoExtensions = new Set([
  ".mp4",
  ".mov",
  ".webm",
  ".m4v",
  ".ogv",
]);
const pdfExtensions = new Set([".pdf"]);
const pdfWorkerSource = path.join(
  workspaceRoot,
  "node_modules",
  "pdfjs-dist",
  "build",
  "pdf.worker.min.mjs",
);
const pdfWorkerTarget = path.join(
  workspaceRoot,
  "public",
  "vendor",
  "pdfjs",
  "pdf.worker.min.mjs",
);
const turnJsTargetRoot = path.join(
  workspaceRoot,
  "public",
  "vendor",
  "turnjs",
);

function assertInsideWorkspace(targetPath) {
  const resolvedTarget = path.resolve(targetPath);
  const resolvedWorkspace = path.resolve(workspaceRoot);

  if (
    resolvedTarget !== resolvedWorkspace
    && !resolvedTarget.startsWith(`${resolvedWorkspace}${path.sep}`)
  ) {
    throw new Error(`Refusing to touch path outside workspace: ${resolvedTarget}`);
  }
}

function resetTargetDirectory() {
  assertInsideWorkspace(targetRoot);
  fs.rmSync(targetRoot, { recursive: true, force: true });
  fs.mkdirSync(targetRoot, { recursive: true });
}

function copyGalleryAssets(sourceDir, targetDir) {
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(targetPath, { recursive: true });
      copyGalleryAssets(sourcePath, targetPath);
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (
      !imageExtensions.has(extension)
      && !videoExtensions.has(extension)
      && !pdfExtensions.has(extension)
    ) {
      continue;
    }

    fs.copyFileSync(sourcePath, targetPath);
  }
}

function findFirstFile(rootDir, targetFileName) {
  if (!fs.existsSync(rootDir)) return "";

  const entries = fs.readdirSync(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      const nestedMatch = findFirstFile(absolutePath, targetFileName);
      if (nestedMatch) return nestedMatch;
      continue;
    }

    if (entry.name.toLowerCase() === targetFileName.toLowerCase()) {
      return absolutePath;
    }
  }

  return "";
}

function copyPdfWorker() {
  if (!fs.existsSync(pdfWorkerSource)) return;

  assertInsideWorkspace(pdfWorkerTarget);
  fs.mkdirSync(path.dirname(pdfWorkerTarget), { recursive: true });
  fs.copyFileSync(pdfWorkerSource, pdfWorkerTarget);
}

function copyTurnJsAssets() {
  const jquerySource = findFirstFile(sourceRoot, "jquery.js");
  const turnSource = findFirstFile(sourceRoot, "turn.js");

  if (!jquerySource || !turnSource) return;

  assertInsideWorkspace(turnJsTargetRoot);
  fs.mkdirSync(turnJsTargetRoot, { recursive: true });
  fs.copyFileSync(jquerySource, path.join(turnJsTargetRoot, "jquery.js"));
  fs.copyFileSync(turnSource, path.join(turnJsTargetRoot, "turn.js"));
}

if (!fs.existsSync(sourceRoot)) {
  fs.mkdirSync(targetRoot, { recursive: true });
  console.log("No data/gallery directory found. Skipping gallery asset sync.");
  process.exit(0);
}

resetTargetDirectory();
copyGalleryAssets(sourceRoot, targetRoot);
copyPdfWorker();
copyTurnJsAssets();
console.log("Gallery assets synced from data/gallery to public/gallery.");
