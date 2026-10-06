import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import matter from "gray-matter";
import { buildFamilyGraph, buildLearningGraph, serializeMindmap } from "../app/utils/mindmapGraph.mjs";

test("learning Markdown round-trips labels, relationships, notes and moved positions", () => {
  const { data, content } = matter(fs.readFileSync("data/mindmaps/learning/learning-how-to-learn.md", "utf8"));
  const graph = buildLearningGraph(data);
  assert.equal(graph.nodes.length, 6);
  assert.equal(graph.edges.length, 5);
  assert.equal(graph.nodes[0].data.cover, data.nodes[0].cover);
  assert.equal(graph.nodes.find(node => node.id === "explore").data.href, "/journal/2026-09-15-dumbphobia-20-rl-techniques");
  assert.equal(buildLearningGraph(data, "vi").nodes[0].data.label, data.nodes[0].labelVi);
  graph.nodes[0].position = { x: 51, y: -72 };
  const restored = matter(serializeMindmap(data, content, graph.nodes));
  assert.deepEqual(restored.data.nodes[0].position, { x: 51, y: -72 });
  assert.equal(restored.data.nodes[0].labelVi, data.nodes[0].labelVi);
  assert.equal(restored.data.cover, data.cover);
  assert.equal(restored.data.nodes[0].cover, data.nodes[0].cover);
  assert.deepEqual(restored.data.edges, data.edges);
  assert.equal(restored.content.trim(), content.trim());
  assert.deepEqual(buildLearningGraph(restored.data).nodes[0].position, { x: 51, y: -72 });
});

test("learning graph supports cross-links, cycles and disconnected nodes without overlapping automatic positions", () => {
  const graph = buildLearningGraph({ nodes: ["a", "b", "c", "d", "e"].map(id => ({ id, label: id })),
    edges: [{ source: "a", target: "b" }, { source: "b", target: "c" }, { source: "c", target: "a" }, { source: "a", target: "c" }] });
  assert.equal(graph.edges.length, 4);
  assert.equal(new Set(graph.nodes.map(node => JSON.stringify(node.position))).size, 5);
  assert.ok(graph.nodes.every(node => Number.isFinite(node.position.x) && Number.isFinite(node.position.y)));
  for (const a of graph.nodes) for (const b of graph.nodes) {
    if (a.position.y < b.position.y) assert.ok(a.position.y + a.height < b.position.y);
  }
});

test("Vietnamese translations are optional in Markdown", () => {
  const { data } = matter(`---
type: learning
title: Learning
nodes:
  - id: root
    label: Main topic
    description: An explanation without a translation.
  - id: child
    label: Practice
    labelVi: ""
    description: Try it yourself.
    descriptionVi: ""
edges:
  - source: root
    target: child
    label: Next step
---`);
  const graph = buildLearningGraph(data, "vi");
  assert.deepEqual(graph.nodes.map(node => node.data.label), ["Main topic", "Practice"]);
  assert.equal(graph.nodes[0].data.description, "An explanation without a translation.");
  assert.equal(graph.nodes[1].data.description, "Try it yourself.");
  assert.equal(graph.edges[0].label, "Next step");
  const restored = matter(serializeMindmap(data));
  assert.equal(restored.data.nodes[0].labelVi, undefined);
  assert.equal(restored.data.nodes[0].descriptionVi, undefined);
});

test("invalid learning IDs and dangling edges fail clearly", () => {
  assert.throws(() => buildLearningGraph({ nodes: [{ id: "a", label: "A" }, { id: "a", label: "B" }] }), /unique/);
  assert.throws(() => buildLearningGraph({ nodes: [{ id: "a", label: "A" }], edges: [{ source: "a", target: "missing" }] }), /existing/);
  assert.throws(() => buildLearningGraph({ nodes: [{ id: "a", label: "A", position: { x: "1", y: 2 } }] }), /position/);
  assert.throws(() => buildLearningGraph({ nodes: [] }), /at least one/);
});

test("family graph retains all real people, spouse groups and parent relationships", () => {
  const { data } = matter(fs.readFileSync("data/giapha/doan-toc.md", "utf8"));
  const graph = buildFamilyGraph(data.persons);
  const members = graph.nodes.flatMap(node => node.data.members);
  assert.equal(members.length, data.persons.length);
  assert.equal(new Set(members.map(person => person.id)).size, data.persons.length);
  for (const person of data.persons) {
    for (const spouse of person.spouse_ids || []) {
      if (graph.personToFamily.has(spouse)) assert.equal(graph.personToFamily.get(person.id), graph.personToFamily.get(spouse));
    }
    for (const parent of person.parent_ids || []) {
      const source = graph.personToFamily.get(parent);
      const target = graph.personToFamily.get(person.id);
      if (source && source !== target) assert.ok(graph.edges.some(edge => edge.source === source && edge.target === target));
    }
  }
  for (const a of graph.nodes) for (const b of graph.nodes) {
    if (a.id !== b.id && a.position.y === b.position.y) {
      assert.ok(a.position.x + a.width <= b.position.x || b.position.x + b.width <= a.position.x);
    }
  }
});

test("family branches include spouses and descendants, excluding ancestors and unrelated people", () => {
  const persons = [
    { id: "grandparent", children_ids: ["parent"] },
    { id: "parent", spouse_ids: ["spouse"], parent_ids: ["grandparent"] },
    { id: "spouse" }, { id: "child", parent_ids: ["parent", "spouse"] }, { id: "unrelated" },
  ];
  const graph = buildFamilyGraph(persons, "spouse");
  assert.deepEqual(new Set(graph.nodes.flatMap(node => node.data.members.map(person => person.id))), new Set(["parent", "spouse", "child"]));
  assert.equal(graph.edges.length, 1);
  assert.equal(graph.nodes.find(node => node.id === graph.rootId).position.y, 0);
  assert.equal(buildFamilyGraph([]).nodes.length, 0);
});
