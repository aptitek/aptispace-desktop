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
 * ⚡ Cabling Exercise — jsPlumb-based HTML/SVG implementation
 *
 * Renders left/right pill elements in a flexbox layout.
 * jsPlumb Community 6.x draws SVG Bezier connectors between endpoints.
 * Supports both drag-to-connect and click-to-connect interactions.
 *
 * @param {string}  containerId  - CSS selector for the host element (e.g. "#cabling-canvas")
 * @param {Array}   leftItems    - [{id, label}]
 * @param {Array}   rightItems   - [{id, label}]
 * @param {Function} onStateUpdate - called with {score, total, connections} on every change
 */
export class CablingManager {
  constructor(containerId, leftItems, rightItems, onStateUpdate) {
    this.containerId    = containerId;
    this.container      = document.querySelector(containerId);
    this.leftItems      = leftItems;
    this.rightItems     = rightItems;
    this.onStateUpdate  = onStateUpdate;

    this.connections  = {};   // { leftSrcId: rightSrcId }
    this.activeNode   = null; // { el, srcId, group } — pour click-to-connect
    this.validated    = false;
    this.jsp          = null; // jsPlumb instance
    this._connMap     = new Map(); // srcId → jsPlumb Connection object
    this._sparks      = [];   // spark DOM elements for incorrect connections

    if (this.container) {
      this._init();
    }
  }

  // ── Initialisation ────────────────────────────────────────────────────────

  async _init() {
    const { newInstance } = await import("https://esm.sh/@jsplumb/browser-ui@6.2.10");

    // Vider le conteneur (sécurité OJS — re-render)
    this.container.innerHTML = "";

    // Structure de base
    this.container.style.position = "relative";
    this.container.style.display  = "flex";
    this.container.style.alignItems = "center";

    // ── Colonnes HTML ───────────────────────────────
    const colLeft  = this._makeColumn("left");
    const colMid   = this._makeMidColumn();
    const colRight = this._makeColumn("right");

    this.leftItems.forEach((it, i) => {
      colLeft.appendChild(this._makePill(it, "left", i));
    });
    this.rightItems.forEach((it, i) => {
      colRight.appendChild(this._makePill(it, "right", i));
    });

    this.container.append(colLeft, colMid, colRight);

    // ── Instance jsPlumb ────────────────────────────
    this.jsp = newInstance({
      container: this.container,
      connector: { type: "Bezier", options: { curviness: 70 } },
      paintStyle: { stroke: "#2aa198", strokeWidth: 3 },
      hoverPaintStyle: { stroke: "#b58900", strokeWidth: 4 },
      endpointStyle: { fill: "#2aa198", radius: 8 },
      endpointHoverStyle: { fill: "#b58900" },
    });

    // ── Endpoints jsPlumb ───────────────────────────
    this.leftItems.forEach((it) => {
      const el = this.container.querySelector(`[data-id="L_${it.id}"]`);
      if (!el) return;
      this.jsp.addEndpoint(el, {
        anchor: "Right",
        source: true,
        target: false,
        endpoint: { type: "Dot", options: { radius: 9 } },
        maxConnections: 1,
        connectionsDetachable: true,
        cssClass: "cabling-ep-left",
      });
    });

    this.rightItems.forEach((it) => {
      const el = this.container.querySelector(`[data-id="R_${it.id}"]`);
      if (!el) return;
      this.jsp.addEndpoint(el, {
        anchor: "Left",
        source: false,
        target: true,
        endpoint: { type: "Dot", options: { radius: 9 } },
        maxConnections: 1,
        connectionsDetachable: true,
        cssClass: "cabling-ep-right",
      });
    });

    // ── Événements jsPlumb ──────────────────────────

    // Empêcher les connexions invalides (même groupe)
    this.jsp.bind("beforeDrop", (info) => {
      if (this.validated) return false;
      const srcGroup = info.connection.source.dataset.group;
      const tgtGroup = info.dropEndpoint.element.dataset.group;
      return srcGroup !== tgtGroup;
    });

    // Connexion créée
    this.jsp.bind("connection", ({ source, target, connection }) => {
      const leftEl  = source.dataset.group === "left" ? source : target;
      const rightEl = source.dataset.group === "right" ? source : target;
      const lid = leftEl.dataset.srcId;
      const rid = rightEl.dataset.srcId;
      if (!lid || !rid) return;

      // Supprimer l'ancien câble si existant pour ce connecteur gauche
      const old = this._connMap.get(lid);
      if (old && old !== connection) {
        try { this.jsp.deleteConnection(old); } catch {}
      }
      this.connections[lid] = rid;
      this._connMap.set(lid, connection);

      // Couleur par index de la pill gauche (classe CSS data-color pour ciblage)
      const ci = this.leftItems.findIndex(it => it.id === lid);
      const colors = ["#2aa198","#d33682","#cb4b16","#6c71c4","#268bd2"];
      const stroke = colors[ci % colors.length];
      connection.setPaintStyle({ stroke, strokeWidth: 3 });
      connection.setHoverPaintStyle({ stroke: "#b58900", strokeWidth: 4 });

      this._clearActive();
      this.onStateUpdate(this.getState());
    });

    // Connexion détruite
    this.jsp.bind("connectionDetached", ({ source, target }) => {
      const leftEl = source.dataset.group === "left" ? source : target;
      const lid = leftEl.dataset.srcId;
      if (lid) {
        delete this.connections[lid];
        this._connMap.delete(lid);
      }
      this.onStateUpdate(this.getState());
    });

    // ── Click-to-connect ────────────────────────────
    this.container.addEventListener("click", (e) => {
      if (this.validated) return;
      const pill = e.target.closest(".cabling-pill");
      if (!pill) return;

      const group  = pill.dataset.group;
      const srcId  = pill.dataset.srcId;

      if (!this.activeNode) {
        // Rien de sélectionné → sélectionner cette pill
        this._setActive(pill);
        return;
      }

      if (this.activeNode.srcId === srcId && this.activeNode.group === group) {
        // Même pill cliquée → désélectionner
        this._clearActive();
        return;
      }

      if (this.activeNode.group === group) {
        // Même groupe → déplacer la sélection
        this._setActive(pill);
        return;
      }

      // Groupes opposés → connecter
      const leftEl  = group === "right" ? this.activeNode.el : pill;
      const rightEl = group === "right" ? pill : this.activeNode.el;
      this._connectElements(leftEl, rightEl);
    });
  }

  // ── Helpers DOM ───────────────────────────────────────────────────────────

  _makeColumn(side) {
    const col = document.createElement("div");
    col.className = `cabling-col cabling-col--${side}`;
    col.style.cssText = `
      display: flex; flex-direction: column; gap: 16px;
      flex: 0 0 auto; width: 220px;
      ${side === "left" ? "align-items: flex-end;" : "align-items: flex-start;"}
    `;
    return col;
  }

  _makeMidColumn() {
    const mid = document.createElement("div");
    mid.style.cssText = "flex: 1 1 auto; min-width: 80px;";
    return mid;
  }

  _makePill(item, group, index) {
    const colors = ["#2aa198","#d33682","#cb4b16","#6c71c4","#268bd2"];
    const accent = colors[group === "left" ? index : 0];

    const pill = document.createElement("div");
    pill.className = "cabling-pill";
    pill.dataset.id    = `${group === "left" ? "L" : "R"}_${item.id}`;
    pill.dataset.srcId = item.id;
    pill.dataset.group = group;
    pill.textContent   = item.label;
    pill.style.cssText = `
      padding: 10px 18px;
      border-radius: 8px;
      background: #073642;
      color: #93a1a1;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      user-select: none;
      border: 2px solid #586e75;
      transition: border-color 0.2s, box-shadow 0.2s, color 0.2s;
      max-width: 210px;
      text-align: ${group === "left" ? "right" : "left"};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      position: relative;
    `;

    // Hover visuel
    pill.addEventListener("mouseenter", () => {
      if (!this.validated) {
        pill.style.borderColor = "#b58900";
        pill.style.color = "#fdf6e3";
      }
    });
    pill.addEventListener("mouseleave", () => {
      if (!this.validated && this.activeNode?.el !== pill) {
        pill.style.borderColor = this.activeNode?.el === pill ? "#b58900" : "#586e75";
        pill.style.color = "#93a1a1";
      }
    });

    return pill;
  }

  // ── Click-to-connect state ────────────────────────────────────────────────

  _setActive(pill) {
    this._clearActive();
    this.activeNode = { el: pill, srcId: pill.dataset.srcId, group: pill.dataset.group };
    pill.style.borderColor = "#b58900";
    pill.style.boxShadow   = "0 0 0 3px rgba(181,137,0,0.35)";
    pill.style.color       = "#b58900";
  }

  _clearActive() {
    if (this.activeNode?.el) {
      this.activeNode.el.style.borderColor = "#586e75";
      this.activeNode.el.style.boxShadow   = "";
      this.activeNode.el.style.color       = "#93a1a1";
    }
    this.activeNode = null;
  }

  // ── Connexion programmatique ──────────────────────────────────────────────

  _connectElements(leftEl, rightEl) {
    if (!leftEl || !rightEl || !this.jsp) return;

    const lid = leftEl.dataset.srcId;
    const rid = rightEl.dataset.srcId;

    // Supprimer l'ancien câble du côté gauche s'il existe
    const oldLeft = this._connMap.get(lid);
    if (oldLeft) { try { this.jsp.deleteConnection(oldLeft); } catch {} }

    // Supprimer l'ancien câble du côté droit si déjà occupé
    for (const [l, conn] of this._connMap.entries()) {
      if (this.connections[l] === rid && l !== lid) {
        try { this.jsp.deleteConnection(conn); } catch {}
        delete this.connections[l];
        this._connMap.delete(l);
      }
    }

    // Créer la connexion — jsPlumb émettra "connection" qui met à jour l'état
    const leftEps  = this.jsp.getEndpoints(leftEl);
    const rightEps = this.jsp.getEndpoints(rightEl);
    if (leftEps.length && rightEps.length) {
      try {
        this.jsp.connect({ source: leftEps[0], target: rightEps[0] });
      } catch (err) {
        console.warn("jsPlumb connect error:", err);
      }
    }
  }

  // ── Spark particles ────────────────────────────────────────

  _addSparks(pillEl, side) {
    const containerRect = this.container.getBoundingClientRect();
    const pillRect      = pillEl.getBoundingClientRect();
    // Socket center relative to the cabling container
    const x = side === "right"
      ? pillRect.right  - containerRect.left
      : pillRect.left   - containerRect.left;
    const y = pillRect.top + pillRect.height / 2 - containerRect.top;

    const COUNT = 6;
    for (let i = 0; i < COUNT; i++) {
      const spark = document.createElement("span");
      spark.className = "cabling-spark";
      spark.style.left  = `${x}px`;
      spark.style.top   = `${y}px`;
      spark.style.setProperty("--angle", `${i * (360 / COUNT)}deg`);
      spark.style.animationDelay = `${(i * 0.1) % 0.6}s`;
      this.container.appendChild(spark);
      this._sparks.push(spark);
    }
  }

  // ── API publique ──────────────────────────────────────────────

  validate() {
    if (Object.keys(this.connections).length < this.leftItems.length) {
      return { status: "incomplete", ...this.getState() };
    }

    this.validated = true;

    // Ajouter les classes CSS de validation (couleur + animation gérées en CSS)
    for (const [lid, conn] of this._connMap.entries()) {
      const rid       = this.connections[lid];
      const item      = this.leftItems.find(it => it.id === lid);
      const isCorrect = item && rid === item.match;
      conn.removeClass("conn-active");
      conn.addClass(isCorrect ? "conn-correct" : "conn-incorrect");

      if (!isCorrect) {
        // Ajouter des étincelles aux deux extrémités de la connexion incorrecte
        const leftEl  = this.container.querySelector(`[data-src-id="${lid}"][data-group="left"]`);
        const rightEl = this.container.querySelector(`[data-src-id="${rid}"][data-group="right"]`);
        if (leftEl)  this._addSparks(leftEl,  "right");
        if (rightEl) this._addSparks(rightEl, "left");
      }
    }

    // Force le re-rendu SVG immédiat (sans nécessiter un hover)
    this.jsp.repaintEverything();

    // Bloquer les pills visuellement
    this.container.querySelectorAll(".cabling-pill").forEach(el => {
      el.style.cursor = "default";
    });

    return { status: "validated", ...this.getState() };
  }

  reset() {
    this.validated  = false;
    this._clearActive();

    if (this.jsp) {
      this._connMap.forEach(c => {
        c.removeClass("conn-correct conn-incorrect");
        try { this.jsp.deleteConnection(c); } catch {}
      });
    }

    this.connections = {};
    this._connMap.clear();

    // Supprimer les étincelles
    this._sparks.forEach(s => s.remove());
    this._sparks = [];

    // Réactiver les pills
    this.container.querySelectorAll(".cabling-pill").forEach(el => {
      el.style.cursor      = "pointer";
      el.style.borderColor = "#586e75";
      el.style.color       = "#93a1a1";
      el.classList.remove('is-active', 'is-validated');
    });

    return { status: "hidden", ...this.getState() };
  }

  clearValidation() {
    this.validated  = false;
    this._clearActive();

    if (this.jsp) {
      this._connMap.forEach(c => {
        c.removeClass("conn-correct conn-incorrect");
      });
    }

    // Supprimer les étincelles
    this._sparks.forEach(s => s.remove());
    this._sparks = [];

    // Réactiver les pills
    this.container.querySelectorAll(".cabling-pill").forEach(el => {
      el.style.cursor      = "pointer";
      el.style.borderColor = "#586e75";
      el.style.color       = "#93a1a1";
      el.classList.remove('is-active', 'is-validated');
    });

    return { status: "hidden", ...this.getState() };
  }

  getState() {
    let score = 0;
    this.leftItems.forEach(it => {
      if (this.connections[it.id] === it.match) score++;
    });
    return { score, total: this.leftItems.length, connections: { ...this.connections } };
  }

  destroy() {
    if (this.jsp) {
      this.jsp.destroy();
      this.jsp = null;
    }
  }
}
