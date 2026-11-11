"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { DataSet, Network } from "vis-network/standalone/esm/vis-network.js";
import { useI18n } from "@/components/i18n/I18nProvider";
import "./vision-board.css";

const COLORS = ["#3f9e8e", "#5688bd", "#9c79b8", "#d28a54", "#cf708b", "#84a64e", "#49a6b1", "#a68a4b"];
const imageCache = new Map();
const CARD_WIDTH = 210;
const CARD_HEIGHT = 190;
const AREA_POSITIONS = [[-560, -240], [-600, 80], [-420, 390], [-170, -560], [230, -500], [550, -280], [640, 90], [350, 450]];

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function fallbackArtwork(emojis = [], color = "#6b9a91") {
  const glyphs = (emojis || []).slice(0, 3).join(" ") || "✦";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="300" viewBox="0 0 480 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="#f0eee4"/></linearGradient><radialGradient id="r"><stop stop-color="#fff" stop-opacity=".72"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="480" height="300" fill="url(#g)"/><circle cx="370" cy="65" r="145" fill="url(#r)"/><path d="M0 242 Q130 165 240 238 T480 205 V300 H0Z" fill="#fff" opacity=".17"/><path d="M0 267 Q110 198 226 266 T480 232 V300 H0Z" fill="#fff" opacity=".24"/><text x="240" y="174" text-anchor="middle" font-size="80" font-family="Arial,sans-serif">${glyphs}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function drawCard(node, networkRef, flippedNodes, flipProgress) {
  return (a) => {
    const { ctx, x, y, state, style } = a;
    const left = x - CARD_WIDTH / 2;
    const top = y - CARD_HEIGHT / 2;
    const imageHeight = CARD_HEIGHT - 48;
    const source = node.image || fallbackArtwork(node.emojis, node.iconColor);
    let image = imageCache.get(source);
    if (!image && typeof window !== "undefined") {
      image = new window.Image();
      image.onload = () => networkRef.current?.redraw();
      image.src = source;
      imageCache.set(source, image);
    }

    return {
      drawNode() {
        const progress = flipProgress.current.get(node.id) ?? (flippedNodes.current.has(node.id) ? 1 : 0);
        const opacity = style?.opacity ?? 1;
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.shadowColor = state?.hover || state?.selected ? "rgba(22, 43, 47, .18)" : "rgba(22, 43, 47, .10)";
        ctx.shadowBlur = state?.hover || state?.selected ? 14 : 8;
        ctx.shadowOffsetY = 3;
        roundedRect(ctx, left, top, CARD_WIDTH, CARD_HEIGHT, 9);
        ctx.fillStyle = "#fff";
        ctx.fill();
        ctx.restore();

        // Fade the image frame while its caption travels into the detail-card header.
        ctx.save();
        ctx.globalAlpha = opacity * (1 - progress);
        ctx.save();
        roundedRect(ctx, left + 1, top + 1, CARD_WIDTH - 2, imageHeight, 8);
        ctx.clip();
        if (image?.complete && image.naturalWidth) {
          const scale = Math.max(CARD_WIDTH / image.width, imageHeight / image.height);
          const width = image.width * scale;
          const height = image.height * scale;
          ctx.drawImage(image, left + (CARD_WIDTH - width) / 2, top + (imageHeight - height) / 2, width, height);
        } else {
          ctx.fillStyle = node.iconColor || "#789b91";
          ctx.fillRect(left, top, CARD_WIDTH, imageHeight);
        }
        ctx.restore();
        ctx.fillStyle = "#fff";
        ctx.fillRect(left + 1, top + imageHeight, CARD_WIDTH - 2, CARD_HEIGHT - imageHeight - 1);
        ctx.strokeStyle = node.group === "core" ? "#d5a129" : "#dfe6e5";
        ctx.lineWidth = node.group === "core" ? 2 : 1;
        roundedRect(ctx, left + .5, top + .5, CARD_WIDTH - 1, CARD_HEIGHT - 1, 9);
        ctx.stroke();
        ctx.font = `${node.group === "core" ? 600 : 550} 12px Inter, Arial, sans-serif`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#263638";
        let title = node.titleText || "";
        while (title.length > 3 && ctx.measureText(title).width > CARD_WIDTH - 24) title = `${title.slice(0, -2)}…`;
        ctx.fillText(title, left + 12, top + imageHeight + 20);
        ctx.restore();

        if (progress > 0) {
          ctx.save();
          ctx.globalAlpha = opacity * progress;
          ctx.fillStyle = "#fff";
          ctx.fillRect(left + 1, top + 1, CARD_WIDTH - 2, CARD_HEIGHT - 2);
          ctx.strokeStyle = node.group === "core" ? "#d5a129" : "#dfe6e5";
          ctx.lineWidth = node.group === "core" ? 2 : 1;
          roundedRect(ctx, left + .5, top + .5, CARD_WIDTH - 1, CARD_HEIGHT - 1, 9);
          ctx.stroke();
          const frontTitleY = top + imageHeight + 20;
          const titleY = frontTitleY + (top + 13 - frontTitleY) * progress;
          ctx.font = "600 12px Inter, Arial, sans-serif";
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
          ctx.fillStyle = "#263638";
          ctx.fillText(node.titleText || "", left + 12, titleY, CARD_WIDTH - 24);
          ctx.strokeStyle = "#e6ebea";
          ctx.beginPath();
          ctx.moveTo(left + 12, top + 34);
          ctx.lineTo(left + CARD_WIDTH - 12, top + 34);
          ctx.stroke();
          // Move the description up from below the card, in step with the title.
          const detailTravel = CARD_HEIGHT - 43;
          ctx.save();
          ctx.beginPath();
          ctx.rect(left + 5, top + 39, CARD_WIDTH - 10, CARD_HEIGHT - 43);
          ctx.clip();
          ctx.save();
          ctx.translate(0, detailTravel * (1 - progress));
          ctx.font = "400 11px Inter, Arial, sans-serif";
          ctx.textBaseline = "top";
          ctx.fillStyle = "#536466";
          const words = (node.description || "").split(/\s+/);
          let line = "";
          let row = 0;
          for (const word of words) {
            const next = line ? `${line} ${word}` : word;
            if (ctx.measureText(next).width > CARD_WIDTH - 24 && line) {
              ctx.fillText(line, left + 12, top + 44 + row * 15);
              row += 1;
              line = word;
              if (row > 7) break;
            } else line = next;
          }
          if (line && row <= 7) ctx.fillText(line, left + 12, top + 44 + row * 15, CARD_WIDTH - 24);
          ctx.restore();
          ctx.restore();
        }
      },
      nodeDimensions: { width: CARD_WIDTH, height: CARD_HEIGHT },
    };
  };
}

function localized(item, lang, key) {
  return lang === "vi" ? item?.[`${key}Vi`] || item?.[key] : item?.[key];
}

function createGraph(core, items, lang, networkRef, flippedNodes, flipProgress) {
  const nodes = [{
    id: "me",
    label: " ",
    titleText: lang === "vi" ? "\u0054\u00f4\u0069" : "Me",
    description: localized(core, lang, "text") || "",
    group: "core",
    iconColor: "#b58a24",
    ctxRenderer: drawCard({ id: "me", group: "core", titleText: lang === "vi" ? "\u0054\u00f4\u0069" : "Me", image: core?.image, emojis: core?.emojis || ["\u2726"], iconColor: "#d5a129", description: localized(core, lang, "text") || "" }, networkRef, flippedNodes, flipProgress),
    fixed: { x: true, y: true },
    physics: false,
    x: 0,
    y: 0,
  }];
  const edges = [];

  function addChildren(children, parentId, color, depth, path, parentPoint = { x: 0, y: 0 }, parentAngle = -Math.PI / 2) {
    (children || []).forEach((item, index) => {
      const id = `${path}-${index}`;
      const title = localized(item, lang, "title") || "";
      const description = localized(item, lang, "description") || localized(item, lang, "text") || localized(item, lang, "quote") || "";
      const descendants = item.children || [];
      const nodeColor = item.color || color || COLORS[index % COLORS.length];
      const angle = depth === 1
        ? Math.atan2(AREA_POSITIONS[index % AREA_POSITIONS.length][1], AREA_POSITIONS[index % AREA_POSITIONS.length][0])
        : parentAngle + (index - (children.length - 1) / 2) * Math.min(.7, Math.PI / Math.max(children.length, 1));
      const point = depth === 1
        ? { x: AREA_POSITIONS[index % AREA_POSITIONS.length][0], y: AREA_POSITIONS[index % AREA_POSITIONS.length][1] }
        : { x: parentPoint.x + Math.cos(angle) * 315 + Math.sin(angle) * (index ? 115 : -115), y: parentPoint.y + Math.sin(angle) * 315 - Math.cos(angle) * (index ? 115 : -115) };
      const nodeData = {
        id,
        label: " ",
        titleText: title,
        description: [localized(item, lang, "verse"), description].filter(Boolean).join("\n"),
        group: depth === 1 ? "area" : "goal",
        x: point.x,
        y: point.y,
        iconColor: nodeColor,
        image: item.image,
        emojis: item.emojis || [],
        color: { background: "#ffffff", border: nodeColor, highlight: { background: "#ffffff", border: nodeColor }, hover: { background: "#ffffff", border: nodeColor } },
      };
      nodes.push({
        ...nodeData,
        shape: "custom",
        ctxRenderer: drawCard(nodeData, networkRef, flippedNodes, flipProgress),
      });
      edges.push({
        id: `${parentId}-${id}`,
        from: parentId,
        to: id,
        color: { color: nodeColor, highlight: nodeColor, hover: nodeColor, opacity: .78 },
        width: depth === 1 ? 1.8 : 1.25,
        smooth: { enabled: true, type: "continuous", roundness: .28 },
      });
      addChildren(descendants, id, nodeColor, depth + 1, id, point, angle);
    });
  }

  addChildren(items, "me", null, 1, "area");
  return { nodes, edges };
}

export default function VisionBoard({ core, items = [] }) {
  const { lang } = useI18n();
  const host = useRef(null);
  const networkRef = useRef(null);
  const flippedNodes = useRef(new Set());
  const flipProgress = useRef(new Map());
  const flipFrames = useRef(new Map());
  const graph = useMemo(() => createGraph(core, items, lang, networkRef, flippedNodes, flipProgress), [core, items, lang]);

  const flipCard = useCallback((id) => {
    const shouldFlip = !flippedNodes.current.has(id);
    if (shouldFlip) flippedNodes.current.add(id);
    else flippedNodes.current.delete(id);
    const start = flipProgress.current.get(id) ?? (shouldFlip ? 0 : 1);
    const target = shouldFlip ? 1 : 0;
    const existingFrame = flipFrames.current.get(id);
    if (existingFrame) cancelAnimationFrame(existingFrame);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      flipProgress.current.set(id, target);
      networkRef.current?.redraw();
      return;
    }
    const beganAt = performance.now();
    const duration = 360;
    const tick = (now) => {
      const t = Math.min(1, (now - beganAt) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      flipProgress.current.set(id, start + (target - start) * eased);
      networkRef.current?.redraw();
      if (t < 1) flipFrames.current.set(id, requestAnimationFrame(tick));
      else flipFrames.current.delete(id);
    };
    flipFrames.current.set(id, requestAnimationFrame(tick));
  }, []);

  useEffect(() => {
    if (!host.current || !graph.nodes.length) return undefined;
    const network = new Network(host.current, {
      nodes: new DataSet(graph.nodes),
      edges: new DataSet(graph.edges),
    }, {
      autoResize: true,
      interaction: { hover: true, hoverConnectedEdges: true, dragNodes: true, dragView: true, zoomView: true, multiselect: false },
      layout: { improvedLayout: false, randomSeed: 24 },
      nodes: {
        shape: "custom",
        margin: { top: 11, right: 12, bottom: 10, left: 38 },
        widthConstraint: { maximum: 230 },
        shapeProperties: { borderRadius: 8 },
        borderWidth: 1,
        borderWidthSelected: 2,
        shadow: { enabled: true, color: "rgba(28, 52, 58, .10)", size: 8, x: 0, y: 2 },
        font: { face: "Inter, Arial, sans-serif", size: 12, color: "#263638", multi: "md", align: "left", vadjust: 0 },
      },
      groups: {
        core: { color: { background: "#ffffff", border: "#d5a129", highlight: { background: "#ffffff", border: "#d5a129" } }, borderWidth: 2 },
        area: { font: { face: "Inter, Arial, sans-serif", size: 12, color: "#263638", bold: { color: "#263638", size: 12, face: "Inter, Arial, sans-serif" } } },
        goal: { font: { face: "Inter, Arial, sans-serif", size: 11, color: "#34494b", bold: { color: "#34494b", size: 11, face: "Inter, Arial, sans-serif" } } },
      },
      edges: { smooth: { enabled: true, type: "continuous", roundness: .28 }, selectionWidth: 1, hoverWidth: 1 },
      physics: {
        enabled: true,
        stabilization: { enabled: true, iterations: 600, fit: false },
        barnesHut: { gravitationalConstant: -22000, centralGravity: .035, springLength: 300, springConstant: .025, damping: .18, avoidOverlap: .9 },
        maxVelocity: 18,
        minVelocity: .75,
      },
    });
    networkRef.current = network;
    const onCardClick = ({ nodes: hitNodes }) => { if (hitNodes?.[0]) flipCard(hitNodes[0]); };
    const onHoverNode = () => { if (host.current) host.current.style.cursor = "pointer"; };
    const onBlurNode = () => { if (host.current) host.current.style.cursor = "grab"; };
    network.on("click", onCardClick);
    network.on("hoverNode", onHoverNode);
    network.on("blurNode", onBlurNode);
    network.once("stabilized", () => {
      network.stopSimulation();
      network.moveTo({ position: { x: 0, y: 0 }, scale: .58, animation: false });
    });
    return () => {
      network.off("click", onCardClick);
      network.off("hoverNode", onHoverNode);
      network.off("blurNode", onBlurNode);
      flipFrames.current.forEach((frame) => cancelAnimationFrame(frame));
      flipFrames.current.clear();
      network.destroy();
      networkRef.current = null;
    };
  }, [flipCard, graph]);

  return <div className="vision-network" role="region" aria-label={lang === "vi" ? "\u0053\u01a1 \u0111\u1ed3 \u006d\u1ea1\u006e\u0067 \u006c\u01b0\u1edb\u0069 \u0074\u1ea7\u006d \u006e\u0068\u00ec\u006e \u0063\u0075\u1ed9\u0063 \u0073\u1ed1\u006e\u0067" : "Life vision network graph"}>
    <div className="vision-network-canvas" ref={host} />
    <div className="vision-network-hint">{lang === "vi" ? "K\u00e9o \u0111\u1ec3 di chuy\u1ec3n · Cu\u1ed9n \u0111\u1ec3 thu ph\u00f3ng" : "Drag to pan · Scroll to zoom"}</div>
  </div>;
}
