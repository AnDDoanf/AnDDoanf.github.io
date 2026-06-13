import { isValidElement } from "react";

export function slugifyHeading(text) {
  const normalizedText = String(text ?? "")
    .replaceAll("*", "")
    .trim()
    .toLowerCase()
    .replace(/[^\w]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return normalizedText || "section";
}

function createUniqueHeadingId(baseId, seenIds) {
  const nextCount = (seenIds.get(baseId) ?? 0) + 1;
  seenIds.set(baseId, nextCount);

  return nextCount === 1 ? baseId : `${baseId}-${nextCount}`;
}

export function extractHeadingText(children) {
  if (children == null || typeof children === "boolean") {
    return "";
  }

  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(extractHeadingText).join("");
  }

  if (isValidElement(children)) {
    return extractHeadingText(children.props.children);
  }

  return "";
}

export function extractHeadings(markdown = "") {
  const seenIds = new Map();

  return markdown
    .split(/\r?\n/)
    .map((line) => {
      const normalizedLine = line.trimEnd();
      const match = /^(#{2,3})\s+(.+)$/.exec(normalizedLine);

      if (!match) {
        return null;
      }

      const level = match[1].length;
      const text = match[2].replaceAll("*", "").trim();

      if (!text) {
        return null;
      }

      const baseId = slugifyHeading(text);

      return {
        text,
        id: createUniqueHeadingId(baseId, seenIds),
        level,
      };
    })
    .filter(Boolean);
}

export function createHeadingIdResolver(headings = []) {
  const headingIdsByKey = new Map();
  const nextHeadingIndexByKey = new Map();

  headings.forEach((heading) => {
    const key = `${heading.level}:${heading.text}`;
    const existingIds = headingIdsByKey.get(key) ?? [];
    existingIds.push(heading.id);
    headingIdsByKey.set(key, existingIds);
  });

  return function resolveHeadingId(children, level) {
    const text = extractHeadingText(children).trim();
    const key = `${level}:${text}`;
    const matchingIds = headingIdsByKey.get(key) ?? [];
    const nextIndex = nextHeadingIndexByKey.get(key) ?? 0;

    nextHeadingIndexByKey.set(key, nextIndex + 1);

    return matchingIds[nextIndex] ?? slugifyHeading(text);
  };
}
