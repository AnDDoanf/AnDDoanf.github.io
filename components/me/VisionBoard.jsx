"use client";

import { useEffect, useRef } from "react";

function wrapText(context, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });

  if (line) lines.push(line);
  return lines;
}

export default function VisionBoard({ items }) {
  const shellRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const shell = shellRef.current;
    const canvas = canvasRef.current;
    if (!shell || !canvas) return undefined;

    const draw = () => {
      const width = shell.clientWidth;
      const isSmall = width < 620;
      const columns = isSmall ? 1 : 2;
      const gap = isSmall ? 14 : 20;
      const padding = isSmall ? 16 : 28;
      const cardHeight = isSmall ? 142 : 174;
      const rows = Math.ceil(items.length / columns);
      const height = padding * 2 + rows * cardHeight + (rows - 1) * gap;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const context = canvas.getContext("2d");
      context.scale(ratio, ratio);

      const styles = getComputedStyle(document.documentElement);
      const background = styles.getPropertyValue("--bg-alt").trim();
      const card = styles.getPropertyValue("--card").trim();
      const border = styles.getPropertyValue("--border").trim();
      const heading = styles.getPropertyValue("--heading").trim();
      const text = styles.getPropertyValue("--text").trim();
      const accents = ["#268bd2", "#2aa198", "#b58900", "#6c71c4"];

      context.fillStyle = background;
      context.fillRect(0, 0, width, height);

      items.forEach((item, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        const cardWidth = (width - padding * 2 - gap * (columns - 1)) / columns;
        const x = padding + column * (cardWidth + gap);
        const y = padding + row * (cardHeight + gap);
        const accent = item.color || accents[index % accents.length];

        context.beginPath();
        context.roundRect(x, y, cardWidth, cardHeight, 16);
        context.fillStyle = card;
        context.fill();
        context.strokeStyle = border;
        context.lineWidth = 1;
        context.stroke();

        context.fillStyle = accent;
        context.fillRect(x, y, 6, cardHeight);

        context.fillStyle = accent;
        context.font = "700 12px Cambria, Georgia, serif";
        context.fillText(String(index + 1).padStart(2, "0"), x + 24, y + 30);

        context.fillStyle = heading;
        context.font = `700 ${isSmall ? 22 : 25}px Cambria, Georgia, serif`;
        context.fillText(item.title, x + 24, y + 62);

        context.fillStyle = text;
        context.font = `${isSmall ? 14 : 15}px Cambria, Georgia, serif`;
        const lines = wrapText(context, item.description, cardWidth - 48).slice(0, 4);
        lines.forEach((line, lineIndex) => {
          context.fillText(line, x + 24, y + 91 + lineIndex * 20);
        });
      });
    };

    const resizeObserver = new ResizeObserver(draw);
    const themeObserver = new MutationObserver(draw);
    resizeObserver.observe(shell);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    draw();

    return () => {
      resizeObserver.disconnect();
      themeObserver.disconnect();
    };
  }, [items]);

  return (
    <div className="me-vision-shell" ref={shellRef}>
      <canvas
        ref={canvasRef}
        className="me-vision-canvas"
        role="img"
        aria-label={`Vision board: ${items.map((item) => item.title).join(", ")}`}
      />
    </div>
  );
}
