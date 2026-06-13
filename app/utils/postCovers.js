const PLACEHOLDER_COVERS = {
  faith: "/assets/post-covers/placeholder-faith.svg",
  reflection: "/assets/post-covers/placeholder-reflection.svg",
  learning: "/assets/post-covers/placeholder-learning.svg",
  engineering: "/assets/post-covers/placeholder-engineering.svg",
  generic: "/assets/post-covers/placeholder-generic.svg",
};

const TAG_COVER_MAP = {
  christianity: "faith",
  chritianity: "faith",
  devotional: "faith",
  discipleship: "faith",
  disipleship: "faith",
  testimony: "faith",
  faith: "faith",
  evangelism: "faith",
  reflection: "reflection",
  journey: "reflection",
  life: "reflection",
  forfun: "reflection",
  learning: "learning",
  growth: "learning",
  how: "learning",
  skill: "learning",
  frontend: "engineering",
  react: "engineering",
  system: "engineering",
  "system-design": "engineering",
  programming: "engineering",
  fullstack: "engineering",
  engineering: "engineering",
  rendering: "engineering",
  languages: "engineering",
  projects: "engineering",
  webdev: "engineering",
};

function normalizeAssetPath(image) {
  const rawValue = String(image ?? "").trim();

  if (!rawValue) {
    return "";
  }

  if (/^https?:\/\//i.test(rawValue) || rawValue.startsWith("/")) {
    return rawValue;
  }

  if (rawValue.startsWith("assets/")) {
    return `/${rawValue}`;
  }

  return `/assets/${rawValue.replace(/^\.?\//, "")}`;
}

export function pickPlaceholderCover(tags = []) {
  for (const tag of tags) {
    const normalizedTag = String(tag ?? "").trim().toLowerCase();
    const theme = TAG_COVER_MAP[normalizedTag];

    if (theme) {
      return PLACEHOLDER_COVERS[theme];
    }
  }

  return PLACEHOLDER_COVERS.generic;
}

export function resolvePostCoverImage(image, tags = []) {
  return normalizeAssetPath(image) || pickPlaceholderCover(tags);
}
