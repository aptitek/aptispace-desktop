// ==========================================
// networks.js - Composants de Réseaux et de Graphes
// ==========================================
import ForceGraph from "https://esm.sh/force-graph";
import ForceGraph3D from "https://esm.sh/3d-force-graph";
import SpriteText from "https://esm.sh/three-spritetext";
import TagCloud from "https://esm.sh/TagCloud";
import { getThemeColor, utils } from "./core.js"; // Import de getThemeColor et de utils

const SOL_FALLBACKS = {
  base03: "#002b36", base02: "#073642", base01: "#586e75", base00: "#657b83",
  base0: "#839496", base1: "#93a1a1", base2: "#eee8d5", base3: "#fdf6e3",
  yellow: "#b58900", orange: "#cb4b16", red: "#dc322f", magenta: "#d33682",
  violet: "#6c71c4", blue: "#268bd2", cyan: "#2aa198", green: "#859900"
};

/**
 * 🕸️ Tracé de Réseau 2D ou 3D (Force-Directed Graph)
 */
export function renderGraph(container, graphData, is3D = false) {
  if (is3D) {
    return ForceGraph3D()(container)
      .graphData(graphData)
      .nodeThreeObject(node => {
        const sprite = new SpriteText(node.id);
        sprite.color = node.color || 'white';
        sprite.textHeight = 8;
        return sprite;
      });
  }
  return ForceGraph()(container).graphData(graphData);
}

// ==========================================
// Solarized Palette (hardcoded for Canvas)
// ==========================================
const SOL = {
  base03: "#002b36", base02: "#073642", base01: "#586e75",
  base00: "#657b83", base0: "#839496", base1: "#93a1a1",
  base2: "#eee8d5", base3: "#fdf6e3",
  yellow: "#b58900", orange: "#cb4b16", red: "#dc322f",
  magenta: "#d33682", violet: "#6c71c4", blue: "#268bd2",
  cyan: "#2aa198", green: "#859900",
};

const WIRE_COLORS = [SOL.cyan, SOL.magenta, SOL.orange, SOL.violet, SOL.blue];

/**
 * ⚡ Cabling Exercise — thin force-graph 2D wrapper
 *
 * Renders a bipartite graph (left nodes ↔ right nodes) on a Canvas.
 * Interaction (click-to-connect) and validation are handled by the caller (QMD).
 *
 * @param {HTMLElement} container - DOM element that will host the canvas
 * @param {Object} opts
 * @param {Array}  opts.leftItems  - [{id, label}]
 * @param {Array}  opts.rightItems - [{id, label}]
 * @param {number} [opts.width]    - Canvas width (default: container width)
 * @param {number} [opts.height]   - Canvas height (auto-computed if omitted)
 *
 * @returns {{ graph, setLinks, setValidation, onNodeClick }}
 */
export function renderCablingGraph(container, {
  leftItems = [],
  rightItems = [],
  width: userWidth,
  height: userHeight,
} = {}) {

  // ── Layout ──────────────────────────────────────
  const maxRows = Math.max(leftItems.length, rightItems.length);
  const ROW_H = 64;
  const PAD_Y = 40;
  const W = userWidth || container.offsetWidth || 600;
  const H = userHeight || (maxRows * ROW_H + PAD_Y * 2);
  const LEFT_X = -W / 2 + 160;
  const RIGHT_X = W / 2 - 160;

  const posY = (i, total) => -((total - 1) * ROW_H) / 2 + i * ROW_H;

  // ── Nodes ───────────────────────────────────────
  const nodes = [
    ...leftItems.map((it, i) => ({
      id: `L_${it.id}`, label: it.label, group: "left", _srcId: it.id,
      fx: LEFT_X, fy: posY(i, leftItems.length),
    })),
    ...rightItems.map((it, i) => ({
      id: `R_${it.id}`, label: it.label, group: "right", _srcId: it.id,
      fx: RIGHT_X, fy: posY(i, rightItems.length),
    })),
  ];

  // ── Mutable state exposed to the caller ────────
  let links = [];           // [{source, target, colorIndex}]
  let validation = null;    // null | Map<linkKey, "correct"|"incorrect">
  let hoverNode = null;
  let activeLeft = null;    // node id of the left socket being wired
  let _onNodeClick = null;
  let dashOffset = 0;       // for animated dashes

  // ── Force-graph instance ────────────────────────
  const graph = ForceGraph()(container)
    .width(W)
    .height(H)
    .graphData({ nodes, links })
    .backgroundColor(SOL.base03)
    // Disable all physics & user navigation — pure exercise layout
    .cooldownTicks(0)
    .enableZoomInteraction(false)
    .enablePanInteraction(false)
    .enableNodeDrag(false)
    // ── Node painting ────────────────────────────
    .nodeCanvasObject((node, ctx) => {
      const isLeft = node.group === "left";
      const isHover = hoverNode === node.id;
      const isActive = activeLeft === node.id;
      const x = node.x;
      const y = node.y;

      // Socket circle
      const r = 11;
      const socketX = isLeft ? x + 120 : x - 120;

      // Glow on hover / active
      if (isHover || isActive) {
        ctx.save();
        ctx.shadowColor = isActive ? SOL.yellow : SOL.cyan;
        ctx.shadowBlur = isActive ? 18 : 12;
        ctx.beginPath();
        ctx.arc(socketX, y, r + 2, 0, Math.PI * 2);
        ctx.fillStyle = "transparent";
        ctx.fill();
        ctx.restore();
      }

      // Background pill for the label
      const labelW = 200;
      const labelH = 38;
      const pillX = isLeft ? x - 100 : x - 100;
      ctx.fillStyle = SOL.base02;
      ctx.strokeStyle = isHover ? `${SOL.blue}88` : `${SOL.base01}30`;
      ctx.lineWidth = 1;
      roundRect(ctx, pillX, y - labelH / 2, labelW, labelH, 8);
      ctx.fill();
      ctx.stroke();

      // Left accent bar or right accent bar
      ctx.fillStyle = isHover ? `${SOL.blue}88` : `${SOL.base01}60`;
      if (isLeft) {
        roundRect(ctx, pillX, y - labelH / 2, 4, labelH, [8, 0, 0, 8]);
      } else {
        roundRect(ctx, pillX + labelW - 4, y - labelH / 2, 4, labelH, [0, 8, 8, 0]);
      }
      ctx.fill();

      // Label text
      ctx.fillStyle = isLeft ? SOL.base0 : SOL.base1;
      ctx.font = isLeft
        ? `600 11px 'Recursive', sans-serif`
        : `bold 11px 'Recursive', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // Wrap text if needed
      const maxTextW = labelW - 24;
      const text = node.label;
      wrapText(ctx, text, pillX + labelW / 2, y, maxTextW, 14);

      // Socket circle
      ctx.beginPath();
      ctx.arc(socketX, y, r, 0, Math.PI * 2);
      ctx.fillStyle = "#02161b";
      ctx.fill();
      ctx.strokeStyle = isActive ? SOL.yellow : (isHover ? SOL.cyan : SOL.base01);
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Socket inner dot
      ctx.beginPath();
      ctx.arc(socketX, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? SOL.yellow : SOL.base01;
      ctx.fill();

      // Active pulsing glow
      if (isActive) {
        ctx.save();
        ctx.shadowColor = SOL.yellow;
        ctx.shadowBlur = 15 + Math.sin(Date.now() / 200) * 5;
        ctx.beginPath();
        ctx.arc(socketX, y, r + 1, 0, Math.PI * 2);
        ctx.strokeStyle = SOL.yellow;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }
    })
    .nodePointerAreaPaint((node, color, ctx) => {
      // Enlarged hit area covering both pill and socket
      const isLeft = node.group === "left";
      const socketX = isLeft ? node.x + 120 : node.x - 120;
      const minX = Math.min(node.x - 100, socketX - 14);
      const maxX = Math.max(node.x + 100, socketX + 14);
      ctx.fillStyle = color;
      ctx.fillRect(minX, node.y - 22, maxX - minX, 44);
    })
    // ── Link painting ─────────────────────────────
    .linkCanvasObject((link, ctx) => {
      const src = link.source;
      const tgt = link.target;
      if (!src || !tgt || typeof src.x === "undefined") return;

      const srcIsLeft = src.group === "left";
      const x1 = srcIsLeft ? src.x + 120 : src.x - 120;
      const y1 = src.y;
      const x2 = srcIsLeft ? tgt.x - 120 : tgt.x + 120;
      const y2 = tgt.y;

      const dx = Math.abs(x2 - x1) * 0.55;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(x1 + dx, y1, x2 - dx, y2, x2, y2);

      const ci = link.colorIndex ?? 0;
      const baseColor = WIRE_COLORS[ci % WIRE_COLORS.length];

      // Determine state
      let state = null;
      if (validation) {
        const key = `${src.id}→${tgt.id}`;
        state = validation.get(key) || null;
      }

      ctx.save();
      if (state === "correct") {
        ctx.strokeStyle = SOL.green;
        ctx.lineWidth = 5;
        ctx.setLineDash([10, 6]);
        ctx.lineDashOffset = -dashOffset;
        ctx.shadowColor = SOL.green;
        ctx.shadowBlur = 10;
      } else if (state === "incorrect") {
        const shake = Math.sin(Date.now() / 30) * 1.5;
        ctx.translate(shake, shake * 0.3);
        ctx.strokeStyle = SOL.red;
        ctx.lineWidth = 5;
        ctx.shadowColor = SOL.red;
        ctx.shadowBlur = 10;
      } else {
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = 4;
        ctx.shadowColor = baseColor;
        ctx.shadowBlur = 6;
      }
      ctx.stroke();
      ctx.restore();

      // Draw socket fills on both ends for connected state
      [{ x: x1, y: y1 }, { x: x2, y: y2 }].forEach(pt => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = state === "correct" ? SOL.green
          : state === "incorrect" ? SOL.red
          : baseColor;
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      });

      // Validated socket aura (pulsing glow ring)
      if (state) {
        const color = state === "correct" ? SOL.green : SOL.red;
        const pulse = 8 + Math.sin(Date.now() / 300) * 6;
        [{ x: x1, y: y1 }, { x: x2, y: y2 }].forEach(pt => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 11, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.shadowColor = color;
          ctx.shadowBlur = pulse;
          ctx.stroke();
          ctx.restore();
        });
      }

      // Spark particles on incorrect connections
      if (state === "incorrect") {
        const t = Date.now() / 1000;
        for (let i = 0; i < 6; i++) {
          const angle = (t * 3 + i * 1.05) % (Math.PI * 2);
          const dist = 15 + Math.sin(t * 5 + i) * 8;
          [{ x: x1, y: y1 }, { x: x2, y: y2 }].forEach(pt => {
            const sx = pt.x + Math.cos(angle) * dist;
            const sy = pt.y + Math.sin(angle) * dist;
            const sparkSize = 1.5 + Math.random() * 1.5;
            ctx.save();
            ctx.beginPath();
            ctx.arc(sx, sy, sparkSize, 0, Math.PI * 2);
            ctx.fillStyle = "#fff";
            ctx.shadowColor = SOL.orange;
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.restore();
          });
        }
      }
    })
    .linkPointerAreaPaint(() => { /* no link interaction */ })
    // ── Interaction ───────────────────────────────
    .onNodeHover(node => {
      hoverNode = node ? node.id : null;
      container.style.cursor = node ? "pointer" : "default";
    })
    .onNodeClick(node => {
      if (_onNodeClick) _onNodeClick(node);
    });

  // ── Animation loop for dash offset ─────────────
  let animFrame;
  const animate = () => {
    dashOffset = (dashOffset + 0.8) % 32;
    graph.nodeCanvasObject(graph.nodeCanvasObject()); // trigger re-render
    animFrame = requestAnimationFrame(animate);
  };
  animate();

  // ── Public API ──────────────────────────────────
  return {
    graph,

    /** Replace the current set of links and re-render */
    setLinks(newLinks) {
      links = newLinks;
      graph.graphData({ nodes, links });
    },

    /** Set validation results: Map<"L_x→R_y", "correct"|"incorrect"> or null */
    setValidation(v) {
      validation = v;
    },

    /** Set which left node is being actively wired */
    setActiveLeft(nodeId) {
      activeLeft = nodeId;
    },

    /** Register a click handler: fn(node) */
    onNodeClick(fn) {
      _onNodeClick = fn;
    },

    /** Cleanup */
    destroy() {
      cancelAnimationFrame(animFrame);
      graph._destructor && graph._destructor();
    },
  };
}

// ── Canvas helpers ────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  if (typeof r === "number") r = [r, r, r, r];
  ctx.beginPath();
  ctx.moveTo(x + r[0], y);
  ctx.lineTo(x + w - r[1], y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r[1]);
  ctx.lineTo(x + w, y + h - r[2]);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r[2], y + h);
  ctx.lineTo(x + r[3], y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r[3]);
  ctx.lineTo(x, y + r[0]);
  ctx.quadraticCurveTo(x, y, x + r[0], y);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxW, lineH) {
  const words = text.split(" ");
  let line = "";
  const lines = [];
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  lines.push(line);
  const startY = y - ((lines.length - 1) * lineH) / 2;
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineH));
}

/**
 * ☁️ Nuage de Mots 3D interactif
 */
export function renderWordCloud3D(containerSelector, words, options = {}) {
  const container = document.querySelector('#' + containerSelector);
  if (!container) {
    console.warn(`Conteneur #${containerSelector} introuvable pour le WordCloud.`);
    return null;
  }

  // Sécurité OJS : vider le conteneur avant de re-rendre pour éviter les doublons
  container.innerHTML = "";

  //TODO: Add colors

  // Options par défaut fusionnées avec les options personnalisées
  const finalOptions = {
    radius: 100,
    maxSpeed: 'normal',
    initSpeed: 'normal',
    keep: true, // Garde la rotation active quand la souris sort
    ...options
  };

  return TagCloud(container, words, finalOptions);
}

/**
 * ⚡ Cabling Exercise — thin force-graph 2D wrapper
 *
 * Renders a bipartite graph (left nodes ↔ right nodes) on a Canvas.
 * Interaction (click-to-connect) and validation are handled by the caller (QMD).
 *
 * @param {HTMLElement} container - DOM element that will host the canvas
 * @param {Object} opts
 * @param {Array}  opts.leftItems  - [{id, label}]
 * @param {Array}  opts.rightItems - [{id, label}]
 * @param {number} [opts.width]    - Canvas width (default: container width)
 * @param {number} [opts.height]   - Canvas height (auto-computed if omitted)
 *
 * @returns {{ graph, setLinks, setValidation, onNodeClick }}
 */
export function renderCablingGraph(container, {
  leftItems = [],
  rightItems = [],
  width: userWidth,
  height: userHeight,
} = {}) {

  // ── RÉSOLUTION DYNAMIQUE DU THÈME (Plus de constantes globales en dur) ──
  const SOL = Object.fromEntries(
    Object.keys(SOL_FALLBACKS).map(key => [
      key, 
      getThemeColor(`--sol-${key}`, SOL_FALLBACKS[key])
    ])
  );

  const WIRE_COLORS = [SOL.cyan, SOL.magenta, SOL.orange, SOL.violet, SOL.blue];

  // ── Layout ──────────────────────────────────────
  const maxRows = Math.max(leftItems.length, rightItems.length);
  const ROW_H = 64;
  const PAD_Y = 40;
  const W = userWidth || container.offsetWidth || 600;
  const H = userHeight || (maxRows * ROW_H + PAD_Y * 2);
  const LEFT_X = -200;
  const RIGHT_X = 200;

  const posY = (i, total) => -((total - 1) * ROW_H) / 2 + i * ROW_H;

  // ── Nodes ───────────────────────────────────────
  const nodes = [
    ...leftItems.map((it, i) => ({
      id: `L_${it.id}`, label: it.label, group: "left", _srcId: it.id,
      fx: LEFT_X, fy: posY(i, leftItems.length),
    })),
    ...rightItems.map((it, i) => ({
      id: `R_${it.id}`, label: it.label, group: "right", _srcId: it.id,
      fx: RIGHT_X, fy: posY(i, rightItems.length),
    })),
  ];

  // ── Mutable state exposed to the caller ────────
  let links = [];           // [{source, target, colorIndex}]
  let validation = null;    // null | Map<linkKey, "correct"|"incorrect">
  let hoverNode = null;
  let activeLeft = null;    // node id of the left socket being wired
  let _onNodeClick = null;
  let dashOffset = 0;       // for animated dashes

  // ── Force-graph instance ────────────────────────
  const graph = ForceGraph()(container)
    .width(W)
    .height(H)
    .graphData({ nodes, links })
    .backgroundColor(SOL.base03)
    // Disable all physics & user navigation — pure exercise layout
    .cooldownTicks(0)
    .enableZoomInteraction(false)
    .enablePanInteraction(false)
    .enableNodeDrag(false)
    // ── Node painting ────────────────────────────
    .nodeCanvasObject((node, ctx) => {
      const isLeft = node.group === "left";
      const isHover = hoverNode === node.id;
      const isActive = activeLeft === node.id;
      const x = node.x;
      const y = node.y;

      // Socket circle
      const r = 11;
      const socketX = isLeft ? x + 120 : x - 120;

      // Glow on hover / active
      if (isHover || isActive) {
        ctx.save();
        ctx.shadowColor = isActive ? SOL.yellow : SOL.cyan;
        ctx.shadowBlur = isActive ? 18 : 12;
        ctx.beginPath();
        ctx.arc(socketX, y, r + 2, 0, Math.PI * 2);
        ctx.fillStyle = "transparent";
        ctx.fill();
        ctx.restore();
      }

      // Background pill for the label
      const labelW = 200;
      const labelH = 38;
      const pillX = isLeft ? x - 100 : x - 100;
      ctx.fillStyle = SOL.base02;
      ctx.strokeStyle = isHover ? `${SOL.blue}88` : `${SOL.base01}30`;
      ctx.lineWidth = 1;
      roundRect(ctx, pillX, y - labelH / 2, labelW, labelH, 8);
      ctx.fill();
      ctx.stroke();

      // Left accent bar or right accent bar
      ctx.fillStyle = isHover ? `${SOL.blue}88` : `${SOL.base01}60`;
      if (isLeft) {
        roundRect(ctx, pillX, y - labelH / 2, 4, labelH, [8, 0, 0, 8]);
      } else {
        roundRect(ctx, pillX + labelW - 4, y - labelH / 2, 4, labelH, [0, 8, 8, 0]);
      }
      ctx.fill();

      // Label text
      ctx.fillStyle = isLeft ? SOL.base0 : SOL.base1;
      ctx.font = isLeft
        ? `600 11px 'Recursive', sans-serif`
        : `bold 11px 'Recursive', monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // Wrap text if needed
      const maxTextW = labelW - 24;
      const text = node.label;
      wrapText(ctx, text, pillX + labelW / 2, y, maxTextW, 14);

      // Socket circle
      ctx.beginPath();
      ctx.arc(socketX, y, r, 0, Math.PI * 2);
      ctx.fillStyle = "#02161b";
      ctx.fill();
      ctx.strokeStyle = isActive ? SOL.yellow : (isHover ? SOL.cyan : SOL.base01);
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Socket inner dot
      ctx.beginPath();
      ctx.arc(socketX, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? SOL.yellow : SOL.base01;
      ctx.fill();

      // Active pulsing glow
      if (isActive) {
        ctx.save();
        ctx.shadowColor = SOL.yellow;
        ctx.shadowBlur = 15 + Math.sin(Date.now() / 200) * 5;
        ctx.beginPath();
        ctx.arc(socketX, y, r + 1, 0, Math.PI * 2);
        ctx.strokeStyle = SOL.yellow;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }
    })
    .nodePointerAreaPaint((node, color, ctx) => {
      // Enlarged hit area covering both pill and socket
      const isLeft = node.group === "left";
      const socketX = isLeft ? node.x + 120 : node.x - 120;
      const minX = Math.min(node.x - 100, socketX - 14);
      const maxX = Math.max(node.x + 100, socketX + 14);
      ctx.fillStyle = color;
      ctx.fillRect(minX, node.y - 22, maxX - minX, 44);
    })
    // ── Link painting ─────────────────────────────
    .linkCanvasObject((link, ctx) => {
      const src = link.source;
      const tgt = link.target;
      if (!src || !tgt || typeof src.x === "undefined") return;

      const srcIsLeft = src.group === "left";
      const x1 = srcIsLeft ? src.x + 120 : src.x - 120;
      const y1 = src.y;
      const x2 = tgt.group === "cursor" ? tgt.x : (srcIsLeft ? tgt.x - 120 : tgt.x + 120);
      const y2 = tgt.y;

      const dx = Math.abs(x2 - x1) * 0.55;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(x1 + dx, y1, x2 - dx, y2, x2, y2);

      const ci = link.colorIndex ?? 0;
      const baseColor = link.isDragging ? SOL.yellow : WIRE_COLORS[ci % WIRE_COLORS.length];

      // Determine state
      let state = null;
      if (validation) {
        const key = `${src.id}→${tgt.id}`;
        state = validation.get(key) || null;
      }

      ctx.save();
      if (state === "correct") {
        ctx.strokeStyle = SOL.green;
        ctx.lineWidth = 5;
        ctx.setLineDash([10, 6]);
        ctx.lineDashOffset = -dashOffset;
        ctx.shadowColor = SOL.green;
        ctx.shadowBlur = 10;
      } else if (state === "incorrect") {
        const shake = Math.sin(Date.now() / 30) * 1.5;
        ctx.translate(shake, shake * 0.3);
        ctx.strokeStyle = SOL.red;
        ctx.lineWidth = 5;
        ctx.shadowColor = SOL.red;
        ctx.shadowBlur = 10;
      } else {
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = 4;
        ctx.shadowColor = baseColor;
        ctx.shadowBlur = 6;
      }
      ctx.stroke();
      ctx.restore();

      // Draw socket fills on both ends for connected state
      [{ x: x1, y: y1 }, { x: x2, y: y2 }].forEach(pt => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = state === "correct" ? SOL.green
          : state === "incorrect" ? SOL.red
          : baseColor;
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      });

      // Validated socket aura (pulsing glow ring)
      if (state) {
        const color = state === "correct" ? SOL.green : SOL.red;
        const pulse = 8 + Math.sin(Date.now() / 300) * 6;
        [{ x: x1, y: y1 }, { x: x2, y: y2 }].forEach(pt => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 11, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.shadowColor = color;
          ctx.shadowBlur = pulse;
          ctx.stroke();
          ctx.restore();
        });
      }

      // Spark particles on incorrect connections
      if (state === "incorrect") {
        const t = Date.now() / 1000;
        for (let i = 0; i < 6; i++) {
          const angle = (t * 3 + i * 1.05) % (Math.PI * 2);
          const dist = 15 + Math.sin(t * 5 + i) * 8;
          [{ x: x1, y: y1 }, { x: x2, y: y2 }].forEach(pt => {
            const sx = pt.x + Math.cos(angle) * dist;
            const sy = pt.y + Math.sin(angle) * dist;
            const sparkSize = 1.5 + Math.random() * 1.5;
            ctx.save();
            ctx.beginPath();
            ctx.arc(sx, sy, sparkSize, 0, Math.PI * 2);
            ctx.fillStyle = "#fff";
            ctx.shadowColor = SOL.orange;
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.restore();
          });
        }
      }
    })
    .linkPointerAreaPaint(() => { /* no link interaction */ })
    // ── Interaction ───────────────────────────────
    .onNodeHover(node => {
      hoverNode = node ? node.id : null;
      container.style.cursor = node ? "pointer" : "default";
    })
    .onNodeClick(node => {
      if (_onNodeClick) _onNodeClick(node);
    });

  // Auto-scale to fit the layout perfectly within the container width
  const virtualWidth = 600; // Left pill left edge is -300, right pill right edge is 300
  const margin = 24; // 24px padding on each side
  const desiredZoom = (W - 2 * margin) / virtualWidth;
  graph.zoom(desiredZoom).centerAt(0, 0);

  // ── Drag and Drop & Click Interaction Logic ────
  const canvas = container.querySelector("canvas");

  let dragStartNode = null;
  let dummyNode = null;
  let dragLink = null;
  let startX = 0;
  let startY = 0;
  let hasDragged = false;

  // Helper to find node under pointer (x, y are graph coordinates)
  const findNodeAtCoords = (gx, gy, groupFilter) => {
    return nodes.find(node => {
      if (groupFilter && node.group !== groupFilter) return false;
      const isLeft = node.group === "left";
      const socketX = isLeft ? node.x + 120 : node.x - 120;
      const minX = Math.min(node.x - 100, socketX - 14);
      const maxX = Math.max(node.x + 100, socketX + 14);
      const minY = node.y - 22;
      const maxY = node.y + 22;
      return gx >= minX && gx <= maxX && gy >= minY && gy <= maxY;
    });
  };

  if (canvas) {
    canvas.addEventListener("pointerdown", (e) => {
      if (validation) return; // Prevent interaction if validated
      
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      
      // Convert screen coords to graph coords
      const gc = graph.screen2GraphCoords(px, py);
      
      // We only start dragging if clicked on a left node
      const clickedNode = findNodeAtCoords(gc.x, gc.y, "left");
      if (clickedNode) {
        e.preventDefault();
        
        startX = e.clientX;
        startY = e.clientY;
        hasDragged = false;
        dragStartNode = clickedNode;
        
        // Temporarily highlight the node as active
        activeLeft = clickedNode.id;
        graph.setActiveLeft(activeLeft);
        
        canvas.setPointerCapture(e.pointerId);
      }
    });

    canvas.addEventListener("pointermove", (e) => {
      if (!dragStartNode) return;
      e.preventDefault();
      
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const gc = graph.screen2GraphCoords(px, py);
      
      if (!hasDragged) {
        const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
        if (dist > 5) {
          hasDragged = true;
          
          // Initialize dummy cursor node and dragging link
          dummyNode = {
            id: "TEMP_CURSOR",
            group: "cursor",
            x: gc.x,
            y: gc.y,
            fx: gc.x,
            fy: gc.y
          };
          
          dragLink = {
            source: dragStartNode,
            target: dummyNode,
            isDragging: true,
            colorIndex: leftItems.findIndex(it => it.id === dragStartNode._srcId)
          };
        }
      }
      
      if (hasDragged && dummyNode) {
        // Update dummy node coordinates
        dummyNode.x = gc.x;
        dummyNode.y = gc.y;
        dummyNode.fx = gc.x;
        dummyNode.fy = gc.y;
        
        // Update graph data with temporary drag elements
        graph.graphData({
          nodes: [...nodes, dummyNode],
          links: [...links, dragLink]
        });
        
        // Visual hover highlight on target nodes
        const hoveredRight = findNodeAtCoords(gc.x, gc.y, "right");
        hoverNode = hoveredRight ? hoveredRight.id : null;
        container.style.cursor = hoveredRight ? "pointer" : "default";
      }
    });

    canvas.addEventListener("pointerup", (e) => {
      if (!dragStartNode) return;
      e.preventDefault();
      
      canvas.releasePointerCapture(e.pointerId);
      
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const gc = graph.screen2GraphCoords(px, py);
      
      const finalDragStart = dragStartNode;
      const wasDragged = hasDragged;
      
      // Clean up drag variables
      dragStartNode = null;
      dummyNode = null;
      dragLink = null;
      hasDragged = false;
      
      // Restore clean graph data
      graph.graphData({ nodes, links });
      
      if (wasDragged) {
        // Find if dropped over a right node
        const releasedRight = findNodeAtCoords(gc.x, gc.y, "right");
        if (releasedRight) {
          // Complete the link by simulating native click sequence on CablingManager
          if (_onNodeClick) {
            // First select the left node
            _onNodeClick(finalDragStart);
            // Then select the right node to establish connection
            _onNodeClick(releasedRight);
          }
        } else {
          // If dropped in the void, reset active selection
          activeLeft = null;
          graph.setActiveLeft(null);
          // Toggle off selection in CablingManager
          if (_onNodeClick) {
            _onNodeClick(finalDragStart);
          }
        }
      }
    });

    canvas.addEventListener("pointercancel", (e) => {
      if (dragStartNode) {
        canvas.releasePointerCapture(e.pointerId);
        dragStartNode = null;
        dummyNode = null;
        dragLink = null;
        hasDragged = false;
        graph.graphData({ nodes, links });
      }
    });
  }

  // ── Animation loop for dash offset ─────────────
  let animFrame;
  const animate = () => {
    dashOffset = (dashOffset + 0.8) % 32;
    graph.nodeCanvasObject(graph.nodeCanvasObject()); // trigger re-render
    animFrame = requestAnimationFrame(animate);
  };
  animate();

  // ── Public API ──────────────────────────────────
  return {
    graph,

    /** Replace the current set of links and re-render */
    setLinks(newLinks) {
      links = newLinks;
      graph.graphData({ nodes, links });
    },

    /** Set validation results: Map<"L_x→R_y", "correct"|"incorrect"> or null */
    setValidation(v) {
      validation = v;
    },

    /** Set which left node is being actively wired */
    setActiveLeft(nodeId) {
      activeLeft = nodeId;
    },

    /** Register a click handler: fn(node) */
    onNodeClick(fn) {
      _onNodeClick = fn;
    },

    /** Cleanup */
    destroy() {
      cancelAnimationFrame(animFrame);
      graph._destructor && graph._destructor();
    },
  };
}

// À ajouter dans networks.js (en dessous de renderCablingGraph)

export class CablingManager {
  constructor(containerId, leftItems, rightItems, onStateUpdate) {
    this.container = document.querySelector(containerId);
    this.leftItems = leftItems;
    this.rightItems = rightItems;
    this.onStateUpdate = onStateUpdate;
    
    this.connections = {};
    this.activeLeft = null;
    this.validated = false;

    if (this.container) {
      this.graph = renderCablingGraph(this.container, { leftItems, rightItems });
      this.graph.onNodeClick(node => this.handleClick(node));
    }
  }

  handleClick(node) {
    if (this.validated) return;

    if (node.group === "left") {
      if (this.activeLeft === node.id) {
        this.activeLeft = null;
      } else {
        const srcId = node._srcId;
        if (this.connections[srcId]) delete this.connections[srcId];
        this.activeLeft = node.id;
      }
      this.graph.setActiveLeft(this.activeLeft);
    } else if (node.group === "right" && this.activeLeft) {
      const leftId = this.activeLeft.replace("L_", "");
      this.connections[leftId] = node._srcId;
      this.activeLeft = null;
      this.graph.setActiveLeft(null);
    }
    
    this.syncLinks();
    this.onStateUpdate(this.getState()); // Déclenche la réactivité OJS
  }

  syncLinks() {
    const links = Object.entries(this.connections).map(([lid, rid]) => ({
      source: `L_${lid}`, target: `R_${rid}`, 
      colorIndex: this.leftItems.findIndex(it => it.id === lid)
    }));
    this.graph.setLinks(links);
  }

  validate() {
    if (Object.keys(this.connections).length < this.leftItems.length) {
      return { status: "incomplete", ...this.getState() };
    }
    
    this.validated = true;
    const vMap = new Map();
    this.leftItems.forEach(item => {
      vMap.set(`L_${item.id}→R_${this.connections[item.id]}`, 
               this.connections[item.id] === item.match ? "correct" : "incorrect");
    });
    this.graph.setValidation(vMap);
    return { status: "validated", ...this.getState() };
  }

  reset() {
    this.connections = {};
    this.activeLeft = null;
    this.validated = false;
    this.graph.setActiveLeft(null);
    this.graph.setValidation(null);
    this.syncLinks();
    return { status: "hidden", ...this.getState() };
  }

  getState() {
    let score = 0;
    this.leftItems.forEach(it => { if (this.connections[it.id] === it.match) score++; });
    return { score, total: this.leftItems.length, connections: this.connections };
  }

  destroy() {
    if (this.graph && this.graph.destroy) this.graph.destroy();
  }
}

// ── Canvas helpers ────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  if (typeof r === "number") r = [r, r, r, r];
  ctx.beginPath();
  ctx.moveTo(x + r[0], y);
  ctx.lineTo(x + w - r[1], y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r[1]);
  ctx.lineTo(x + w, y + h - r[2]);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r[2], y + h);
  ctx.lineTo(x + r[3], y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r[3]);
  ctx.lineTo(x, y + r[0]);
  ctx.quadraticCurveTo(x, y, x + r[0], y);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxW, lineH) {
  const words = text.split(" ");
  let line = "";
  const lines = [];
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  lines.push(line);
  const startY = y - ((lines.length - 1) * lineH) / 2;
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineH));
}
