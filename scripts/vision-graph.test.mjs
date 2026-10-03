import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import matter from "gray-matter";
import { buildVisionGraph } from "../app/utils/visionGraph.mjs";

test("Markdown board retains its nested hierarchy and media in both languages", () => {
  const { data } = matter(fs.readFileSync("data/me/vision-board.md", "utf8"));
  const root = { ...data.core, children: data.items };
  for (const lang of ["en", "vi"]) {
    const { nodes, edges } = buildVisionGraph(root, lang);
    assert.deepEqual(nodes[0].position, { x: 0, y: 0 });
    assert.equal(nodes[0].data.title, lang === "vi" ? root.titleVi : root.title);
    assert.equal(edges.length, nodes.length - 1);
    assert.ok(nodes.some((node) => node.id === "core-0-0-0"));
    assert.ok(nodes.some(({ data }) => data.image && data.quote && data.text));
    assert.ok(edges.every((edge) => nodes.some((node) => node.id === edge.source)));
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i].position;
        const b = nodes[j].position;
        assert.ok(Math.abs(a.x - b.x) >= 328 - 0.001 || Math.abs(a.y - b.y) >= 468 - 0.001);
      }
    }
    for (const edge of edges) {
      const a = nodes.find((node) => node.id === edge.source).position;
      const b = nodes.find((node) => node.id === edge.target).position;
      assert.ok(Math.hypot(a.x - b.x, a.y - b.y) < 700, "Current board should keep connected cards close");
    }
  }
});

test("supports an isolated root, wide branches, and deeply nested items", () => {
  assert.equal(buildVisionGraph({ text: "Core" }).edges.length, 0);
  const children = Array.from({ length: 20 }, (_, i) => ({ text: String(i) }));
  let root = { image: "/example.jpg", children };
  for (let i = 0; i < 6; i++) root = { quote: "Value", children: [root] };
  const graph = buildVisionGraph(root);
  assert.equal(graph.nodes.length, 27);
  assert.equal(new Set(graph.nodes.map((node) => node.id)).size, 27);
  assert.ok(graph.nodes.every(({ position }) => Number.isFinite(position.x) && Number.isFinite(position.y)));
});
