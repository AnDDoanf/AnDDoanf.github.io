// Pack cards near their parent, reserving only a card-sized rectangle.
// Descendants continue outward instead of inflating every ancestor's orbit.
export function buildVisionGraph(root, lang = "en") {
  const nodes = [];
  const edges = [];

  function nearestSpace(parent, direction) {
    for (let radius = 336; ; radius += 32) {
      for (const offset of [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6, 7, -7, 8, -8]) {
        const angle = direction + (offset * Math.PI) / 12;
        const position = {
          x: Math.round(parent.x + Math.cos(angle) * radius),
          y: Math.round(parent.y + Math.sin(angle) * radius),
        };
        if (nodes.every(({ position: other }) =>
          Math.abs(position.x - other.x) >= 328 || Math.abs(position.y - other.y) >= 468
        )) return position;
      }
    }
  }

  const queue = [{ item: root, id: "core", position: { x: 0, y: 0 }, direction: -Math.PI / 2 }];
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const { item, id, parent, direction, color } = queue[cursor];
    const position = parent ? nearestSpace(parent.position, direction) : { x: 0, y: 0 };
    const data = { ...item };
    delete data.children;
    if (lang === "vi") {
      for (const key of Object.keys(data)) {
        if (key.endsWith("Vi")) data[key.slice(0, -2)] = data[key];
      }
    } else if (data.virtuesEn) {
      data.virtues = data.virtuesEn;
    }
    data.color ||= color;
    data.isCore = !parent;
    data.coreLabel = lang === "vi" ? "Giá trị cốt lõi" : "Core value";
    const nodeType = !parent ? "core" : parent.id === "core" ? "branch" : "leaf";

    if (parent) {
      const angleRad = Math.atan2(position.y - parent.position.y, position.x - parent.position.x);
      let textAngle = Math.round((angleRad * 180) / Math.PI);
      if (textAngle > 90) textAngle -= 180;
      if (textAngle < -90) textAngle += 180;
      data.lineAngle = Math.round((angleRad * 180) / Math.PI);
      data.textAngle = textAngle;
    }

    const node = { id, type: nodeType, position, data };
    nodes.push(node);
    if (parent) {
      edges.push({
        id: `${parent.id}:${id}`,
        source: parent.id,
        target: id,
        sourceHandle: parent.id === "core" ? "core-source" : "branch-source",
        targetHandle: parent.id === "core" ? "branch-target" : "leaf-target",
        type: "straight",
        style: {
          stroke: data.color || "var(--link)",
          strokeWidth: parent.id === "core" ? 6 : 3.5,
          strokeLinecap: "round",
        },
      });
    }

    (item.children || []).forEach((child, index, children) => {
      const angle = parent
        ? direction + (index - (children.length - 1) / 2) * Math.min(Math.PI / 3, Math.PI / children.length)
        : -Math.PI / 2 + (index * 2 * Math.PI) / children.length;
      queue.push({ item: child, id: `${id}-${index}`, parent: node, direction: angle, color: data.color });
    });
  }
  return { nodes, edges };
}
