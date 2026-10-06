"use client";

import { useMemo } from "react";
import { Handle, Panel, Position } from "@xyflow/react";
import { useI18n } from "@/components/i18n/I18nProvider";
import FlowCanvas from "@/components/mindmap/FlowCanvas";
import { buildFamilyGraph } from "@/app/utils/mindmapGraph.mjs";
import { PersonAvatar, formatPersonDate } from "./PersonCard";

function FamilyNode({ data }) {
  const { t } = useI18n();
  return <div className="mindmap-family">
    <Handle type="target" position={Position.Top} />
    {data.members.map(person => {
      const birth = formatPersonDate(person.birth_date, person.birth_date_precision);
      const death = formatPersonDate(person.death_date, person.death_date_precision);
      return <button type="button" className={`mindmap-person nodrag${data.highlightedIds.has(person.id) ? " is-highlighted" : ""}`}
        key={person.id} onClick={() => data.onSelectPerson?.(person)}>
        <PersonAvatar person={person} size="md" />
        <strong>{person.display_name || person.first_name || "?"}</strong>
        {(birth || death) && <span>{birth}{death ? ` – ${death}` : ""}</span>}
        <span>{t("giapha.generation", { gen: person.generation || 1 })}</span>
      </button>;
    })}
    <Handle type="source" position={Position.Bottom} />
  </div>;
}

const nodeTypes = { family: FamilyNode };
const EMPTY_PERSONS = [];

export default function FamilyTreeView({ tree = {}, searchQuery = "", onSelectPerson,
  highlightedPersonId = null, rootPersonId = null, onClearRoot }) {
  const { lang, t } = useI18n();
  const persons = tree.persons || EMPTY_PERSONS;
  const graph = useMemo(() => buildFamilyGraph(persons, rootPersonId), [persons, rootPersonId]);
  const query = searchQuery.trim().toLocaleLowerCase();
  const matches = useMemo(() => persons.filter(person => query &&
    [person.display_name, person.first_name, person.last_name, person.occupation, person.category]
      .some(value => value?.toLocaleLowerCase().includes(query))), [persons, query]);
  const highlightedIds = useMemo(() => new Set([...matches.map(person => person.id), highlightedPersonId]), [matches, highlightedPersonId]);
  const nodes = useMemo(() => graph.nodes.map(node => ({ ...node,
    data: { ...node.data, highlightedIds, onSelectPerson },
  })), [graph.nodes, highlightedIds, onSelectPerson]);
  const focusId = graph.personToFamily.get(highlightedPersonId || (matches.length === 1 ? matches[0].id : null));
  const rootPerson = persons.find(person => person.id === rootPersonId);

  return <div className="giapha-tree-section">
    <FlowCanvas key={rootPersonId || "full-tree"} nodes={nodes} edges={graph.edges} nodeTypes={nodeTypes}
      focusId={focusId} rootId={graph.rootId} label={lang === "vi" ? "Cây gia phả tương tác" : "Interactive family tree"}>
      {(rootPerson || query) && <Panel position="top-left" className="mindmap-branch-panel">
        {rootPerson && <><strong>{rootPerson.display_name}</strong><button type="button" className="mindmap-action" onClick={onClearRoot}>{t("giapha.resetToFullTree")}</button></>}
        {query && <span role="status">{matches.length} {lang === "vi" ? "kết quả" : "matches"}</span>}
      </Panel>}
    </FlowCanvas>
  </div>;
}
