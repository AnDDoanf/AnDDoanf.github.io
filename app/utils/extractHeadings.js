export function extractHeadings(markdown) {
  const lines = markdown.split("\n");

  return lines
    .filter(line => line.startsWith("## "))
    .map(line => {
      const text = line.replace(/^##\s+/, "").trim();

      return {
        text,
        id: text
          .toLowerCase()
          .replace(/[^\w]+/g, "-")
          .replace(/(^-|-$)/g, ""),
        level: 2,
      };
    });
}
