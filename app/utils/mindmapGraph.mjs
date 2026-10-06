export const MINDMAP_TYPES = ["family-tree", "learning"];

// Lay out a forest using subtree widths. Additional graph edges are retained,
// but only the first incoming edge determines a node's layout parent.
export function layoutMindmap(nodes, edges) {
  const levelHeight = Math.max(240, ...nodes.map(node => (node.height || 0) + 68));
  const byId = new Map(nodes.map(node => [node.id, node]));
  const parents = new Map();
  const children = new Map(nodes.map(node => [node.id, []]));
  for (const edge of edges) {
    if (!byId.has(edge.source) || !byId.has(edge.target) || parents.has(edge.target)) continue;
    let ancestor = edge.source;
    const seen = new Set([edge.target]);
    while (ancestor && !seen.has(ancestor)) {
      seen.add(ancestor);
      ancestor = parents.get(ancestor);
    }
    if (ancestor) continue;
    parents.set(edge.target, edge.source);
    children.get(edge.source).push(edge.target);
  }
  const widths = new Map();
  function measure(id) {
    const childWidth = children.get(id).reduce((sum, child) => sum + measure(child), 0);
    const width = Math.max((byId.get(id).width || 240) + 48, childWidth);
    widths.set(id, width);
    return width;
  }
  const positions = new Map();
  function place(id, left, depth) {
    positions.set(id, { x: left + (widths.get(id) - (byId.get(id).width || 240)) / 2, y: depth * levelHeight });
    let childLeft = left + (widths.get(id) - children.get(id).reduce((sum, child) => sum + widths.get(child), 0)) / 2;
    for (const child of children.get(id)) {
      place(child, childLeft, depth + 1);
      childLeft += widths.get(child);
    }
  }
  let left = 0;
  for (const node of nodes.filter(node => !parents.has(node.id))) {
    measure(node.id);
    place(node.id, left, 0);
    left += widths.get(node.id);
  }
  return nodes.map(node => ({ ...node, position: node.position || positions.get(node.id) }));
}

export function validateLearningMap(data) {
  if (!Array.isArray(data.nodes) || !data.nodes.length) throw new Error("Learning maps need at least one node.");
  const ids = new Set();
  for (const node of data.nodes) {
    if (typeof node.id !== "string" || !node.id.trim() || ids.has(node.id)) throw new Error("Node IDs must be unique, nonempty strings.");
    if (typeof node.label !== "string" || !node.label.trim()) throw new Error(`Node ${node.id} needs a label.`);
    if (node.position && (!Number.isFinite(node.position.x) || !Number.isFinite(node.position.y))) throw new Error(`Invalid position for ${node.id}.`);
    ids.add(node.id);
  }
  if (data.edges !== undefined && !Array.isArray(data.edges)) throw new Error("Edges must be an array.");
  const edgeIds = new Set();
  for (const [index, edge] of (data.edges || []).entries()) {
    if (!ids.has(edge.source) || !ids.has(edge.target)) throw new Error("Every edge must reference existing nodes.");
    const id = edge.id || `edge-${index}`;
    if (edgeIds.has(id)) throw new Error("Edge IDs must be unique.");
    edgeIds.add(id);
  }
}

export function buildLearningGraph(data, lang = "en") {
  validateLearningMap(data);
  const edges = (data.edges || []).map((edge, index) => ({
    ...edge, id: edge.id || `edge-${index}`, type: "smoothstep",
    label: lang === "vi" ? edge.labelVi || edge.label : edge.label,
  }));
  const nodes = data.nodes.map(node => ({
    id: node.id, type: "topic", width: 240, height: 280, position: node.position,
    data: { ...node, label: lang === "vi" ? node.labelVi || node.label : node.label },
  }));
  return { nodes: layoutMindmap(nodes, edges), edges };
}

// Spouses share a visual family unit; all parent relationships remain edges.
export function buildFamilyGraph(persons = [], rootPersonId = null) {
  const byId = new Map(persons.map(person => [person.id, person]));
  const groups = new Map(persons.map(person => [person.id, person.id]));
  function find(id) {
    let root = id;
    while (groups.get(root) !== root) root = groups.get(root);
    return root;
  }
  for (const person of persons) {
    for (const spouse of person.spouse_ids || []) {
      if (byId.has(spouse)) groups.set(find(spouse), find(person.id));
    }
  }
  const families = new Map();
  const personToFamily = new Map();
  for (const person of persons) {
    const id = find(person.id);
    personToFamily.set(person.id, id);
    if (!families.has(id)) families.set(id, []);
    families.get(id).push(person);
  }
  const connections = new Map();
  function connect(parent, child) {
    const source = personToFamily.get(parent);
    const target = personToFamily.get(child);
    if (!source || !target || source === target) return;
    const id = JSON.stringify([source, target]);
    connections.set(id, { id, source, target, type: "smoothstep" });
  }
  for (const person of persons) {
    (person.parent_ids || []).forEach(parent => connect(parent, person.id));
    (person.children_ids || []).forEach(child => connect(person.id, child));
  }
  let nodes = [...families].map(([id, members]) => ({
    id, type: "family", width: members.length * 150 + 24, data: { members },
  }));
  let edges = [...connections.values()];
  const selectedRoot = personToFamily.get(rootPersonId);
  if (selectedRoot) {
    const included = new Set([selectedRoot]);
    const queue = [selectedRoot];
    for (let i = 0; i < queue.length; i++) {
      for (const edge of edges.filter(edge => edge.source === queue[i])) {
        if (!included.has(edge.target)) {
          included.add(edge.target);
          queue.push(edge.target);
        }
      }
    }
    nodes = nodes.filter(node => included.has(node.id));
    edges = edges.filter(edge => included.has(edge.source) && included.has(edge.target) && edge.target !== selectedRoot);
  }
  const rootId = selectedRoot || nodes.find(node => !edges.some(edge => edge.target === node.id))?.id || nodes[0]?.id;
  return { nodes: layoutMindmap(nodes, edges), edges, personToFamily, rootId };
}

export function serializeMindmap(data, content = "", positions = []) {
  const byId = new Map(positions.map(node => [node.id, node.position]));
  const saved = data.type === "learning" ? {
    ...data,
    nodes: data.nodes.map(node => ({ ...node, ...(byId.has(node.id) ? { position: byId.get(node.id) } : {}) })),
  } : data;
  return `---\n${JSON.stringify(saved, null, 2)}\n---\n\n${content.trim()}\n`;
}
