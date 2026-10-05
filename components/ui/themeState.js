export const THEME_PAIRS = ["solarized", "ocean", "forest", "rose", "lavender", "slate"];

export function getThemeSnapshot() {
  const root = document.documentElement;
  return `${root.dataset.palette || "solarized"}:${root.dataset.theme || "light"}`;
}

export function applySavedTheme() {
  let mode = "light";
  let palette = "solarized";
  try {
    mode = localStorage.getItem("theme") === "dark" ? "dark" : "light";
    const saved = localStorage.getItem("theme-palette");
    if (THEME_PAIRS.includes(saved)) palette = saved;
  } catch {
    // Use defaults when browser storage is unavailable.
  }
  document.documentElement.dataset.theme = mode;
  document.documentElement.dataset.palette = palette;
}

export function subscribeToTheme(callback) {
  const sync = (event) => {
    if (event && event.key !== null && !["theme", "theme-palette"].includes(event.key)) return;
    applySavedTheme();
    callback();
  };
  sync();
  window.addEventListener("storage", sync);
  window.addEventListener("themechange", callback);
  return () => {
    window.removeEventListener("storage", sync);
    window.removeEventListener("themechange", callback);
  };
}

export function selectTheme(palette, mode) {
  document.documentElement.dataset.palette = palette;
  document.documentElement.dataset.theme = mode;
  try {
    localStorage.setItem("theme-palette", palette);
    localStorage.setItem("theme", mode);
  } catch {
    // Selection still works for this page when storage is unavailable.
  }
  window.dispatchEvent(new Event("themechange"));
}
