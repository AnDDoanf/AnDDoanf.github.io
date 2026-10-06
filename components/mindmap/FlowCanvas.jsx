"use client";

import { useEffect, useRef, useState } from "react";
import { Background, ControlButton, Controls, MiniMap, ReactFlow } from "@xyflow/react";
import { useI18n } from "@/components/i18n/I18nProvider";

export default function FlowCanvas({ nodes, edges, nodeTypes, onNodesChange, focusId, rootId, label, children }) {
  const { lang } = useI18n();
  const host = useRef(null);
  const [flow, setFlow] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState("");

  useEffect(() => {
    if (flow && focusId) flow.fitView({ nodes: [{ id: focusId }], maxZoom: 0.9, padding: 0.4, duration: 350 });
  }, [flow, focusId, nodes]);

  useEffect(() => {
    const update = () => setFullscreen(document.fullscreenElement === host.current);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await host.current?.requestFullscreen();
    } catch {
      setFullscreenError(lang === "vi" ? "Không thể mở toàn màn hình." : "Fullscreen is unavailable.");
    }
  }

  return (
    <div className="mindmap-canvas" ref={host} role="region" aria-label={label}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onInit={setFlow}
        nodesDraggable={Boolean(onNodesChange)}
        nodesConnectable={false}
        edgesReconnectable={false}
        deleteKeyCode={null}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 0.9, ...(rootId ? { nodes: [{ id: rootId }] } : {}) }}
        minZoom={0.02}
        maxZoom={2}
        defaultEdgeOptions={{ type: "smoothstep" }}
      >
        <Background gap={24} size={1} />
        <Controls showInteractive={false}>
          {rootId && <ControlButton
            onClick={() => flow?.fitView({ nodes: [{ id: rootId }], maxZoom: 0.9, padding: 0.4, duration: 350 })}
            title={lang === "vi" ? "Về nút gốc" : "Center on root"}
            aria-label={lang === "vi" ? "Về nút gốc" : "Center on root"}
          ><i className="bi bi-house" aria-hidden="true" /></ControlButton>}
          <ControlButton onClick={toggleFullscreen}
            title={fullscreen ? (lang === "vi" ? "Thoát toàn màn hình" : "Exit fullscreen") : (lang === "vi" ? "Toàn màn hình" : "Fullscreen")}
            aria-label={fullscreen ? (lang === "vi" ? "Thoát toàn màn hình" : "Exit fullscreen") : (lang === "vi" ? "Toàn màn hình" : "Fullscreen")}
          ><i className={`bi bi-${fullscreen ? "fullscreen-exit" : "arrows-fullscreen"}`} aria-hidden="true" /></ControlButton>
        </Controls>
        <MiniMap pannable zoomable nodeColor="var(--link)" />
        {children}
      </ReactFlow>
      {fullscreenError && <p role="status" className="mindmap-canvas-message">{fullscreenError}</p>}
    </div>
  );
}
