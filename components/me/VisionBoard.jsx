"use client";

import { useMemo } from "react";
import { Background, Controls, Handle, Position, ReactFlow } from "@xyflow/react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { buildVisionGraph } from "@/app/utils/visionGraph.mjs";

function VisionNode({ data }) {
  return (
    <article className={`me-vision-node${data.isCore ? " is-core" : ""}`} style={{ "--vision-accent": data.color || "var(--link)" }}>
      <Handle type="target" position={Position.Top} isConnectable={false} />
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
      <div className="me-vision-node-content nowheel">
        {data.image && <img src={data.image} alt={data.alt || data.title || ""} draggable={false} />}
        {data.isCore && <p className="me-vision-core-label">{data.coreLabel}</p>}
        {data.title && <h3>{data.title}</h3>}
        {data.quote && <blockquote><p>{data.quote}</p>{data.quoteAuthor && <cite>{data.quoteAuthor}</cite>}</blockquote>}
        {(data.text || data.description) && <p>{data.text || data.description}</p>}
      </div>
    </article>
  );
}

const nodeTypes = { vision: VisionNode };

export default function VisionBoard({ core, items = [] }) {
  const { lang } = useI18n();
  const graph = useMemo(() => buildVisionGraph({
    ...(core || { title: lang === "vi" ? "Giá trị cốt lõi" : "Core values" }),
    children: [...(core?.children || []), ...items],
  }, lang), [core, items, lang]);

  return (
    <div className="me-vision-shell">
      <div className="me-vision-canvas" role="region" aria-label={lang === "vi" ? "Bức tranh đời sống" : "Vision board"}>
        <ReactFlow
          key={JSON.stringify(graph)}
          defaultNodes={graph.nodes}
          defaultEdges={graph.edges}
          nodeTypes={nodeTypes}
          nodeOrigin={[0.5, 0.5]}
          onInit={(flow) => flow.setCenter(0, 0, { zoom: 0.85 })}
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.02}
          maxZoom={2}
          nodesConnectable={false}
          edgesReconnectable={false}
          deleteKeyCode={null}
          zoomOnScroll={false}
          preventScrolling={false}
        >
          <Background color="var(--border)" gap={24} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}
