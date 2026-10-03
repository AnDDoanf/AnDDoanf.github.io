// Pack cards near their parent, reserving only a card-sized rectangle.
// Descendants continue outward instead of inflating every ancestor's orbit.
export function buildVisionGraph(root, lang = "en") {
  const nodes = [];
  const edges = [];
  function nearestSpace(parent, direction) {
    for (let radius = 336; ; radius += 48) {
      for (const offset of [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6]) {
        const angle = direction + offset * Math.PI / 6;
        const position = {
          x: parent.x + Math.cos(angle) * radius,
          y: parent.y + Math.sin(angle) * radius,
        };
        if (nodes.every(({ position: other }) =>
          Math.abs(position.x - other.x) >= 328 || Math.abs(position.y - other.y) >= 468
        )) return position;
      }
    }
  }

  const queue = [{ item: root, id: "core", position: { x: 0, y: 0 }, direction: -Math.PI / 2 }];
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const { item, id, parent, direction, color } = queue[cursor];
    const position = parent ? nearestSpace(parent.position, direction) : { x: 0, y: 0 };
    const data = { ...item };
    delete data.children;
    if (lang === "vi") {
      for (const key of Object.keys(data)) {
        if (key.endsWith("Vi")) data[key.slice(0, -2)] = data[key];
      }
    }
    data.color ||= color;
    data.isCore = !parent;
    data.coreLabel = lang === "vi" ? "Giá trị cốt lõi" : "Core value";
    const node = { id, type: "vision", position, data };
    nodes.push(node);
    if (parent) edges.push({ id: `${parent.id}:${id}`, source: parent.id, target: id,
      type: "straight", style: { stroke: data.color || "var(--link)", strokeWidth: 2 } });
    const children = item.children || [];
    children.forEach((child, index) => {
      const angle = parent
        ? direction + (index - (children.length - 1) / 2) * Math.min(Math.PI / 3, Math.PI / children.length)
        : -Math.PI / 2 + index * 2 * Math.PI / children.length;
      queue.push({ item: child, id: `${id}-${index}`, parent: node, direction: angle, color: data.color });
    });
  }
  return { nodes, edges };
}
