import { grooveToAbc } from "./drumNotation.mjs";

// Retain event positions in the SVG so both live playback and video use engraving coordinates.
export function renderDrumSheet(Abc, options) {
  const output = [];
  const errors = [];
  const eventTimes = new Map();
  const renderer = new Abc({
    img_out: (svg) => output.push(svg),
    errmsg: (message) => errors.push(message),
    get_abcmodel: (first) => {
      for (let symbol = first; symbol; symbol = symbol.ts_next) {
        if (symbol.type === 8 || symbol.type === 10) eventTimes.set(symbol.istart, symbol.time);
      }
    },
    anno_stop: (type, start, end, x, y, width, height) => {
      if (type !== "note" && type !== "rest") return;
      const time = eventTimes.get(start);
      if (time === undefined) return;
      const step = Math.round(time / (1536 / options.division));
      renderer.out_svg(`<rect class="drum-sheet-anchor" data-step="${step}" x="${renderer.sx(x).toFixed(2)}" y="${renderer.sy(y).toFixed(2)}" width="${width.toFixed(2)}" height="${height.toFixed(2)}" fill="transparent" pointer-events="none"/>`);
    },
  });
  renderer.tosvg("drum-sheet", grooveToAbc(options));
  if (!output.length) throw new Error(errors.join(" ") || "Unable to render sheet music.");
  return output.join("");
}

export function alignSheetIndicators(container) {
  for (const svg of container.querySelectorAll("svg")) {
    const anchors = [...svg.querySelectorAll(".drum-sheet-anchor")];
    if (!anchors.length) continue;
    const top = Math.min(...anchors.map((anchor) => Number(anchor.getAttribute("y"))));
    const bottom = Math.max(...anchors.map((anchor) => Number(anchor.getAttribute("y")) + Number(anchor.getAttribute("height"))));
    for (const anchor of anchors) {
      anchor.setAttribute("y", String(top));
      anchor.setAttribute("height", String(bottom - top));
    }
  }
}
