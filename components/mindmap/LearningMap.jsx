"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Handle, Position, useNodesState } from "@xyflow/react";
import ReactMarkdown from "react-markdown";
import FlowCanvas from "./FlowCanvas";
import { useI18n } from "@/components/i18n/I18nProvider";
import { buildLearningGraph } from "@/app/utils/mindmapGraph.mjs";

function TopicNode({ data }) {
  const { lang } = useI18n();
  const label = lang === "vi" ? data.labelVi || data.label : data.label;
  const description = lang === "vi" ? data.descriptionVi || data.description : data.description;
  const safeHref = typeof data.href === "string" && /^(https?:\/\/|\/(?!\/)|#)/i.test(data.href) ? data.href : null;
  return <article className="mindmap-topic">
    <Handle type="target" position={Position.Top} />
    <div className="mindmap-topic-cover">
      <Image src={data.cover || "/assets/projects/production-1.svg"} alt={lang === "vi" ? data.coverAltVi || data.coverAlt || "" : data.coverAlt || ""} fill sizes="240px" className="mindmap-cover" draggable={false} />
    </div>
    <h2>{label}</h2>
    {description && <p className="nowheel">{description}</p>}
    {safeHref && <Link className="nodrag nopan" href={safeHref} aria-label={`${lang === "vi" ? "Đọc thêm" : "Read more"}: ${label}`}>{lang === "vi" ? "Đọc thêm" : "Read more"} <i className="bi bi-arrow-up-right" aria-hidden="true" /></Link>}
    <Handle type="source" position={Position.Bottom} />
  </article>;
}

const nodeTypes = { topic: TopicNode };

export default function LearningMap({ map }) {
  const { lang } = useI18n();
  const graph = useMemo(() => buildLearningGraph(map.data), [map.data]);
  const [nodes, , onNodesChange] = useNodesState(graph.nodes);
  const title = lang === "vi" ? map.data.titleVi || map.data.title : map.data.title;
  const description = lang === "vi" ? map.data.descriptionVi || map.data.description : map.data.description;
  const edges = useMemo(() => graph.edges.map((edge, index) => ({ ...edge,
    label: lang === "vi" ? map.data.edges?.[index].labelVi || edge.label : edge.label,
  })), [graph.edges, lang, map.data.edges]);

  return <section className="mindmap-detail">
    <FlowCanvas nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} label={title} />
    {map.content && <div className="mindmap-notes"><ReactMarkdown>{lang === "vi" ? map.data.contentVi || map.content : map.content}</ReactMarkdown></div>}
  </section>;
}
