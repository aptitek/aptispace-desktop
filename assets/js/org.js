// ==========================================
// org.js - Les Organismes (Simulateurs Pédagogiques) (DRY/KISS)
// ==========================================
import { theme, utils } from "./core.js";
const mol = {
  get dataRow() { return (typeof window !== 'undefined' ? window.ui?.dataRow : null); },
  get metricCard() { return (typeof window !== 'undefined' ? window.ui?.metricCard : null); },
  get terminalConsole() { return (typeof window !== 'undefined' ? window.ui?.terminalConsole : null); }
};


// Si tu le mets dans org.js, les imports sont déjà là.
// Si tu crées viz.js, ajoute ces imports :
// import { theme } from "./core.js";
// import * as atom from "./atom.js";

/**
 * 📈 Conteneur Dynamique Plotly
 * Génère un noeud DOM (et non un string) pour le montage du graphique.
 */
export const plotlyWrapper = ({ data, layout = {}, config = {}, title = "Visualisation", height = "400px" }) => {
  // 1. Création de l'élément racine (DOM Node)
  const container = document.createElement('div');
  container.className = "ui-card is-debug"; 
  
  // 2. Construction de l'en-tête et du corps
  let headerHtml = title ? `<div class="ui-card-header">${title}</div>` : '';
  container.innerHTML = `
    ${headerHtml}
    <div class="ui-card-body" style="padding: 0; display: flex; justify-content: center;">
      <div class="plot-container" style="width: 100%; height: ${height};"></div>
    </div>
  `;
  
  const plotNode = container.querySelector('.plot-container');

  // 3. Injection du thème Solarized dans le layout Plotly
  // Plotly gère parfois mal les variables CSS brutes var(--...), on utilise les équivalents hex/rgba
  const themeLayout = {
    paper_bgcolor: 'rgba(0,0,0,0)', // Fond transparent pour voir la carte ui-card
    plot_bgcolor: 'rgba(0,0,0,0)',
    colorway: [
      '#268bd2', // Blue
      '#859900', // Green
      '#2aa198', // Cyan
      '#cb4b16', // Orange
      '#dc322f', // Red
      '#d33682', // Magenta
      '#6c71c4', // Violet
      '#b58900'  // Yellow
    ],
    font: { 
      family: theme.fontSans, 
      color: '#839496' // Base0
    },
    xaxis: { 
      gridcolor: 'rgba(88, 110, 117, 0.15)', // Grille discrète
      zerolinecolor: '#586e75' // Base01
    },
    yaxis: { 
      gridcolor: 'rgba(88, 110, 117, 0.15)',
      zerolinecolor: '#586e75'
    },
    margin: { t: 40, r: 20, b: 40, l: 40 },
    ...layout // Permet d'écraser la config par défaut si besoin
  };

  const finalConfig = { responsive: true, displayModeBar: false, ...config };

  // 4. Rendu différé : on s'assure que OJS a le temps d'insérer le noeud dans la page
  setTimeout(() => {
    if (typeof Plotly !== 'undefined') {
      Plotly.newPlot(plotNode, data, themeLayout, finalConfig);
    } else {
      plotNode.innerHTML = `
        <div style="padding: 20px;">
          <div class="text-danger" style="font-family: var(--font-code, monospace);">&gt; Erreur: Plotly n'est pas chargé sur cette page.</div>
        </div>
      `;
    }
  }, 10);

  return container; // Retourne l'objet DOM, pas un string !
};

/**
 * 📉 Simulateur de Régression Linéaire (Organisme)
 */
export const linearRegressionSim = ({ 
  pointsX = [1, 2, 3, 4, 5], 
  pointsY = [2.1, 3.8, 6.5, 9.2, 11.1], 
  slope = 2, 
  intercept = 0 
}) => {
  
  // Trace 1 : Le nuage de points (Scatter)
  const scatterTrace = {
    x: pointsX,
    y: pointsY,
    mode: 'markers',
    type: 'scatter',
    name: 'Données (Train)',
    marker: { color: '#2aa198', size: 10 } // Vert Solarized (Cyan)
  };

  // Trace 2 : La droite de régression dynamique (Line)
  const lineX = [Math.min(...pointsX) - 1, Math.max(...pointsX) + 1];
  const lineY = lineX.map(x => slope * x + intercept);
  
  const lineTrace = {
    x: lineX,
    y: lineY,
    mode: 'lines',
    type: 'scatter',
    name: 'Modèle (f(x) = ax + b)',
    line: { color: '#b58900', width: 3 } // Jaune Solarized
  };

  return plotlyWrapper({
    title: "Ajustement du Modèle : Régression Linéaire",
    data: [scatterTrace, lineTrace],
    layout: {
      xaxis: { title: 'Variable Explicative (X)' },
      yaxis: { title: 'Variable Cible (Y)' },
      showlegend: true,
      legend: { orientation: 'h', y: -0.2 }
    }
  });
};

/**
 * ⚡ Exercice de Câblage Interactif (Patch Panel Matching)
 * Permet d'associer visuellement des éléments de gauche à des éléments de droite.
 */
export const cablingExercise = ({
  title = "Console de Câblage",
  instructions = "Reliez chaque fiche de gauche à son connecteur de droite.",
  leftItems = [],
  rightItems = [],
  feedbacks = {},
  successMessage = "Excellent ! Tous les signaux sont parfaitement synchronisés. Votre diagnostic est validé !",
  errorMessage = "Alerte : Le câblage est incorrect. Des signaux sont mal dirigés ou erronés."
}) => {
  // 1. Création de l'élément racine
  const container = document.createElement("div");
  container.className = "ui-cabling-card";

  // 2. Mélanger les éléments pour le défi
  const shuffledLeft = [...leftItems].sort(() => Math.random() - 0.5);
  const shuffledRight = [...rightItems].sort(() => Math.random() - 0.5);

  // 3. Injection du style CSS localisé pour isolation parfaite
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .ui-cabling-card {
      background: var(--sol-base03);
      color: var(--sol-base0);
      border: 1px solid var(--sol-base02);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 25px;
      font-family: var(--font-sans);
      position: relative;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
      overflow: visible;
    }
    .ui-cabling-header {
      margin-bottom: 24px;
      border-bottom: 1px solid rgba(var(--sol-base1-rgb), 0.15);
      padding-bottom: 14px;
    }
    .ui-cabling-title {
      font-family: var(--font-code);
      font-size: 1.15em;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--sol-blue);
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .ui-cabling-title::before {
      content: "⚡";
      font-size: 1.25em;
    }
    .ui-cabling-desc {
      font-size: 0.9em;
      color: var(--sol-base1);
      line-height: 1.5;
    }
    .ui-cabling-workspace {
      display: flex;
      justify-content: space-between;
      position: relative;
      gap: 120px;
      margin-bottom: 24px;
      min-height: 280px;
    }
    .ui-cabling-svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10;
    }
    .ui-cabling-col {
      display: flex;
      flex-direction: column;
      gap: 20px;
      flex: 1;
      z-index: 5;
    }
    .ui-cabling-item {
      background: var(--sol-base02);
      border: 1px solid rgba(var(--sol-base1-rgb), 0.12);
      border-radius: 10px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;
      position: relative;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
    }
    .ui-cabling-col.is-left .ui-cabling-item {
      flex-direction: row;
      border-left: 4px solid var(--sol-base01);
    }
    .ui-cabling-col.is-right .ui-cabling-item {
      flex-direction: row-reverse;
      border-right: 4px solid var(--sol-base01);
    }
    .ui-cabling-item:hover {
      border-color: rgba(var(--sol-blue-rgb), 0.5);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
      transform: translateY(-2px);
    }
    .ui-cabling-label {
      font-size: 0.9em;
      font-weight: 600;
      line-height: 1.4;
      color: var(--sol-base0);
    }
    .ui-cabling-col.is-right .ui-cabling-label {
      font-family: var(--font-code);
      font-size: 0.85em;
      font-weight: bold;
      color: var(--sol-base1);
    }
    .ui-cabling-item.is-connected {
      border-color: rgba(var(--sol-base1-rgb), 0.25);
    }

    /* Sockets */
    .ui-cabling-socket {
      width: 22px;
      height: 22px;
      background: #02161b;
      border: 3.5px solid var(--sol-base01);
      border-radius: 50%;
      cursor: pointer;
      position: relative;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: inset 0 3px 6px rgba(0,0,0,0.6), 0 0 0 rgba(0,0,0,0);
      flex-shrink: 0;
    }
    .ui-cabling-socket::after {
      content: "";
      position: absolute;
      top: 5px;
      left: 5px;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--sol-base01);
      transition: all 0.2s ease;
    }
    .ui-cabling-socket:hover {
      transform: scale(1.25);
      border-color: var(--sol-cyan);
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.6), 0 0 12px rgba(var(--sol-cyan-rgb), 0.6);
    }
    .ui-cabling-socket.is-active {
      border-color: var(--sol-yellow) !important;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.6), 0 0 15px var(--sol-yellow) !important;
      animation: pulse-yellow 1s infinite alternate;
    }
    .ui-cabling-socket.is-active::after {
      background: var(--sol-yellow);
    }

    @keyframes pulse-yellow {
      0% { transform: scale(1.1); }
      100% { transform: scale(1.3); }
    }

    /* Wire drawing overlay */
    .ui-cabling-wire {
      stroke-width: 5px;
      stroke-linecap: round;
      fill: none;
      filter: drop-shadow(0 3px 5px rgba(0,0,0,0.4));
      transition: stroke 0.35s ease, stroke-dasharray 0.35s ease, filter 0.35s ease;
    }
    .ui-cabling-wire.is-draft {
      stroke: var(--sol-yellow);
      stroke-width: 4px;
      stroke-dasharray: 6, 6;
      filter: drop-shadow(0 0 5px var(--sol-yellow));
    }

    /* Electricity flow animation for correct links */
    @keyframes cable-flow {
      to {
        stroke-dashoffset: -32;
      }
    }
    .ui-cabling-wire.is-correct {
      stroke: var(--sol-green) !important;
      stroke-dasharray: 10, 6;
      animation: cable-flow 0.8s linear infinite;
      filter: drop-shadow(0 0 8px rgba(var(--sol-green-rgb), 0.8));
    }
    
    /* Vibrate and flashing for errors */
    @keyframes wire-shake {
      0% { transform: translate(1.5px, 0.5px) rotate(0.2deg); }
      50% { transform: translate(-1.5px, -0.5px) rotate(-0.2deg); }
      100% { transform: translate(1px, -1px) rotate(0.1deg); }
    }
    .ui-cabling-wire.is-incorrect {
      stroke: var(--sol-red) !important;
      animation: wire-shake 0.15s ease-in-out infinite;
      filter: drop-shadow(0 0 8px rgba(var(--sol-red-rgb), 0.7));
    }

    /* LED Glowing auras for validated connections */
    .ui-cabling-socket.is-correct-aura {
      animation: aura-pulse-green 1.2s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes aura-pulse-green {
      0% {
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.6), 0 0 8px var(--sol-green);
        border-color: var(--sol-green);
      }
      100% {
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.6), 0 0 22px var(--sol-green), 0 0 35px rgba(var(--sol-green-rgb), 0.5);
        border-color: #a5bd0c;
      }
    }

    .ui-cabling-socket.is-incorrect-aura {
      animation: aura-pulse-red 1.2s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes aura-pulse-red {
      0% {
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.6), 0 0 8px var(--sol-red);
        border-color: var(--sol-red);
      }
      100% {
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.6), 0 0 26px var(--sol-red), 0 0 45px rgba(var(--sol-red-rgb), 0.6);
        border-color: #ff5e5b;
      }
    }

    /* Sparks Fontaine system */
    @keyframes spark-fly {
      0% {
        transform: translate3d(0, 0, 0) scale(1.2);
        opacity: 1;
      }
      80% {
        opacity: 0.9;
      }
      100% {
        transform: translate3d(var(--tx), var(--ty), 0) scale(0);
        opacity: 0;
      }
    }
    .ui-cabling-spark {
      position: absolute;
      top: 50%;
      left: 50%;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 0 5px #fff, 0 0 10px var(--sol-orange), 0 0 16px var(--sol-red);
      pointer-events: none;
      z-index: 100;
      animation: spark-fly 1s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
    }

    /* Controls block */
    .ui-cabling-actions {
      display: flex;
      gap: 15px;
      margin-top: 24px;
      border-top: 1px solid rgba(var(--sol-base1-rgb), 0.15);
      padding-top: 20px;
    }
    .ui-cabling-btn {
      font-family: var(--font-code);
      font-size: 0.85em;
      font-weight: 800;
      padding: 10px 22px;
      border: none;
      border-radius: 30px;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .ui-cabling-btn.is-verify {
      background: var(--sol-blue);
      color: var(--sol-base3);
      box-shadow: 0 4px 10px rgba(var(--sol-blue-rgb), 0.25);
    }
    .ui-cabling-btn.is-verify:hover {
      background: #1e85ca;
      box-shadow: 0 6px 18px rgba(var(--sol-blue-rgb), 0.45);
      transform: translateY(-2px);
    }
    .ui-cabling-btn.is-reset {
      background: transparent;
      border: 1.5px solid var(--sol-base01);
      color: var(--sol-base1);
    }
    .ui-cabling-btn.is-reset:hover {
      background: rgba(var(--sol-base1-rgb), 0.08);
      color: var(--sol-base00);
      border-color: var(--sol-base1);
    }

    /* Feedback block */
    .ui-cabling-feedback-panel {
      margin-top: 24px;
      border-radius: 10px;
      padding: 20px;
      font-size: 0.95em;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: reveal-panel 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    @keyframes reveal-panel {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .ui-cabling-feedback-panel.is-success {
      background: rgba(var(--sol-green-rgb), 0.08);
      border-left: 5px solid var(--sol-green);
      color: var(--sol-green);
    }
    .ui-cabling-feedback-panel.is-error {
      background: rgba(var(--sol-red-rgb), 0.08);
      border-left: 5px solid var(--sol-red);
      color: var(--sol-red);
    }
    .ui-cabling-feedback-header {
      font-family: var(--font-code);
      font-weight: 800;
      font-size: 1.15em;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ui-cabling-feedback-detail {
      color: var(--sol-base0);
      margin-top: 8px;
      font-size: 0.9em;
      list-style-type: none;
      padding-left: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .ui-cabling-feedback-detail li {
      position: relative;
      padding-left: 24px;
      line-height: 1.5;
    }
    .ui-cabling-feedback-detail li::before {
      content: "🔍";
      position: absolute;
      left: 0;
      font-size: 1em;
    }
  `;
  container.appendChild(styleEl);

  // 4. Construction de la structure DOM
  const header = document.createElement("div");
  header.className = "ui-cabling-header";
  header.innerHTML = `
    <div class="ui-cabling-title">${title}</div>
    <div class="ui-cabling-desc">${instructions}</div>
  `;
  container.appendChild(header);

  const workspace = document.createElement("div");
  workspace.className = "ui-cabling-workspace";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "ui-cabling-svg");
  workspace.appendChild(svg);

  const colLeft = document.createElement("div");
  colLeft.className = "ui-cabling-col is-left";

  shuffledLeft.forEach(item => {
    const itemEl = document.createElement("div");
    itemEl.className = "ui-cabling-item";
    itemEl.id = `item-left-${item.id}`;
    itemEl.innerHTML = `
      <div class="ui-cabling-label">${item.label}</div>
      <div class="ui-cabling-socket" data-id="${item.id}" data-side="left" id="socket-left-${item.id}"></div>
    `;
    colLeft.appendChild(itemEl);
  });

  const colRight = document.createElement("div");
  colRight.className = "ui-cabling-col is-right";

  shuffledRight.forEach(item => {
    const itemEl = document.createElement("div");
    itemEl.className = "ui-cabling-item";
    itemEl.id = `item-right-${item.id}`;
    itemEl.innerHTML = `
      <div class="ui-cabling-label">${item.label}</div>
      <div class="ui-cabling-socket" data-id="${item.id}" data-side="right" id="socket-right-${item.id}"></div>
    `;
    colRight.appendChild(itemEl);
  });

  workspace.appendChild(colLeft);
  workspace.appendChild(colRight);
  container.appendChild(workspace);

  const actions = document.createElement("div");
  actions.className = "ui-cabling-actions";

  const verifyBtn = document.createElement("button");
  verifyBtn.className = "ui-cabling-btn is-verify";
  verifyBtn.textContent = "🔌 Synchroniser & Valider";

  const resetBtn = document.createElement("button");
  resetBtn.className = "ui-cabling-btn is-reset";
  resetBtn.textContent = "🧹 Débrancher Tout";

  actions.appendChild(verifyBtn);
  actions.appendChild(resetBtn);
  container.appendChild(actions);

  const feedbackPanel = document.createElement("div");
  feedbackPanel.className = "ui-cabling-feedback-panel";
  feedbackPanel.style.display = "none";
  container.appendChild(feedbackPanel);

  // 5. Gestion des états de connexion
  let userConnections = {}; // { leftId: rightId }
  let activeLeftSocket = null;
  let validated = false;
  let mouseX = 0;
  let mouseY = 0;

  // Couleurs néon Solarized pour les câbles
  const wireColors = [
    "var(--sol-cyan)",
    "var(--sol-magenta)",
    "var(--sol-orange)",
    "var(--sol-violet)",
    "var(--sol-blue)"
  ];

  // Calcul du centre d'un socket par rapport à l'espace de travail SVG
  const getSocketCenter = (socketEl) => {
    const rectWorkspace = workspace.getBoundingClientRect();
    const rectSocket = socketEl.getBoundingClientRect();
    return {
      x: rectSocket.left - rectWorkspace.left + rectSocket.width / 2,
      y: rectSocket.top - rectWorkspace.top + rectSocket.height / 2
    };
  };

  // Tracé d'un câble SVG
  const drawWirePath = (x1, y1, x2, y2, color, isDraft, isCorrect, isIncorrect) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const dx = Math.abs(x2 - x1) * 0.55;
    const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
    
    path.setAttribute("d", d);
    let classes = "ui-cabling-wire";
    if (isDraft) classes += " is-draft";
    if (isCorrect) classes += " is-correct";
    if (isIncorrect) classes += " is-incorrect";
    
    path.setAttribute("class", classes);
    path.style.stroke = color;
    return path;
  };

  // Génération de fontaines d'étincelles électriques pour les courts-circuits
  const createSparks = (socketEl) => {
    const oldSparks = socketEl.querySelector(".ui-cabling-sparks-container");
    if (oldSparks) oldSparks.remove();

    const sparksContainer = document.createElement("div");
    sparksContainer.className = "ui-cabling-sparks-container";
    sparksContainer.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      pointer-events: none;
      z-index: 100;
    `;

    // Générer 18 étincelles par prise défaillante
    for (let i = 0; i < 18; i++) {
      const spark = document.createElement("div");
      spark.className = "ui-cabling-spark";
      
      // Angle aléatoire avec propulsion (effet fontaine d'arc électrique)
      const angle = Math.random() * Math.PI * 2;
      const distance = 40 + Math.random() * 60;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance - 25; // Trajectoire légèrement ascendante
      
      spark.style.setProperty("--tx", `${tx}px`);
      spark.style.setProperty("--ty", `${ty}px`);
      
      const size = 3 + Math.random() * 3.5;
      spark.style.width = `${size}px`;
      spark.style.height = `${size}px`;
      
      spark.style.animationDelay = `${Math.random() * 0.6}s`;
      spark.style.animationDuration = `${0.6 + Math.random() * 0.7}s`;
      
      sparksContainer.appendChild(spark);
    }
    socketEl.appendChild(sparksContainer);
  };

  // Mise à jour de l'affichage (câbles + sockets + surbrillances)
  const redraw = () => {
    // 1. Vider le SVG
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // 2. Réinitialiser le style de tous les sockets et items
    container.querySelectorAll(".ui-cabling-socket").forEach(s => {
      s.style.borderColor = "";
      s.style.backgroundColor = "";
      s.style.boxShadow = "";
      s.classList.remove("is-correct-aura", "is-incorrect-aura");
      const sparks = s.querySelector(".ui-cabling-sparks-container");
      if (sparks) sparks.remove();
    });
    container.querySelectorAll(".ui-cabling-item").forEach(item => {
      item.classList.remove("is-connected");
      item.style.borderColor = "";
    });

    // 3. Dessiner chaque connexion permanente existante
    Object.entries(userConnections).forEach(([leftId, rightId]) => {
      const socketL = container.querySelector(`#socket-left-${leftId}`);
      const socketR = container.querySelector(`#socket-right-${rightId}`);
      const itemL = container.querySelector(`#item-left-${leftId}`);
      const itemR = container.querySelector(`#item-right-${rightId}`);

      if (socketL && socketR) {
        const cL = getSocketCenter(socketL);
        const cR = getSocketCenter(socketR);

        const leftIndex = leftItems.findIndex(item => item.id === leftId);
        const baseColor = wireColors[leftIndex % wireColors.length];

        let strokeColor = baseColor;
        let isCorrect = false;
        let isIncorrect = false;

        if (validated) {
          const itemConfig = leftItems.find(item => item.id === leftId);
          const correct = itemConfig && itemConfig.match === rightId;
          if (correct) {
            isCorrect = true;
            strokeColor = "var(--sol-green)";
          } else {
            isIncorrect = true;
            strokeColor = "var(--sol-red)";
          }
        }

        const wire = drawWirePath(cL.x, cL.y, cR.x, cR.y, strokeColor, false, isCorrect, isIncorrect);
        svg.appendChild(wire);

        itemL.classList.add("is-connected");
        itemR.classList.add("is-connected");

        const borderCol = strokeColor;
        socketL.style.borderColor = borderCol;
        socketR.style.borderColor = borderCol;
        socketL.style.boxShadow = `0 0 6px ${borderCol}`;
        socketR.style.boxShadow = `0 0 6px ${borderCol}`;
        
        socketL.style.backgroundColor = isCorrect ? "var(--sol-green)" : (isIncorrect ? "var(--sol-red)" : baseColor);
        socketR.style.backgroundColor = isCorrect ? "var(--sol-green)" : (isIncorrect ? "var(--sol-red)" : baseColor);

        // Appliquer l'effet d'aura et de fontaine d'étincelles
        if (validated) {
          if (isCorrect) {
            socketL.classList.add("is-correct-aura");
            socketR.classList.add("is-correct-aura");
          } else {
            socketL.classList.add("is-incorrect-aura");
            socketR.classList.add("is-incorrect-aura");
            
            // Créer les fontaines d'étincelles sur les deux extrémités s'il n'y en a pas encore
            if (!socketL.querySelector(".ui-cabling-sparks-container")) {
              createSparks(socketL);
            }
            if (!socketR.querySelector(".ui-cabling-sparks-container")) {
              createSparks(socketR);
            }
          }
        }
      }
    });

    // 4. Si un tracé est en cours, dessiner le câble temporaire
    if (activeLeftSocket) {
      const cL = getSocketCenter(activeLeftSocket);
      const draftColor = "var(--sol-yellow)";
      const draftWire = drawWirePath(cL.x, cL.y, mouseX, mouseY, draftColor, true, false, false);
      svg.appendChild(draftWire);
    }
  };

  const cancelDrafting = () => {
    if (activeLeftSocket) {
      activeLeftSocket.classList.remove("is-active");
      activeLeftSocket = null;
    }
    workspace.removeEventListener("mousemove", onMouseMove);
    redraw();
  };

  const onMouseMove = (e) => {
    if (!activeLeftSocket) return;
    const rectWorkspace = workspace.getBoundingClientRect();
    mouseX = e.clientX - rectWorkspace.left;
    mouseY = e.clientY - rectWorkspace.top;
    redraw();
  };

  // 6. Gestionnaires d'événements pour le câblage interactif
  workspace.addEventListener("click", (e) => {
    const socket = e.target.closest(".ui-cabling-socket");
    
    if (!socket) {
      if (activeLeftSocket) {
        cancelDrafting();
      }
      return;
    }

    const id = socket.getAttribute("data-id");
    const side = socket.getAttribute("data-side");

    if (side === "left") {
      if (activeLeftSocket) {
        cancelDrafting();
      }

      if (userConnections[id]) {
        delete userConnections[id];
        if (validated) resetValidationState();
      }

      activeLeftSocket = socket;
      socket.classList.add("is-active");
      
      const rectWorkspace = workspace.getBoundingClientRect();
      mouseX = e.clientX - rectWorkspace.left;
      mouseY = e.clientY - rectWorkspace.top;

      workspace.addEventListener("mousemove", onMouseMove);
      redraw();
    } else if (side === "right") {
      if (activeLeftSocket) {
        const leftId = activeLeftSocket.getAttribute("data-id");
        userConnections[leftId] = id;
        
        if (validated) resetValidationState();
        cancelDrafting();
      }
    }
  });

  const resetValidationState = () => {
    validated = false;
    feedbackPanel.style.display = "none";
    redraw();
  };

  // Validation
  verifyBtn.addEventListener("click", () => {
    const connectionsCount = Object.keys(userConnections).length;
    
    if (connectionsCount < leftItems.length) {
      feedbackPanel.style.display = "block";
      feedbackPanel.className = "ui-cabling-feedback-panel is-error";
      feedbackPanel.innerHTML = `
        <div class="ui-cabling-feedback-header">⚠️ SIGNAL BROUILLÉ - SYSTÈME INCOMPLET</div>
        <div style="color: var(--sol-base00);">L'analyse ne peut pas démarrer. Reliez TOUTES les prises femelles avant d'activer le courant électrique ! (${connectionsCount} / ${leftItems.length} fiches connectées)</div>
      `;
      return;
    }

    validated = true;
    let score = 0;
    
    leftItems.forEach(item => {
      if (userConnections[item.id] === item.match) {
        score++;
      }
    });

    const isAllCorrect = score === leftItems.length;

    feedbackPanel.style.display = "block";
    feedbackPanel.className = `ui-cabling-feedback-panel ${isAllCorrect ? "is-success" : "is-error"}`;
    
    let detailsHtml = "";
    leftItems.forEach(item => {
      const correct = userConnections[item.id] === item.match;
      const connectedRight = rightItems.find(r => r.id === userConnections[item.id]);
      const connectedName = connectedRight ? connectedRight.label : "Inconnue";

      if (correct) {
        detailsHtml += `<li><strong>${item.label}</strong> relié à <em>${connectedName}</em> : <span style="color: var(--sol-green); font-weight: bold;">[Signal OK]</span>. ${feedbacks[item.id] || ""}</li>`;
      } else {
        detailsHtml += `<li><strong>${item.label}</strong> relié à <em>${connectedName}</em> : <span style="color: var(--sol-red); font-weight: bold;">[Bruit / Erreur de phase]</span>. Mauvaise direction. Réfléchissez : est-ce qualitatif ou quantitatif ? Y a-t-il un ordre ?</li>`;
      }
    });

    feedbackPanel.innerHTML = `
      <div class="ui-cabling-feedback-header">
        ${isAllCorrect ? "✅ ANALYSE VALIDÉE - SYNCHRONISATION SIGNAL REPRÉSENTATIVE" : "❌ CONFLIT ÉLECTRIQUE - ERREUR DE BRANCHEMENT"} 
        (Score: ${score} / ${leftItems.length})
      </div>
      <div style="color: var(--sol-base00); margin-bottom: 12px; font-weight: 500;">
        ${isAllCorrect ? successMessage : errorMessage}
      </div>
      <ul class="ui-cabling-feedback-detail">
        ${detailsHtml}
      </ul>
    `;

    container.value = {
      userConnections,
      score,
      isCorrect: isAllCorrect
    };
    container.dispatchEvent(new Event("input", { bubbles: true }));

    redraw();
  });

  resetBtn.addEventListener("click", () => {
    userConnections = {};
    cancelDrafting();
    validated = false;
    feedbackPanel.style.display = "none";
    
    container.value = null;
    container.dispatchEvent(new Event("input", { bubbles: true }));
    
    redraw();
  });

  const resizeObserver = new ResizeObserver(() => {
    redraw();
  });
  resizeObserver.observe(container);

  setTimeout(redraw, 50);

  return container;
};

/**
 * 🧠 Simulateur de Parcours Mémoire RAM (Stockage Ligne vs Colonne)
 * Visualise de manière interactive les sauts du CPU (Cache Misses/Hits) avec des arcs animés.
 */
export const ramPathSimulator = ({
  storageMode = "ligne",
  queryCol = "Aucune",
  tableData = [
    { ID: "A1", Âge: 25, Salaire: "50k" },
    { ID: "B2", Âge: 30, Salaire: "60k" },
    { ID: "C3", Âge: 28, Salaire: "55k" }
  ],
  columns = ["ID", "Âge", "Salaire"],
  colors = {
    ID: "var(--sol-blue)",
    "Âge": "var(--sol-green)",
    Salaire: "var(--sol-orange)"
  },
  arcMultiplier = 0.9,     // Multiplicateur pour régler la hauteur des sauts (plus haut !)
  particleDuration = "1.8s" // Vitesse de la particule CPU
}) => {
  // Calcul des slots de mémoire physique en fonction du mode de stockage
  const slots = [];
  if (storageMode === "ligne") {
    // Mode Ligne : regroupement par ligne
    tableData.forEach((row, rowIndex) => {
      columns.forEach(col => {
        slots.push({
          colLabel: col,
          val: row[col],
          colName: col,
          physIndex: rowIndex * columns.length + columns.indexOf(col)
        });
      });
    });
  } else {
    // Mode Colonne : regroupement par colonne
    columns.forEach(col => {
      tableData.forEach((row, rowIndex) => {
        slots.push({
          colLabel: col,
          val: row[col],
          colName: col,
          physIndex: rowIndex * columns.length + columns.indexOf(col)
        });
      });
    });
  }

  // Abscisse X de chaque slot dans le SVG
  const getX = (index) => {
    const group = Math.floor(index / 3);
    const posInGroup = index % 3;
    return 30 + group * 218 + posInGroup * 64;
  };

  // Génération des fonds des blocs mémoire (Arrière-plan, calque 1)
  const slotsBackgroundHtml = slots.map((slot, index) => {
    const x = getX(index);
    const isActive = queryCol === "Aucune" || slot.colName === queryCol;
    const opacityVal = isActive ? 1.0 : 0.15;
    const fillCol = colors[slot.colName] || "var(--sol-base01)";
    
    return `
      <!-- Rectangle de bloc mémoire -->
      <rect class="ram-rect" x="${x}" y="80" width="60" height="45" rx="6" ry="6" fill="${fillCol}" opacity="${opacityVal}" stroke="${isActive && queryCol !== 'Aucune' ? 'var(--sol-base3)' : 'none'}" stroke-width="1.5" style="transition: all 0.4s ease;" />
    `;
  }).join('');

  // Génération des textes et labels des blocs mémoire (Premier plan, calque 3)
  const slotsTextHtml = slots.map((slot, index) => {
    const x = getX(index);
    const isActive = queryCol === "Aucune" || slot.colName === queryCol;
    
    return `
      <g style="pointer-events: none;">
        <!-- Label de colonne au-dessus -->
        <text x="${x + 30}" y="65" font-family="'Recursive', sans-serif" font-size="9" font-weight="800" fill="var(--sol-base01)" text-anchor="middle" letter-spacing="0.5" opacity="${isActive ? 0.9 : 0.4}">
          ${slot.colLabel.toUpperCase()}
        </text>
        
        <!-- Valeur dans le bloc -->
        <text class="ram-text" x="${x + 30}" y="108" font-family="'Recursive', monospace" font-size="14" font-weight="900" fill="${isActive ? 'var(--sol-base3)' : 'var(--sol-base01)'}" text-anchor="middle" opacity="${isActive ? 1.0 : 0.4}" style="transition: all 0.4s ease;">
          ${slot.val}
        </text>
        
        <!-- Adresse physique RAM en dessous -->
        <text x="${x + 30}" y="142" font-family="'Recursive', monospace" font-size="9" font-weight="bold" fill="var(--sol-base1)" text-anchor="middle" opacity="${isActive ? 0.75 : 0.3}">
          0x${(index * 8).toString(16).toUpperCase().padStart(2, '0')}
        </text>
      </g>
    `;
  }).join('');

  // Recherche des indices des slots actifs pour le parcours CPU
  const activeIndices = [];
  if (queryCol !== "Aucune") {
    slots.forEach((slot, index) => {
      if (slot.colName === queryCol) {
        activeIndices.push(index);
      }
    });
  }

  // Tracé du chemin CPU réactif
  let cpuPathHtml = "";
  if (activeIndices.length >= 2) {
    let d = `M ${getX(activeIndices[0]) + 30} 102.5`;
    let jumpLabels = "";

    for (let i = 0; i < activeIndices.length - 1; i++) {
      const idx0 = activeIndices[i];
      const idx1 = activeIndices[i+1];
      const x0 = getX(idx0) + 30;
      const x1 = getX(idx1) + 30;
      const dist = Math.abs(x1 - x0);
      
      // Hauteur de l'arc (avec le nouveau arcMultiplier plus généreux et haut !)
      const ctrl_y = 102.5 - dist * arcMultiplier;
      const peakY = 102.5 - dist * (arcMultiplier / 2);
      d += ` Q ${(x0 + x1) / 2} ${ctrl_y} ${x1} 102.5`;

      // Libellés sémantiques (Cache Miss si saut, Cache Hit si contigu)
      const isContiguous = (idx1 - idx0 === 1);
      const labelText = isContiguous ? "⚡ Cache Hit" : "⚠️ Cache Miss";
      const labelCol = isContiguous ? "var(--sol-green)" : "var(--sol-red)";
      
      jumpLabels += `
        <text x="${(x0 + x1) / 2}" y="${peakY - 12}" font-family="'Recursive', sans-serif" font-size="9" font-weight="800" fill="${labelCol}" text-anchor="middle" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))">
          ${labelText}
        </text>
      `;
    }

    const activeColor = colors[queryCol] || "var(--sol-yellow)";

    cpuPathHtml = `
      <!-- Chemin de guidage (piste) -->
      <path d="${d}" stroke="rgba(var(--sol-base01-rgb), 0.15)" stroke-width="4" fill="none" />
      
      <!-- Chemin animé montrant l'impulsion électrique -->
      <path class="cpu-path" d="${d}" stroke="${activeColor}" stroke-width="3" fill="none" stroke-dasharray="10 6" style="animation: cpu-dash 1s linear infinite;" />
      
      <!-- Particule néon active circulant le long du chemin -->
      <circle r="6" fill="${activeColor}" filter="url(#glow-particle)">
        <animateMotion dur="${particleDuration}" repeatCount="indefinite" path="${d}" rotate="auto" />
      </circle>
      
      <!-- Libellés Cache Hits / Misses -->
      ${jumpLabels}
    `;
  }

  return `
    <style>
      @keyframes cpu-dash {
        to {
          stroke-dashoffset: -20;
        }
      }
      .cpu-path {
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .ram-container {
        background: var(--sol-base3);
        border: 2px solid var(--sol-base2);
        border-radius: 12px;
        padding: 20px;
        box-shadow: inset 0 2px 8px rgba(0, 43, 54, 0.05);
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
      }
    </style>

    <div class="ram-container">
      <!-- Le viewBox de y=-110 à y=175 offre 285px de hauteur totale pour accommoder des arcs élevés majestueux -->
      <svg viewBox="0 -110 700 285" width="100%" height="100%" style="max-height: 290px; overflow: visible;">
        <defs>
          <filter id="glow-particle" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Flèches de liaison physiques par défaut (inter-groupes) -->
        <g opacity="0.25" stroke="var(--sol-base1)" stroke-width="2" fill="none" stroke-linecap="round">
          <path d="M 218 102.5 L 238 102.5 M 232 96.5 L 238 102.5 L 232 108.5" />
          <path d="M 446 102.5 L 466 102.5 M 460 96.5 L 466 102.5 L 460 108.5" />
        </g>

        ${slotsBackgroundHtml}
        ${cpuPathHtml}
        ${slotsTextHtml}
      </svg>

      <!-- Carte d'Analyse CPU intégrée de façon transparente -->
      <div class="ui-card ${
        queryCol === 'Aucune' ? 'is-debug' : 
        storageMode === 'ligne' ? 'is-danger' : 'is-success'
      }" style="margin-top: 20px; margin-bottom: 0; width: 100%;">
        <div class="ui-card-header">🔍 Analyse CPU</div>
        <div class="ui-card-body">
          ${
            queryCol === "Aucune"
              ? "Sélectionnez une colonne ci-dessus pour observer le comportement du processeur lors de la lecture."
              : storageMode === "ligne"
                ? `Pour lire '${queryCol}', le processeur doit scanner toute la mémoire et faire des sauts inutiles (<strong>Cache Misses</strong>). C'est inefficace.`
                : `Toutes les données '${queryCol}' sont côte à côte. Le processeur lit le bloc d'un seul coup (<strong>Cache Hits</strong>). C'est ultra-rapide !`
          }
        </div>
      </div>
    </div>
  `;
};

/**
 * ⚖️ Tableau de bord interactif des 4 natures de données
 */
export const dataNaturesDashboard = () => {
  const container = document.createElement("div");
  container.className = "ui-natures-dashboard";
  
  // Style localisé
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .ui-natures-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: 20px;
      margin-bottom: 25px;
    }
    .ui-nature-card {
      display: flex;
      background: var(--sol-base3);
      border: 1.5px solid var(--sol-base2);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      min-height: 220px;
    }
    .ui-nature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      border-color: var(--sol-base1);
    }
    .ui-nature-left {
      width: 170px;
      background: var(--sol-base2);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      border-right: 1px solid rgba(var(--sol-base03-rgb), 0.08);
      padding: 10px;
      overflow: hidden;
      user-select: none;
    }
    .ui-nature-right {
      flex: 1;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .ui-nature-header {
      font-size: 1.1em;
      font-weight: 800;
      color: var(--sol-base03);
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .ui-nature-tag {
      font-size: 0.7em;
      padding: 2px 8px;
      border-radius: 20px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .ui-nature-desc {
      font-size: 0.85em;
      color: var(--sol-base01);
      line-height: 1.4;
      margin-bottom: 12px;
    }
    .ui-nature-examples {
      font-size: 0.8em;
      color: var(--sol-base00);
      background: rgba(var(--sol-base03-rgb), 0.02);
      border-left: 3px solid var(--sol-base1);
      padding: 8px 12px;
      border-radius: 4px;
    }
    
    /* Styles interactifs */
    .pyramid-level {
      cursor: pointer;
      transition: fill 0.2s ease, opacity 0.2s ease;
      fill-opacity: 0.85;
    }
    .pyramid-level:hover {
      fill-opacity: 1;
      filter: brightness(1.15);
    }
    .discrete-btn {
      position: absolute;
      bottom: 8px;
      font-size: 0.7em;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 15px;
      border: 1px solid var(--sol-base1);
      background: var(--sol-base3);
      color: var(--sol-base00);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .discrete-btn:hover {
      background: var(--sol-base2);
      border-color: var(--sol-base01);
    }
  `;
  container.appendChild(styleEl);
  
  const grid = document.createElement("div");
  grid.className = "ui-natures-grid";
  container.appendChild(grid);
  
  // 1. CARD NOMINALE
  const cardNominal = document.createElement("div");
  cardNominal.className = "ui-nature-card";
  cardNominal.innerHTML = `
    <div class="ui-nature-left" id="nature-nominal-plot">
      <canvas width="160" height="160" style="display: block; width: 160px; height: 160px;"></canvas>
    </div>
    <div class="ui-nature-right">
      <div>
        <div class="ui-nature-header">
          <span>Nominale</span>
          <span class="ui-nature-tag" style="background: rgba(38, 139, 210, 0.1); color: var(--sol-blue);">Qualitative</span>
        </div>
        <div class="ui-nature-desc">
          Catégories ou étiquettes sans aucun ordre de grandeur ni hiérarchie naturelle. Les chiffres ne servent que de codes d'identification.
        </div>
      </div>
      <div class="ui-nature-examples">
        <strong>Exemples :</strong> Couleur des yeux, Pays, Genre, Code postal.
      </div>
    </div>
  `;
  grid.appendChild(cardNominal);
  
  // Setup 3D Word Cloud
  const canvas = cardNominal.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const words = [
    { text: "Rouge", x: 0, y: 0, z: 0, color: "#dc322f" },
    { text: "France", x: 0, y: 0, z: 0, color: "#268bd2" },
    { text: "Standard", x: 0, y: 0, z: 0, color: "#859900" },
    { text: "A+", x: 0, y: 0, z: 0, color: "#b58900" },
    { text: "Bleu", x: 0, y: 0, z: 0, color: "#268bd2" },
    { text: "Genre", x: 0, y: 0, z: 0, color: "#d33682" },
    { text: "Directeur", x: 0, y: 0, z: 0, color: "#2aa198" },
    { text: "Italie", x: 0, y: 0, z: 0, color: "#6c71c4" },
    { text: "Vert", x: 0, y: 0, z: 0, color: "#859900" }
  ];
  
  // Initialize word positions on a sphere
  words.forEach((w, i) => {
    const phi = Math.acos(-1 + (2 * i) / words.length);
    const theta = Math.sqrt(words.length * Math.PI) * phi;
    const r = 55; // sphere radius
    w.x = r * Math.sin(phi) * Math.cos(theta);
    w.y = r * Math.sin(phi) * Math.sin(theta);
    w.z = r * Math.cos(phi);
  });
  
  let angleX = 0.005;
  let angleY = 0.008;
  
  const rotate3D = () => {
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    words.forEach(w => {
      const y1 = w.y * cosX - w.z * sinX;
      const z1 = w.z * cosX + w.y * sinX;
      w.y = y1;
      w.z = z1;
    });
    
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);
    words.forEach(w => {
      const x1 = w.x * cosY - w.z * sinY;
      const z1 = w.z * cosY + w.x * sinY;
      w.x = x1;
      w.z = z1;
    });
  };
  
  const drawWordCloud = () => {
    ctx.clearRect(0, 0, 160, 160);
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    
    const sorted = [...words].sort((a, b) => a.z - b.z);
    
    sorted.forEach(w => {
      const scale = 110 / (110 - w.z);
      const projX = 80 + w.x * scale;
      const projY = 80 + w.y * scale;
      
      const opacity = 0.2 + (w.z + 55) / 110 * 0.8;
      const size = Math.round(9 + (w.z + 55) / 110 * 7);
      
      ctx.font = `bold ${size}px "Recursive", -apple-system, sans-serif`;
      ctx.fillStyle = w.color;
      ctx.globalAlpha = Math.max(0.1, Math.min(1, opacity));
      ctx.fillText(w.text, projX, projY);
    });
    ctx.globalAlpha = 1.0;
  };
  
  let cloudInterval;
  const animCloud = () => {
    rotate3D();
    drawWordCloud();
    cloudInterval = requestAnimationFrame(animCloud);
  };
  animCloud();
  
  cardNominal.querySelector(".ui-nature-left").addEventListener("mousemove", (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left - 80;
    const my = e.clientY - rect.top - 80;
    angleX = my * 0.0001;
    angleY = -mx * 0.0001;
  });
  
  // 2. CARD ORDINALE
  const cardOrdinal = document.createElement("div");
  cardOrdinal.className = "ui-nature-card";
  cardOrdinal.innerHTML = `
    <div class="ui-nature-left" id="nature-ordinal-plot">
      <svg width="150" height="150" viewBox="0 0 150 150" style="overflow: visible;">
        <!-- Top Level -->
        <polygon points="75,20 50,60 100,60" class="pyramid-level" data-level="3" fill="#b58900" stroke="var(--sol-base3)" stroke-width="2"/>
        <!-- Middle Level -->
        <polygon points="48,65 102,65 115,105 35,105" class="pyramid-level" data-level="2" fill="#2aa198" stroke="var(--sol-base3)" stroke-width="2"/>
        <!-- Bottom Level -->
        <polygon points="32,110 118,110 130,150 20,150" class="pyramid-level" data-level="1" fill="#268bd2" stroke="var(--sol-base3)" stroke-width="2"/>
        
        <text x="75" y="48" fill="var(--sol-base3)" font-size="9" font-weight="bold" text-anchor="middle" pointer-events="none">Rang 3</text>
        <text x="75" y="88" fill="var(--sol-base3)" font-size="10" font-weight="bold" text-anchor="middle" pointer-events="none">Rang 2</text>
        <text x="75" y="133" fill="var(--sol-base3)" font-size="11" font-weight="bold" text-anchor="middle" pointer-events="none">Rang 1</text>
      </svg>
      <div id="ordinal-hover-text" style="position: absolute; bottom: 8px; font-size: 0.7em; font-family: var(--font-code); color: var(--sol-base1); width: 100%; text-align: center;">Survolez la pyramide</div>
    </div>
    <div class="ui-nature-right">
      <div>
        <div class="ui-nature-header">
          <span>Ordinale</span>
          <span class="ui-nature-tag" style="background: rgba(38, 139, 210, 0.1); color: var(--sol-blue);">Qualitative</span>
        </div>
        <div class="ui-nature-desc">
          Catégories textuelles dotées d'une hiérarchie stricte et d'une logique de rang. La distance mathématique entre rangs n'est pas mesurable.
        </div>
      </div>
      <div class="ui-nature-examples">
        <strong>Exemples :</strong> Niveau (S/M/L), Mention bac, Satisfaction.
      </div>
    </div>
  `;
  grid.appendChild(cardOrdinal);
  
  const pyramidLevels = cardOrdinal.querySelectorAll(".pyramid-level");
  const hoverText = cardOrdinal.querySelector("#ordinal-hover-text");
  const rankNames = {
    "3": "Rang 3 : Niveau Supérieur 🥇",
    "2": "Rang 2 : Niveau Moyen 🥈",
    "1": "Rang 1 : Niveau Inférieur 🥉"
  };
  pyramidLevels.forEach(level => {
    level.addEventListener("mouseenter", () => {
      const lvl = level.getAttribute("data-level");
      hoverText.innerText = rankNames[lvl];
      hoverText.style.color = level.getAttribute("fill");
    });
    level.addEventListener("mouseleave", () => {
      hoverText.innerText = "Survolez la pyramide";
      hoverText.style.color = "";
    });
  });
  
  // 3. CARD DISCRÈTE
  const cardDiscrete = document.createElement("div");
  cardDiscrete.className = "ui-nature-card";
  cardDiscrete.innerHTML = `
    <div class="ui-nature-left" id="nature-discrete-plot">
      <svg width="150" height="130" viewBox="0 0 150 130">
        <rect x="20" y="105" width="16" height="0" fill="#859900" rx="2" style="transition: height 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28), y 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)"/>
        <rect x="45" y="105" width="16" height="0" fill="#859900" rx="2" style="transition: height 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28), y 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)"/>
        <rect x="70" y="105" width="16" height="0" fill="#859900" rx="2" style="transition: height 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28), y 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)"/>
        <rect x="95" y="105" width="16" height="0" fill="#859900" rx="2" style="transition: height 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28), y 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)"/>
        <rect x="120" y="105" width="16" height="0" fill="#859900" rx="2" style="transition: height 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28), y 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)"/>
        
        <line x1="10" y1="105" x2="140" y2="105" stroke="var(--sol-base01)" stroke-width="1.5"/>
        
        <text x="28" y="118" fill="var(--sol-base1)" font-size="9" text-anchor="middle" font-family="var(--font-code)">0</text>
        <text x="53" y="118" fill="var(--sol-base1)" font-size="9" text-anchor="middle" font-family="var(--font-code)">1</text>
        <text x="78" y="118" fill="var(--sol-base1)" font-size="9" text-anchor="middle" font-family="var(--font-code)">2</text>
        <text x="103" y="118" fill="var(--sol-base1)" font-size="9" text-anchor="middle" font-family="var(--font-code)">3</text>
        <text x="128" y="118" fill="var(--sol-base1)" font-size="9" text-anchor="middle" font-family="var(--font-code)">4+</text>
      </svg>
      <button class="discrete-btn">🎲 Lancer simulation</button>
    </div>
    <div class="ui-nature-right">
      <div>
        <div class="ui-nature-header">
          <span>Discrète</span>
          <span class="ui-nature-tag" style="background: rgba(133, 153, 0, 0.1); color: var(--sol-green);">Quantitative</span>
        </div>
        <div class="ui-nature-desc">
          Valeurs numériques entières dénombrables. On compte des unités distinctes et complètes (pas de demi-mesure ou décimales possible).
        </div>
      </div>
      <div class="ui-nature-examples">
        <strong>Exemples :</strong> Nombre d'enfants, clics web, transactions suspectes.
      </div>
    </div>
  `;
  grid.appendChild(cardDiscrete);
  
  const rects = cardDiscrete.querySelectorAll("rect");
  const discreteBtn = cardDiscrete.querySelector(".discrete-btn");
  
  const updateDiscreteChart = () => {
    let total = 0;
    const heights = Array.from({ length: 5 }, () => {
      const val = 10 + Math.floor(Math.random() * 80);
      total += val;
      return val;
    });
    rects.forEach((rect, i) => {
      const pct = heights[i] / total;
      const h = Math.round(pct * 80);
      rect.setAttribute("height", h);
      rect.setAttribute("y", 105 - h);
    });
  };
  
  updateDiscreteChart();
  discreteBtn.addEventListener("click", updateDiscreteChart);
  
  // 4. CARD CONTINUE
  const cardContinuous = document.createElement("div");
  cardContinuous.className = "ui-nature-card";
  cardContinuous.innerHTML = `
    <div class="ui-nature-left" id="nature-continuous-plot" style="cursor: crosshair;">
      <svg width="150" height="130" viewBox="0 0 150 130">
        <!-- Smooth Normal Curve -->
        <path d="M 15,105 C 45,105 60,20 75,20 C 90,20 105,105 135,105" fill="none" stroke="#268bd2" stroke-width="2.5"/>
        <line x1="10" y1="105" x2="140" y2="105" stroke="var(--sol-base01)" stroke-width="1.5"/>
        
        <line id="tracker-line" x1="75" y1="15" x2="75" y2="105" stroke="var(--sol-yellow)" stroke-dasharray="3,3" stroke-width="1.5" style="display: none;"/>
        <circle id="tracker-dot" cx="75" cy="20" r="4.5" fill="var(--sol-yellow)" style="display: none;"/>
      </svg>
      <div id="continuous-value" style="position: absolute; bottom: 8px; font-size: 0.65em; font-family: var(--font-code); color: var(--sol-yellow); width: 100%; text-align: center; font-weight: bold; padding: 0 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
        Glissez la souris
      </div>
    </div>
    <div class="ui-nature-right">
      <div>
        <div class="ui-nature-header">
          <span>Continue</span>
          <span class="ui-nature-tag" style="background: rgba(133, 153, 0, 0.1); color: var(--sol-green);">Quantitative</span>
        </div>
        <div class="ui-nature-desc">
          Valeurs décimales mesurables sur une échelle infinie. Il existe un nombre infini de possibilités réelles entre deux mesures données.
        </div>
      </div>
      <div class="ui-nature-examples">
        <strong>Exemples :</strong> Température en °C, Salaire exact, Latitude, Poids en kg.
      </div>
    </div>
  `;
  grid.appendChild(cardContinuous);
  
  const continuousLeft = cardContinuous.querySelector(".ui-nature-left");
  const trackerLine = cardContinuous.querySelector("#tracker-line");
  const trackerDot = cardContinuous.querySelector("#tracker-dot");
  const valueDisplay = cardContinuous.querySelector("#continuous-value");
  
  const getGaussianY = (x) => {
    // Mean = 75, stdDev = 20, scale = 85
    const dx = (x - 75) / 20;
    return 105 - 85 * Math.exp(-0.5 * dx * dx);
  };
  
  continuousLeft.addEventListener("mousemove", (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    
    const x = Math.max(15, Math.min(135, mx * (150 / rect.width)));
    const y = getGaussianY(x);
    
    trackerLine.setAttribute("x1", x);
    trackerLine.setAttribute("x2", x);
    trackerLine.style.display = "block";
    
    trackerDot.setAttribute("cx", x);
    trackerDot.setAttribute("cy", y);
    trackerDot.style.display = "block";
    
    const finalX = ((x - 15) / 120 * 100).toFixed(4);
    const finalY = ((105 - y) / 85 * 35).toFixed(4);
    
    valueDisplay.innerHTML = `X: <span style="color:var(--sol-blue);">${finalX}</span> | Y: <span style="color:var(--sol-green);">${finalY}</span>`;
  });
  
  continuousLeft.addEventListener("mouseleave", () => {
    trackerLine.style.display = "none";
    trackerDot.style.display = "none";
    valueDisplay.innerText = "Glissez la souris";
  });
  
  container.addEventListener("DOMNodeRemoved", () => {
    cancelAnimationFrame(cloudInterval);
  });
  
  return container;
};

/**
 * 💾 Visualiseur d'encodage physique des types en RAM
 */
export const ramEncodingVisualizer = () => {
  const container = document.createElement("div");
  container.className = "ui-ram-visualizer";

  // Style localisé
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .ui-ram-container {
      background: var(--sol-base03);
      color: var(--sol-base0);
      border: 1px solid var(--sol-base02);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 25px;
      font-family: var(--font-sans);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }
    .ui-ram-selector {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .ui-ram-tab {
      background: var(--sol-base02);
      border: 1.5px solid rgba(var(--sol-base1-rgb), 0.15);
      color: var(--sol-base1);
      padding: 8px 16px;
      border-radius: 30px;
      cursor: pointer;
      font-size: 0.85em;
      font-weight: 800;
      font-family: var(--font-code);
      transition: all 0.25s ease;
      text-transform: uppercase;
    }
    .ui-ram-tab:hover {
      background: rgba(var(--sol-blue-rgb), 0.1);
      border-color: var(--sol-blue);
      color: var(--sol-base0);
    }
    .ui-ram-tab.is-active {
      background: var(--sol-blue);
      color: var(--sol-base3);
      border-color: var(--sol-blue);
      box-shadow: 0 4px 12px rgba(var(--sol-blue-rgb), 0.3);
    }
    
    /* Stick de RAM SVG */
    .ui-ram-stick-svg {
      width: 100%;
      height: auto;
      max-height: 120px;
      margin-bottom: 24px;
      filter: drop-shadow(0 6px 12px rgba(0,0,0,0.4));
    }
    .ram-pin {
      fill: #b58900;
      transition: fill 0.2s ease;
    }
    .ram-pin.is-active {
      fill: var(--sol-yellow);
      filter: drop-shadow(0 0 3px var(--sol-yellow));
    }
    .ram-chip {
      fill: #222;
      stroke: #333;
      stroke-width: 1.5px;
      transition: all 0.3s ease;
    }
    .ram-chip.is-active {
      fill: #111;
      stroke: var(--sol-blue);
      filter: drop-shadow(0 0 5px rgba(var(--sol-blue-rgb), 0.6));
    }
    
    /* Grille d'octets */
    .ui-byte-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    @media (max-width: 1200px) {
      .ui-byte-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 600px) {
      .ui-byte-grid {
        grid-template-columns: 1fr;
      }
    }
    .ui-byte-box {
      background: var(--sol-base02);
      border: 1.5px solid rgba(var(--sol-base1-rgb), 0.12);
      border-radius: 10px;
      padding: 12px;
      transition: all 0.3s ease;
    }
    .ui-byte-box.is-active {
      border-color: rgba(var(--sol-blue-rgb), 0.4);
      box-shadow: inset 0 0 10px rgba(var(--sol-blue-rgb), 0.05);
    }
    .ui-byte-header {
      font-size: 0.75em;
      font-weight: 800;
      font-family: var(--font-code);
      color: var(--sol-base1);
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
    }
    .ui-bit-row {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 4px;
    }
    .ui-bit-cell {
      background: #02161b;
      border: 1px solid var(--sol-base01);
      color: var(--sol-base01);
      border-radius: 4px;
      text-align: center;
      padding: 6px 0;
      font-size: 0.8em;
      font-family: var(--font-code);
      font-weight: bold;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
    }
    
    /* Codes de couleurs des bits */
    .ui-bit-cell.is-active-bool {
      background: var(--sol-blue);
      color: var(--sol-base3);
      border-color: var(--sol-blue);
      box-shadow: 0 0 8px rgba(var(--sol-blue-rgb), 0.5);
    }
    .ui-bit-cell.is-active-int {
      background: var(--sol-green);
      color: var(--sol-base3);
      border-color: var(--sol-green);
      box-shadow: 0 0 8px rgba(var(--sol-green-rgb), 0.5);
    }
    .ui-bit-cell.is-sign {
      background: #dc322f;
      color: var(--sol-base3);
      border-color: #dc322f;
      box-shadow: 0 0 8px rgba(220, 50, 47, 0.5);
    }
    .ui-bit-cell.is-exponent {
      background: #b58900;
      color: var(--sol-base3);
      border-color: #b58900;
      box-shadow: 0 0 8px rgba(181, 137, 0, 0.5);
    }
    .ui-bit-cell.is-mantissa {
      background: #2aa198;
      color: var(--sol-base3);
      border-color: #2aa198;
      box-shadow: 0 0 8px rgba(42, 161, 152, 0.5);
    }
    .ui-bit-cell.is-active-utf8 {
      background: #d33682;
      color: var(--sol-base3);
      border-color: #d33682;
      box-shadow: 0 0 8px rgba(211, 54, 130, 0.5);
    }
    
    /* Panel d'explications */
    .ui-ram-explanation {
      background: rgba(var(--sol-blue-rgb), 0.05);
      border-left: 5px solid var(--sol-blue);
      border-radius: 0 8px 8px 0;
      padding: 16px 20px;
      font-size: 0.9em;
      line-height: 1.5;
    }
    .ui-ram-exp-title {
      font-family: var(--font-code);
      font-weight: 800;
      color: var(--sol-blue);
      margin-bottom: 8px;
      text-transform: uppercase;
      font-size: 1em;
    }
    .ui-ram-legend {
      display: flex;
      gap: 15px;
      margin-bottom: 12px;
      flex-wrap: wrap;
      font-size: 0.75em;
      font-family: var(--font-code);
    }
    .ui-legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .ui-legend-color {
      width: 12px;
      height: 12px;
      border-radius: 3px;
    }
  `;
  container.appendChild(styleEl);

  // Construction de la structure DOM
  const ramCard = document.createElement("div");
  ramCard.className = "ui-ram-container";
  container.appendChild(ramCard);

  // Sélecteur interactif
  const selector = document.createElement("div");
  selector.className = "ui-ram-selector";
  selector.innerHTML = `
    <button class="ui-ram-tab is-active" data-type="bool">🔌 Booléen (True)</button>
    <button class="ui-ram-tab" data-type="int">🧮 Entier (42)</button>
    <button class="ui-ram-tab" data-type="float">📐 Flottant (3.14)</button>
    <button class="ui-ram-tab" data-type="utf8">🕵️ Texte (Emoji UTF-8)</button>
    <button class="ui-ram-tab" data-type="date_str">📅 Date Texte</button>
    <button class="ui-ram-tab" data-type="timestamp">⏳ Timestamp</button>
    <button class="ui-ram-tab" data-type="blob">💾 Fichier / BLOB</button>
  `;
  ramCard.appendChild(selector);

  // SVG de la barrette de RAM
  // Largeur 680, Hauteur 80
  const ramStickSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  ramStickSvg.setAttribute("class", "ui-ram-stick-svg");
  ramStickSvg.setAttribute("viewBox", "0 0 680 80");
  
  // Rendu de la barrette de RAM (PCB Vert sombre, Puces, Broches dorées)
  let pinsHtml = "";
  for (let i = 0; i < 120; i++) {
    const x = 12 + i * 5.5;
    pinsHtml += `<rect class="ram-pin" id="pin-${i}" x="${x}" y="70" width="3" height="8" rx="0.5" />`;
  }
  
  ramStickSvg.innerHTML = `
    <!-- Carte PCB de la RAM -->
    <rect x="5" y="5" width="670" height="70" rx="6" fill="#0c3c26" stroke="#062215" stroke-width="2" />
    
    <!-- Trous de montage et détails PCB -->
    <circle cx="15" cy="40" r="4" fill="none" stroke="#555" stroke-width="1.5" />
    <circle cx="665" cy="40" r="4" fill="none" stroke="#555" stroke-width="1.5" />
    <rect x="335" y="5" width="10" height="35" fill="#062215" /> <!-- Détrompeur central -->
    
    <!-- Circuits imprimés dorés décoratifs -->
    <path d="M 30,10 L 60,10 L 70,25 L 120,25" fill="none" stroke="#a5bd0c" stroke-width="0.8" opacity="0.15" />
    <path d="M 650,10 L 620,10 L 610,25 L 560,25" fill="none" stroke="#a5bd0c" stroke-width="0.8" opacity="0.15" />
    
    <!-- Puces de stockage DRAM (8 Chips) -->
    <rect class="ram-chip" id="chip-0" x="40" y="15" width="55" height="42" rx="3" />
    <rect class="ram-chip" id="chip-1" x="110" y="15" width="55" height="42" rx="3" />
    <rect class="ram-chip" id="chip-2" x="180" y="15" width="55" height="42" rx="3" />
    <rect class="ram-chip" id="chip-3" x="250" y="15" width="55" height="42" rx="3" />
    
    <rect class="ram-chip" id="chip-4" x="375" y="15" width="55" height="42" rx="3" />
    <rect class="ram-chip" id="chip-5" x="445" y="15" width="55" height="42" rx="3" />
    <rect class="ram-chip" id="chip-6" x="515" y="15" width="55" height="42" rx="3" />
    <rect class="ram-chip" id="chip-7" x="585" y="15" width="55" height="42" rx="3" />
    
    <!-- Encoches de fixation latérales -->
    <path d="M 5,30 L 10,35 L 10,45 L 5,50 Z" fill="#062215" />
    <path d="M 675,30 L 670,35 L 670,45 L 675,50 Z" fill="#062215" />
    
    <!-- Golden Pins -->
    <g>${pinsHtml}</g>
  `;
  ramCard.appendChild(ramStickSvg);

  // Grille d'affichage des octets (8 boîtes de 1 octet)
  const grid = document.createElement("div");
  grid.className = "ui-byte-grid";
  ramCard.appendChild(grid);

  for (let i = 0; i < 8; i++) {
    const byteBox = document.createElement("div");
    byteBox.className = "ui-byte-box";
    byteBox.id = `byte-box-${i}`;
    
    byteBox.innerHTML = `
      <div class="ui-byte-header">
        <span>Octet ${i} (Byte ${i})</span>
        <span class="byte-hex" id="byte-hex-${i}">0x00</span>
      </div>
      <div class="ui-bit-row" id="bit-row-${i}">
        <!-- 8 bits -->
        <div class="ui-bit-cell" id="bit-${i}-0">0</div>
        <div class="ui-bit-cell" id="bit-${i}-1">0</div>
        <div class="ui-bit-cell" id="bit-${i}-2">0</div>
        <div class="ui-bit-cell" id="bit-${i}-3">0</div>
        <div class="ui-bit-cell" id="bit-${i}-4">0</div>
        <div class="ui-bit-cell" id="bit-${i}-5">0</div>
        <div class="ui-bit-cell" id="bit-${i}-6">0</div>
        <div class="ui-bit-cell" id="bit-${i}-7">0</div>
      </div>
    `;
    grid.appendChild(byteBox);
  }

  // Section Légende facultative (mise à jour dynamique)
  const legend = document.createElement("div");
  legend.className = "ui-ram-legend";
  ramCard.appendChild(legend);

  // Section Explications explicatives
  const expPanel = document.createElement("div");
  expPanel.className = "ui-ram-explanation";
  expPanel.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:10px;">
      <div class="ui-ram-exp-title" id="exp-title" style="margin-bottom:0;">Titre</div>
      <div id="exp-human-value" style="font-family:var(--font-code); font-size:0.85em; background:rgba(var(--sol-blue-rgb), 0.1); color:var(--sol-blue); padding:4px 12px; border-radius:15px; font-weight:bold;">Valeur humaine : -</div>
    </div>
    <div id="exp-body">Contenu des explications sur le typage de la donnée physique.</div>
  `;
  ramCard.appendChild(expPanel);

  // Définition des représentations physiques des types
  const dataSpecs = {
    bool: {
      title: "Booléen",
      humanValue: "True (Vrai)",
      legend: `
        <div class="ui-legend-item"><div class="ui-legend-color" style="background:var(--sol-blue);"></div><span>Valeur logique active (1 octet)</span></div>
        <div class="ui-legend-item"><div class="ui-legend-color" style="background:#555;"></div><span>Bits inutilisés (Remplissage / Padding)</span></div>
      `,
      body: "<strong>Taille en RAM : 1 octet (8 bits).</strong> Pour des raisons d'alignement matériel, le CPU lit la mémoire par blocs d'octets entiers. Par conséquent, un simple booléen occupant théoriquement 1 seul bit consomme physiquement 8 bits (1 octet). Les 7 premiers bits sont ignorés (Padding), tandis que le dernier bit représente l'état logique : <code>1</code> pour <code>True</code>, <code>0</code> pour <code>False</code>.",
      activeBytes: [0],
      activeChips: [0],
      activePins: { start: 0, end: 15 },
      hexValues: ["0x01", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00"],
      bitsValues: {
        0: [0, 0, 0, 0, 0, 0, 0, 1]
      },
      bitsClasses: {
        0: Array(7).fill("").concat(["is-active-bool"])
      }
    },
    int: {
      title: "Entier Signé (int32)",
      humanValue: "42",
      legend: `
        <div class="ui-legend-item"><div class="ui-legend-color" style="background:var(--sol-green);"></div><span>Bits de l'entier encodé (Complément à deux)</span></div>
        <div class="ui-legend-item"><div class="ui-legend-color" style="background:#dc322f;"></div><span>Bit de Signe (0 = Positif, 1 = Négatif)</span></div>
      `,
      body: "<strong>Taille en RAM : 4 octets (32 bits).</strong> Les entiers sont stockés au format <em>Complément à deux</em>. Le tout premier bit de gauche (bit de poids fort) sert d'indicateur de signe (<code>0</code> pour positif, <code>1</code> pour négatif). Le chiffre 42 s'écrit en binaire <code>101010</code>. Il est stocké dans les bits de poids faible de l'octet 3, tandis que les octets de poids fort restent vides.",
      activeBytes: [0, 1, 2, 3],
      activeChips: [0, 1, 2, 3],
      activePins: { start: 0, end: 60 },
      hexValues: ["0x00", "0x00", "0x00", "0x2A", "0x00", "0x00", "0x00", "0x00"],
      bitsValues: {
        0: [0, 0, 0, 0, 0, 0, 0, 0],
        1: [0, 0, 0, 0, 0, 0, 0, 0],
        2: [0, 0, 0, 0, 0, 0, 0, 0],
        3: [0, 0, 1, 0, 1, 0, 1, 0]
      },
      bitsClasses: {
        0: ["is-sign"].concat(Array(7).fill("is-active-int")),
        1: Array(8).fill("is-active-int"),
        2: Array(8).fill("is-active-int"),
        3: Array(8).fill("is-active-int")
      }
    },
    float: {
      title: "Flottant (float32)",
      humanValue: "3.14",
      legend: `
        <div class="ui-legend-item"><div class="ui-legend-color" style="background:#dc322f;"></div><span>Signe (1 bit)</span></div>
        <div class="ui-legend-item"><div class="ui-legend-color" style="background:#b58900;"></div><span>Exposant (8 bits)</span></div>
        <div class="ui-legend-item"><div class="ui-legend-color" style="background:#2aa198;"></div><span>Mantisse (23 bits)</span></div>
      `,
      body: "<strong>Taille en RAM : 4 octets (32 bits) - Norme IEEE 754.</strong> Un nombre réel est représenté de manière scientifique sous la forme $S \\cdot M \\cdot 2^{E}$. <br/>*   <strong>Signe (Bit 0) :</strong> <code>0</code> (Positif).<br/>*   <strong>Exposant (Bits 1-8) :</strong> <code>10000000</code> ($128$ en base 10, soit $128 - 127 = 1$ en exposant réel décalé).<br/>*   <strong>Mantisse (Bits 9-31) :</strong> <code>10010001111010111000010</code> représentant la précision fractionnaire du nombre.",
      activeBytes: [0, 1, 2, 3],
      activeChips: [0, 1, 2, 3],
      activePins: { start: 0, end: 60 },
      hexValues: ["0x40", "0x48", "0xF5", "0xC3", "0x00", "0x00", "0x00", "0x00"],
      bitsValues: {
        0: [0, 1, 0, 0, 0, 0, 0, 0],
        1: [0, 1, 0, 0, 1, 0, 0, 0],
        2: [1, 1, 1, 1, 0, 1, 0, 1],
        3: [1, 1, 0, 0, 0, 0, 1, 1]
      },
      bitsClasses: {
        0: ["is-sign"].concat(Array(7).fill("is-exponent")),
        1: ["is-exponent"].concat(Array(7).fill("is-mantissa")),
        2: Array(8).fill("is-mantissa"),
        3: Array(8).fill("is-mantissa")
      }
    },
    utf8: {
      title: "Texte Émoji (UTF-8)",
      humanValue: "🕵️ (Detective)",
      legend: `
        <div class="ui-legend-item"><div class="ui-legend-color" style="background:#d33682;"></div><span>Octets de l'encodage variable UTF-8</span></div>
      `,
      body: "<strong>Taille en RAM : 4 octets (32 bits).</strong> En encodage standard moderne <strong>UTF-8</strong>, les caractères occidentaux de base (ASCII) consomment 1 seul octet. Les émojis complexes ou certains caractères spéciaux requièrent quant à eux jusqu'à 4 octets. L'émoji 🕵️ s'écrit physiquement sous forme d'une suite hexadécimale brute : <code>0xF0 0x9F 0x95 0x99</code>, occupant instantanément 4 octets de notre plan mémoire en RAM !",
      activeBytes: [0, 1, 2, 3],
      activeChips: [0, 1, 2, 3],
      activePins: { start: 0, end: 60 },
      hexValues: ["0xF0", "0x9F", "0x95", "0x99", "0x00", "0x00", "0x00", "0x00"],
      bitsValues: {
        0: [1, 1, 1, 1, 0, 0, 0, 0],
        1: [1, 0, 0, 1, 1, 1, 1, 1],
        2: [1, 0, 0, 1, 0, 1, 0, 1],
        3: [1, 0, 0, 1, 1, 0, 0, 1]
      },
      bitsClasses: {
        0: Array(8).fill("is-active-utf8"),
        1: Array(8).fill("is-active-utf8"),
        2: Array(8).fill("is-active-utf8"),
        3: Array(8).fill("is-active-utf8")
      }
    },
    date_str: {
      title: "Date (Format chaîne / texte)",
      humanValue: "\"20260519\"",
      legend: `
        <div class="ui-legend-item"><div class="ui-legend-color" style="background:var(--sol-blue);"></div><span>Octets contenant un caractère de la date (1 octet/char)</span></div>
      `,
      body: "<strong>Taille en RAM : 8 octets (64 bits).</strong> Représenter une date sous forme de chaîne de caractères brute (ex : <code>\"20260519\"</code>) nécessite 1 octet par caractère en encodage ASCII/UTF-8. Chaque caractère est converti en son code numérique correspondant (ex : <code>'2'</code> vaut <code>0x32</code>, soit <code>50</code> en base 10). C'est un format facile à lire, mais inefficace pour effectuer des calculs de durées ou d'intervalles.",
      activeBytes: [0, 1, 2, 3, 4, 5, 6, 7],
      activeChips: [0, 1, 2, 3, 4, 5, 6, 7],
      activePins: { start: 0, end: 119 },
      hexValues: ["0x32", "0x30", "0x32", "0x36", "0x30", "0x35", "0x31", "0x39"],
      bitsValues: {
        0: [0, 0, 1, 1, 0, 0, 1, 0],
        1: [0, 0, 1, 1, 0, 0, 0, 0],
        2: [0, 0, 1, 1, 0, 0, 1, 0],
        3: [0, 0, 1, 1, 0, 1, 1, 0],
        4: [0, 0, 1, 1, 0, 0, 0, 0],
        5: [0, 0, 1, 1, 0, 1, 0, 1],
        6: [0, 0, 1, 1, 0, 0, 0, 1],
        7: [0, 0, 1, 1, 1, 0, 0, 1]
      },
      bitsClasses: {
        0: Array(8).fill("is-active-bool"),
        1: Array(8).fill("is-active-bool"),
        2: Array(8).fill("is-active-bool"),
        3: Array(8).fill("is-active-bool"),
        4: Array(8).fill("is-active-bool"),
        5: Array(8).fill("is-active-bool"),
        6: Array(8).fill("is-active-bool"),
        7: Array(8).fill("is-active-bool")
      }
    },
    timestamp: {
      title: "Date (Format Timestamp Unix int64)",
      humanValue: "2026-05-19 00:00:00 UTC (1779072000)",
      legend: `
        <div class="ui-legend-item"><div class="ui-legend-color" style="background:var(--sol-green);"></div><span>Entier 64 bits signé (Timestamp UNIX)</span></div>
      `,
      body: "<strong>Taille en RAM : 8 octets (64 bits - int64).</strong> Représenter une date sous forme de <strong>Timestamp UNIX</strong> consiste à stocker un unique nombre entier correspondant au nombre de secondes écoulées depuis le 1er janvier 1970 à minuit UTC. La valeur <code>1779072000</code> correspond précisément au 19 mai 2026. Cette représentation sur 64 bits est extrêmement performante en calcul, prend peu de place et élimine définitivement le bug de l'an 2038 (Y2K38).",
      activeBytes: [0, 1, 2, 3, 4, 5, 6, 7],
      activeChips: [0, 1, 2, 3, 4, 5, 6, 7],
      activePins: { start: 0, end: 119 },
      hexValues: ["0x00", "0x00", "0x00", "0x00", "0x6A", "0x0A", "0x9C", "0x00"],
      bitsValues: {
        0: [0, 0, 0, 0, 0, 0, 0, 0],
        1: [0, 0, 0, 0, 0, 0, 0, 0],
        2: [0, 0, 0, 0, 0, 0, 0, 0],
        3: [0, 0, 0, 0, 0, 0, 0, 0],
        4: [0, 1, 1, 0, 1, 0, 1, 0],
        5: [0, 0, 0, 0, 1, 0, 1, 0],
        6: [1, 0, 0, 1, 1, 1, 0, 0],
        7: [0, 0, 0, 0, 0, 0, 0, 0]
      },
      bitsClasses: {
        0: Array(8).fill("is-active-int"),
        1: Array(8).fill("is-active-int"),
        2: Array(8).fill("is-active-int"),
        3: Array(8).fill("is-active-int"),
        4: Array(8).fill("is-active-int"),
        5: Array(8).fill("is-active-int"),
        6: Array(8).fill("is-active-int"),
        7: Array(8).fill("is-active-int")
      }
    },
    blob: {
      title: "Fichier / Objet Binaire (BLOB PNG)",
      humanValue: "Signature de fichier image PNG (8 octets)",
      legend: `
        <div class="ui-legend-item"><div class="ui-legend-color" style="background:#d33682;"></div><span>Octets bruts du fichier binaire (BLOB)</span></div>
      `,
      body: "<strong>Taille en RAM : Variable (8 octets ici).</strong> Un BLOB (<em>Binary Large Object</em>) représente un fichier ou flux de données brutes non structurées (comme une image, une empreinte digitale ou du son). La machine ne cherche pas à interpréter ces octets sous forme de texte ou de nombre mathématique, elle les stocke et les transmet de façon brute. Ici, la signature magique des 8 premiers octets identifie de manière universelle un fichier image <strong>PNG</strong>.",
      activeBytes: [0, 1, 2, 3, 4, 5, 6, 7],
      activeChips: [0, 1, 2, 3, 4, 5, 6, 7],
      activePins: { start: 0, end: 119 },
      hexValues: ["0x89", "0x50", "0x4E", "0x47", "0x0D", "0x0A", "0x1A", "0x0A"],
      bitsValues: {
        0: [1, 0, 0, 0, 1, 0, 0, 1],
        1: [0, 1, 0, 1, 0, 0, 0, 0],
        2: [0, 1, 0, 0, 1, 1, 1, 0],
        3: [0, 1, 0, 0, 0, 1, 1, 1],
        4: [0, 0, 0, 0, 1, 1, 0, 1],
        5: [0, 0, 0, 0, 1, 0, 1, 0],
        6: [0, 0, 0, 1, 1, 0, 1, 0],
        7: [0, 0, 0, 0, 1, 0, 1, 0]
      },
      bitsClasses: {
        0: Array(8).fill("is-active-utf8"),
        1: Array(8).fill("is-active-utf8"),
        2: Array(8).fill("is-active-utf8"),
        3: Array(8).fill("is-active-utf8"),
        4: Array(8).fill("is-active-utf8"),
        5: Array(8).fill("is-active-utf8"),
        6: Array(8).fill("is-active-utf8"),
        7: Array(8).fill("is-active-utf8")
      }
    }
  };

  const updateVisualization = (type) => {
    const spec = dataSpecs[type];
    if (!spec) return;

    // 1. Mettre à jour les explications et la légende
    ramCard.querySelector("#exp-title").innerText = spec.title;
    ramCard.querySelector("#exp-human-value").innerHTML = `Valeur humaine : <span style="color:var(--sol-base0);">${spec.humanValue}</span>`;
    ramCard.querySelector("#exp-body").innerHTML = spec.body;
    legend.innerHTML = spec.legend;

    // 2. Mettre à jour l'apparence des puces et pins de la RAM
    ramCard.querySelectorAll(".ram-chip").forEach((chip, i) => {
      if (spec.activeChips.includes(i)) {
        chip.classList.add("is-active");
      } else {
        chip.classList.remove("is-active");
      }
    });

    ramCard.querySelectorAll(".ram-pin").forEach((pin, i) => {
      if (i >= spec.activePins.start && i <= spec.activePins.end) {
        pin.classList.add("is-active");
      } else {
        pin.classList.remove("is-active");
      }
    });

    // 3. Remplir la grille d'octets et de bits
    for (let byteIdx = 0; byteIdx < 8; byteIdx++) {
      const byteBox = ramCard.querySelector(`#byte-box-${byteIdx}`);
      const hexSpan = ramCard.querySelector(`#byte-hex-${byteIdx}`);
      
      const isActiveByte = spec.activeBytes.includes(byteIdx);
      if (isActiveByte) {
        byteBox.classList.add("is-active");
      } else {
        byteBox.classList.remove("is-active");
      }

      hexSpan.innerText = spec.hexValues[byteIdx];

      // Mettre à jour chacun des 8 bits
      const bitRow = ramCard.querySelector(`#bit-row-${byteIdx}`);
      for (let bitIdx = 0; bitIdx < 8; bitIdx++) {
        const bitCell = bitRow.querySelector(`#bit-${byteIdx}-${bitIdx}`);
        
        // Valeur par défaut si non spécifié
        let bitVal = 0;
        if (isActiveByte && spec.bitsValues[byteIdx]) {
          bitVal = spec.bitsValues[byteIdx][bitIdx];
        }
        bitCell.innerText = bitVal;

        // Classe CSS par défaut
        bitCell.className = "ui-bit-cell";
        if (isActiveByte && spec.bitsClasses[byteIdx]) {
          const bitClass = spec.bitsClasses[byteIdx][bitIdx];
          if (bitClass) bitCell.classList.add(bitClass);
        }
      }
    }
  };

  // Ajout des listeners sur les onglets
  const tabs = selector.querySelectorAll(".ui-ram-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      updateVisualization(tab.getAttribute("data-type"));
    });
  });

  // Initialisation par défaut
  updateVisualization("bool");

  return container;
};



/**
 * ⚡ Visualiseur interactif d'architecture matérielle (Motherboard & CPU cores zoom)
 */
export const motherboardArchitectureVisualizer = () => {
  const container = document.createElement("div");
  container.className = "ui-mb-visualizer";

  // Style CSS localisé pour le widget de la carte mère
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .ui-mb-container {
      background: var(--sol-base03);
      color: var(--sol-base0);
      border: 1px solid var(--sol-base02);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 25px;
      font-family: var(--font-sans);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }
    .ui-mb-title-main {
      font-family: var(--font-code);
      font-weight: 800;
      color: var(--sol-blue);
      font-size: 1.1em;
      margin-bottom: 18px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      padding-bottom: 8px;
    }
    .ui-mb-layout {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 24px;
    }
    @media (max-width: 900px) {
      .ui-mb-layout {
        grid-template-columns: 1fr;
      }
    }
    
    /* Côté gauche : La carte mère interactive */
    .ui-mb-board-wrapper {
      background: #00151a;
      border-radius: 10px;
      padding: 16px;
      border: 1px solid rgba(var(--sol-base1-rgb), 0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }
    .ui-mb-board-title {
      font-family: var(--font-code);
      font-size: 0.8em;
      color: var(--sol-base1);
      margin-bottom: 12px;
      text-transform: uppercase;
      font-weight: bold;
    }
    
    /* Animation des traces de flux de données */
    @keyframes dataFlowPulse {
      to {
        stroke-dashoffset: -60;
      }
    }
    .data-pulse {
      animation: dataFlowPulse 2.5s linear infinite;
    }
    
    /* Composants cliquables sur la carte */
    .mb-comp {
      transition: all 0.3s ease;
    }
    .mb-comp:hover rect {
      fill: #002b36 !important;
      filter: drop-shadow(0 0 6px var(--sol-blue));
    }
    .mb-comp.is-active rect {
      fill: #002b36 !important;
      stroke-width: 2.5px !important;
    }
    .mb-comp.is-active#comp-cpu rect {
      stroke: var(--sol-magenta) !important;
      filter: drop-shadow(0 0 10px rgba(211, 54, 130, 0.4));
    }
    .mb-comp.is-active#comp-l3 rect {
      stroke: var(--sol-orange) !important;
      filter: drop-shadow(0 0 10px rgba(203, 75, 22, 0.4));
    }
    .mb-comp.is-active#comp-ram rect {
      stroke: var(--sol-cyan) !important;
      filter: drop-shadow(0 0 10px rgba(42, 161, 152, 0.4));
    }
    .mb-comp.is-active#comp-ssd rect {
      stroke: var(--sol-green) !important;
      filter: drop-shadow(0 0 10px rgba(133, 153, 0, 0.4));
    }
    
    /* Côté droit : Contrôleur de compromis & Échelle de couleur */
    .ui-mb-control-panel {
      background: var(--sol-base02);
      border-radius: 10px;
      padding: 20px;
      border: 1px solid rgba(var(--sol-base1-rgb), 0.1);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 380px;
    }
    .ui-mb-btn-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 20px;
    }
    .ui-mb-tab-btn {
      background: var(--sol-base03);
      border: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      color: var(--sol-base1);
      padding: 10px 14px;
      border-radius: 6px;
      cursor: pointer;
      text-align: left;
      font-size: 0.85em;
      font-family: var(--font-code);
      font-weight: 700;
      transition: all 0.25s ease;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .ui-mb-tab-btn:hover {
      border-color: var(--sol-blue);
      background: rgba(var(--sol-blue-rgb), 0.05);
    }
    .ui-mb-tab-btn.active-cpu {
      border-color: var(--sol-magenta);
      background: rgba(211, 54, 130, 0.1);
      color: var(--sol-magenta);
    }
    .ui-mb-tab-btn.active-l3 {
      border-color: var(--sol-orange);
      background: rgba(203, 75, 22, 0.1);
      color: var(--sol-orange);
    }
    .ui-mb-tab-btn.active-ram {
      border-color: var(--sol-cyan);
      background: rgba(42, 161, 152, 0.1);
      color: var(--sol-cyan);
    }
    .ui-mb-tab-btn.active-ssd {
      border-color: var(--sol-green);
      background: rgba(133, 153, 0, 0.1);
      color: var(--sol-green);
    }
    
    /* Indicateur LED de couleur pour la hiérarchie */
    .ui-mb-led {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
    }
    .led-cpu { background: var(--sol-magenta); box-shadow: 0 0 8px var(--sol-magenta); }
    .led-l3 { background: var(--sol-orange); box-shadow: 0 0 8px var(--sol-orange); }
    .led-ram { background: var(--sol-cyan); box-shadow: 0 0 8px var(--sol-cyan); }
    .led-ssd { background: var(--sol-green); box-shadow: 0 0 8px var(--sol-green); }
    
    /* Section Compromis : Gauges vitesse vs quantité */
    .ui-gauge-container {
      margin-top: 15px;
      background: rgba(var(--sol-base03-rgb), 0.4);
      padding: 14px;
      border-radius: 8px;
      border: 1px solid rgba(var(--sol-base1-rgb), 0.06);
    }
    .ui-gauge-title {
      font-size: 0.75em;
      text-transform: uppercase;
      font-weight: bold;
      letter-spacing: 0.5px;
      color: var(--sol-base1);
      margin-bottom: 10px;
      font-family: var(--font-code);
    }
    .ui-gauge-row {
      margin-bottom: 10px;
    }
    .ui-gauge-row:last-child {
      margin-bottom: 0;
    }
    .ui-gauge-label {
      font-size: 0.75em;
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
      font-family: var(--font-sans);
    }
    .ui-gauge-bar-bg {
      background: var(--sol-base03);
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid rgba(var(--sol-base1-rgb), 0.1);
    }
    .ui-gauge-bar-fill {
      height: 100%;
      width: 0%;
      border-radius: 4px;
      transition: width 0.6s cubic-bezier(0.1, 0.8, 0.2, 1);
    }
    
    /* Explication */
    .ui-mb-exp {
      font-size: 0.85em;
      line-height: 1.55;
      color: var(--sol-base0);
      margin-top: 15px;
    }
  `;
  container.appendChild(styleEl);

  const mbCard = document.createElement("div");
  mbCard.className = "ui-mb-container";
  container.appendChild(mbCard);

  // Titre principal
  const mainTitle = document.createElement("div");
  mainTitle.className = "ui-mb-title-main";
  mainTitle.innerText = "🔍 Simulateur : Anatomie Matérielle du Traitement de Données";
  mbCard.appendChild(mainTitle);

  // Structure Layout
  const layout = document.createElement("div");
  layout.className = "ui-mb-layout";
  mbCard.appendChild(layout);

  // Côté gauche : Carte mère interactive en SVG
  const boardWrapper = document.createElement("div");
  boardWrapper.className = "ui-mb-board-wrapper";
  boardWrapper.innerHTML = `
    <div class="ui-mb-board-title">Schéma matériel interactif de l'atelier informatique</div>
    <svg viewBox="0 0 400 350" style="width:100%; height:auto; background:#001e26; border-radius:8px; border:1.5px solid var(--sol-base02);">
      <!-- Circuit board lines (PCB Traces) -->
      <path d="M 50 300 L 220 300 L 220 230 L 150 230" stroke="#004d5a" stroke-width="2" fill="none" />
      <path d="M 330 180 L 220 180 L 220 130" stroke="#004d5a" stroke-width="2" fill="none" />
      <path d="M 120 155 L 120 200 L 180 200" stroke="#004d5a" stroke-width="1.5" fill="none" opacity="0.6" />
      
      <!-- Dynamic glowing data flows (glowing pulses) -->
      <path class="data-pulse" id="flow-ssd-ram" d="M 50 300 L 220 300 L 220 230 L 290 230 L 290 205" stroke="var(--sol-green)" stroke-width="2.5" fill="none" stroke-dasharray="8, 12" />
      <path class="data-pulse" id="flow-ram-cpu" d="M 290 50 L 290 25 L 150 25 L 150 40" stroke="var(--sol-cyan)" stroke-width="2.5" fill="none" stroke-dasharray="6, 10" />

      <!-- SSD NVMe M.2 Slot (Hot component to click) -->
      <g class="mb-comp" id="comp-ssd" style="cursor:pointer;">
        <rect x="30" y="280" width="120" height="35" rx="3" fill="#073642" stroke="var(--sol-green)" stroke-width="1.5" />
        <text x="90" y="301" fill="var(--sol-green)" font-family="monospace" font-size="9" text-anchor="middle" font-weight="bold">SSD NVMe (1-4 To)</text>
        <rect x="30" y="280" width="12" height="35" fill="var(--sol-green)" opacity="0.4" />
      </g>

      <!-- RAM Slots / Memory Sticks -->
      <g class="mb-comp" id="comp-ram" style="cursor:pointer;">
        <!-- DIMM Slot 1 -->
        <rect x="270" y="50" width="10" height="150" rx="1.5" fill="#073642" stroke="var(--sol-cyan)" stroke-width="1" />
        <!-- DIMM Slot 2 (Highlighted active) -->
        <rect x="285" y="50" width="10" height="150" rx="1.5" fill="#073642" stroke="var(--sol-cyan)" stroke-width="1.8" />
        <!-- DIMM Slot 3 -->
        <rect x="300" y="50" width="10" height="150" rx="1.5" fill="#073642" stroke="var(--sol-cyan)" stroke-width="1" />
        <text x="291" y="125" fill="var(--sol-cyan)" font-family="monospace" font-size="9" text-anchor="middle" font-weight="bold" transform="rotate(-90, 291, 125)">RAM DRAM (16-64 Go)</text>
      </g>

      <!-- Main CPU socket -->
      <g class="mb-comp" id="comp-cpu" style="cursor:pointer;">
        <!-- CPU Case -->
        <rect x="60" y="40" width="150" height="150" rx="6" fill="#073642" stroke="var(--sol-blue)" stroke-width="2" />
        <rect x="70" y="50" width="130" height="130" rx="4" fill="#002b36" stroke="var(--sol-blue)" stroke-width="1" opacity="0.8" />
        
        <!-- Execution Cores (ALU + Registres + Cache L1/L2) -->
        <!-- Core 1 -->
        <g id="subcomp-core1">
          <rect x="78" y="58" width="54" height="42" rx="2" fill="#073642" stroke="var(--sol-magenta)" stroke-width="1.5" />
          <text x="105" y="80" fill="var(--sol-magenta)" font-family="monospace" font-size="8" text-anchor="middle" font-weight="bold">Cœur 1</text>
          <text x="105" y="90" fill="rgba(211,54,130,0.7)" font-family="monospace" font-size="6" text-anchor="middle">L1/L2 Cache</text>
        </g>
        <!-- Core 2 -->
        <g id="subcomp-core2">
          <rect x="138" y="58" width="54" height="42" rx="2" fill="#073642" stroke="var(--sol-magenta)" stroke-width="1.5" />
          <text x="165" y="80" fill="var(--sol-magenta)" font-family="monospace" font-size="8" text-anchor="middle" font-weight="bold">Cœur 2</text>
          <text x="165" y="90" fill="rgba(211,54,130,0.7)" font-family="monospace" font-size="6" text-anchor="middle">L1/L2 Cache</text>
        </g>
        <!-- Core 3 -->
        <g id="subcomp-core3">
          <rect x="78" y="106" width="54" height="42" rx="2" fill="#073642" stroke="var(--sol-magenta)" stroke-width="1.5" />
          <text x="105" y="128" fill="var(--sol-magenta)" font-family="monospace" font-size="8" text-anchor="middle" font-weight="bold">Cœur 3</text>
          <text x="105" y="138" fill="rgba(211,54,130,0.7)" font-family="monospace" font-size="6" text-anchor="middle">L1/L2 Cache</text>
        </g>
        <!-- Core 4 -->
        <g id="subcomp-core4">
          <rect x="138" y="106" width="54" height="42" rx="2" fill="#073642" stroke="var(--sol-magenta)" stroke-width="1.5" />
          <text x="165" y="128" fill="var(--sol-magenta)" font-family="monospace" font-size="8" text-anchor="middle" font-weight="bold">Cœur 4</text>
          <text x="165" y="138" fill="rgba(211,54,130,0.7)" font-family="monospace" font-size="6" text-anchor="middle">L1/L2 Cache</text>
        </g>
        
        <!-- Shared Cache L3 (Inner bottom cpu area) -->
        <g id="comp-l3" style="cursor:pointer;">
          <rect x="78" y="154" width="114" height="20" rx="2" fill="#073642" stroke="var(--sol-orange)" stroke-width="1.8" />
          <text x="135" y="167" fill="var(--sol-orange)" font-family="monospace" font-size="8" text-anchor="middle" font-weight="bold">CACHE L3 PARTAGÉ</text>
        </g>
      </g>
    </svg>
    <div style="font-size:0.7em; opacity:0.6; margin-top:8px; text-align:center;">💡 Cliquez sur les puces matérielles (CPU, Cœurs, L3, RAM, SSD) pour zoomer.</div>
  `;
  layout.appendChild(boardWrapper);

  // Côté droit : Contrôleur interactif
  const controlPanel = document.createElement("div");
  controlPanel.className = "ui-mb-control-panel";
  controlPanel.innerHTML = `
    <div>
      <div class="ui-mb-btn-group">
        <button class="ui-mb-tab-btn active-cpu" id="btn-mb-cpu" data-comp="cpu">
          <span>🧠 1. CPU : Cœurs & Cache L1/L2 (SRAM)</span>
          <span class="ui-mb-led led-cpu"></span>
        </button>
        <button class="ui-mb-tab-btn" id="btn-mb-l3" data-comp="l3">
          <span>⚡ 2. Cache L3 Partagé (SRAM intermédiaire)</span>
          <span class="ui-mb-led led-l3"></span>
        </button>
        <button class="ui-mb-tab-btn" id="btn-mb-ram" data-comp="ram">
          <span>📊 3. Mémoire RAM (DRAM Volatile)</span>
          <span class="ui-mb-led led-ram"></span>
        </button>
        <button class="ui-mb-tab-btn" id="btn-mb-ssd" data-comp="ssd">
          <span>💾 4. Stockage SSD (NAND NVMe PCIe)</span>
          <span class="ui-mb-led led-ssd"></span>
        </button>
      </div>

      <!-- Gauges de compromis vitesse/quantité -->
      <div class="ui-gauge-container">
        <div class="ui-gauge-title">⚙️ Compromis Physique (Matériel)</div>
        <div class="ui-gauge-row">
          <div class="ui-gauge-label">
            <span>🚀 Vitesse d'accès (Latence)</span>
            <span id="gauge-speed-val" style="font-weight:bold;">100%</span>
          </div>
          <div class="ui-gauge-bar-bg">
            <div class="ui-gauge-bar-fill" id="gauge-speed-bar"></div>
          </div>
        </div>
        <div class="ui-gauge-row">
          <div class="ui-gauge-label">
            <span>📦 Capacité globale (Volume)</span>
            <span id="gauge-capacity-val" style="font-weight:bold;">100%</span>
          </div>
          <div class="ui-gauge-bar-bg">
            <div class="ui-gauge-bar-fill" id="gauge-capacity-bar"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Description technique et explications -->
    <div class="ui-mb-exp" id="mb-exp-text">Sélectionnez un composant.</div>
  `;
  layout.appendChild(controlPanel);

  // Spécifications de la hiérarchie pour chaque composant
  const specs = {
    cpu: {
      title: "CPU : Cœurs & Cache L1/L2",
      activeId: "comp-cpu",
      speedPct: 98,
      speedText: "🚀 Ultra-Rapide (< 1 ns)",
      capacityPct: 2,
      capacityText: "Microscopique (Ko)",
      color: "var(--sol-magenta)",
      exp: "<strong>Les Cœurs et les Caches L1/L2 sont en première ligne.</strong> Les données immédiates sont traitées dans les registres physiques du CPU à la vitesse de l'horloge. Le Cache L1 et L2 (SRAM de quelques Ko dédiée à chaque cœur) contient les boucles de calcul et les pointeurs les plus actifs. <br/><em>Impact en Data Science :</em> C'est ici que s'effectuent toutes vos multiplications matricielles d'IA à l'échelle du microprocesseur. Si la donnée est là, le calcul est instantané !"
    },
    l3: {
      title: "Cache L3 Partagé",
      activeId: "comp-l3",
      speedPct: 75,
      speedText: "⚡ Très Rapide (10 ns)",
      capacityPct: 8,
      capacityText: "Très Petite (Mo)",
      color: "var(--sol-orange)",
      exp: "<strong>Le Cache L3 sert de tampon partagé entre tous les cœurs du CPU.</strong> Faisant office d'intermédiaire entre la RAM et les cœurs individuels, il permet d'éviter l'attente du bus mémoire système. <br/><em>Impact en Data Science :</em> Crucial lors du traitement de tableaux vectoriels contigus (comme les arrays NumPy). C'est ce cache intermédiaire qui fluidifie le traitement des sous-blocs de données répartis entre plusieurs cœurs en parallèle."
    },
    ram: {
      title: "Mémoire Vive RAM",
      activeId: "comp-ram",
      speedPct: 40,
      speedText: "📊 Modéré (100 ns)",
      capacityPct: 60,
      capacityText: "Moyenne (Go)",
      color: "var(--sol-cyan)",
      exp: "<strong>La RAM (DRAM volatile) est l'établi actif de votre science des données.</strong> Toutes vos variables, structures, et DataFrames Pandas actifs y résident. L'accès y est rapide mais nécessite de traverser le bus de carte mère, ce qui est 200 fois plus lent que les registres CPU.<br/><em>Impact en Data Science :</em> C'est la limite physique absolue de vos scripts Pandas standards (eager evaluation). Si un dataset brut de 10 Go est chargé et copié durant un calcul, la mémoire sature, entraînant un crash système immédiat."
    },
    ssd: {
      title: "Stockage de masse SSD (NVMe)",
      activeId: "comp-ssd",
      speedPct: 3,
      speedText: "🐌 Très Lent (50 000 ns)",
      capacityPct: 98,
      capacityText: "Gigantesque (To)",
      color: "var(--sol-green)",
      exp: "<strong>Le SSD NVMe (NAND flash persistant) est votre bibliothèque.</strong> C'est ici que vos gros fichiers de données (CSV, Parquet, JSON) sont archivés à long terme. Bien que branché en PCIe direct ultra-rapide, sa vitesse d'accès physique en lecture reste un escargot à l'échelle de la vitesse du processeur (50 000 fois plus lente que le cache L1).<br/><em>Impact en Data Science :</em> C'est le goulot d'étranglement n°1 d'un pipeline d'ingestion. Le chargement d'un fichier brut CSV depuis le SSD est ce qui prend 99% du temps dans vos scripts."
    }
  };

  // Logique d'activation
  const activateComponent = (compId) => {
    // 1. Gérer l'état actif des boutons
    const buttons = controlPanel.querySelectorAll(".ui-mb-tab-btn");
    buttons.forEach(btn => {
      btn.classList.remove("active-cpu", "active-l3", "active-ram", "active-ssd");
    });
    
    const activeBtn = controlPanel.querySelector(`#btn-mb-${compId}`);
    if (activeBtn) {
      activeBtn.classList.add(`active-${compId}`);
    }

    // 2. Gérer la surbrillance sur le SVG
    const svgComps = boardWrapper.querySelectorAll(".mb-comp");
    svgComps.forEach(comp => comp.classList.remove("is-active"));
    
    const spec = specs[compId];
    if (spec) {
      const svgActive = boardWrapper.querySelector(`#${spec.activeId}`);
      if (svgActive) {
        svgActive.classList.add("is-active");
      }

      // 3. Mettre à jour les gauges vitesse vs quantité
      const speedBar = controlPanel.querySelector("#gauge-speed-bar");
      const speedVal = controlPanel.querySelector("#gauge-speed-val");
      const capacityBar = controlPanel.querySelector("#gauge-capacity-bar");
      const capacityVal = controlPanel.querySelector("#gauge-capacity-val");
      const expText = controlPanel.querySelector("#mb-exp-text");

      // Appliquer les taux
      speedBar.style.width = `${spec.speedPct}%`;
      speedBar.style.backgroundColor = spec.color;
      speedVal.innerText = spec.speedText;
      speedVal.style.color = spec.color;

      capacityBar.style.width = `${spec.capacityPct}%`;
      capacityBar.style.backgroundColor = spec.color;
      capacityVal.innerText = spec.capacityText;
      capacityVal.style.color = spec.color;

      // Charger le texte explicatif
      expText.innerHTML = `<span style="color:${spec.color}; font-weight:bold; font-size:1.1em; display:block; margin-bottom:8px;">${spec.title}</span>` + spec.exp;
    }
  };

  // Liaison événements : Clic sur les boutons de commande
  const buttons = controlPanel.querySelectorAll(".ui-mb-tab-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const compId = btn.getAttribute("data-comp");
      activateComponent(compId);
    });
  });

  // Liaison événements : Clic sur les formes du SVG de la carte mère
  const svgComps = boardWrapper.querySelectorAll(".mb-comp");
  svgComps.forEach(comp => {
    comp.addEventListener("click", (e) => {
      // Trouver quel composant a été cliqué
      const id = comp.getAttribute("id");
      if (id === "comp-ssd") activateComponent("ssd");
      else if (id === "comp-ram") activateComponent("ram");
      else if (id === "comp-cpu") {
        // Si clic sur le L3 interne du CPU
        const isL3 = e.target.closest("#comp-l3");
        if (isL3) {
          activateComponent("l3");
        } else {
          activateComponent("cpu");
        }
      }
    });
  });

  // Initialisation par défaut sur le CPU
  activateComponent("cpu");

  return container;
};

/**
 * 🧠 Simulateur CPU Cache : Assembleur, Registres, Pipeline, L1/L2 Cache & RAM
 */
export const cpuCacheSimulator = () => {
  const container = document.createElement("div");
  container.className = "ui-cpu-sim";

  // Styles CSS localisés
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .ui-cpu-container {
      background: var(--sol-base03);
      color: var(--sol-base0);
      border: 1px solid var(--sol-base02);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 25px;
      font-family: var(--font-sans);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }
    .ui-cpu-title-main {
      font-family: var(--font-code);
      font-weight: 800;
      color: var(--sol-blue);
      font-size: 1.1em;
      margin-bottom: 18px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      padding-bottom: 8px;
    }
    
    /* Layout à 3 colonnes : Assembleur | Matériel | Console & Gauges */
    .ui-cpu-layout {
      display: grid;
      grid-template-columns: 1.1fr 1.3fr 1.1fr;
      gap: 20px;
    }
    @media (max-width: 1000px) {
      .ui-cpu-layout {
        grid-template-columns: 1fr;
      }
    }
    
    /* Colonne 1 : Assembleur & Registres */
    .ui-cpu-card {
      background: var(--sol-base02);
      border: 1px solid rgba(var(--sol-base1-rgb), 0.08);
      border-radius: 8px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .ui-cpu-card-title {
      font-family: var(--font-code);
      font-size: 0.85em;
      color: var(--sol-base1);
      text-transform: uppercase;
      font-weight: bold;
      margin-bottom: 12px;
      border-bottom: 1px solid rgba(var(--sol-base1-rgb), 0.08);
      padding-bottom: 4px;
    }
    
    /* Code block Assembleur */
    .ui-asm-block {
      background: #02161b;
      border: 1px solid var(--sol-base01);
      border-radius: 6px;
      padding: 10px;
      font-family: var(--font-code);
      font-size: 0.8em;
      line-height: 1.6;
      margin-bottom: 16px;
    }
    .ui-asm-line {
      padding: 2px 6px;
      border-radius: 3px;
      color: var(--sol-base0);
      display: flex;
      gap: 10px;
      transition: all 0.25s ease;
    }
    .ui-asm-num {
      color: var(--sol-base01);
      width: 15px;
      text-align: right;
    }
    .ui-asm-active {
      background: rgba(181, 137, 0, 0.25);
      color: var(--sol-yellow);
      font-weight: bold;
      border-left: 3px solid var(--sol-yellow);
      padding-left: 3px;
    }
    
    /* Vue Registres */
    .ui-reg-block {
      background: #002b36;
      border-radius: 6px;
      padding: 10px;
      font-family: var(--font-code);
      font-size: 0.8em;
    }
    .ui-reg-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      border-bottom: 1px dashed rgba(var(--sol-base1-rgb), 0.05);
      padding-bottom: 4px;
    }
    .ui-reg-row:last-child {
      margin-bottom: 0;
      border-bottom: none;
      padding-bottom: 0;
    }
    
    /* Colonne 2 : Matériel (Cache L1/L2 et RAM) */
    .ui-hw-block {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .ui-cache-box, .ui-ram-box {
      background: #001e26;
      border: 1px solid rgba(var(--sol-base1-rgb), 0.1);
      border-radius: 8px;
      padding: 12px;
    }
    .ui-cache-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      margin-top: 8px;
    }
    .ui-cache-cell {
      background: #073642;
      border: 1px solid var(--sol-base01);
      border-radius: 4px;
      padding: 8px 4px;
      text-align: center;
      font-family: var(--font-code);
      font-size: 0.75em;
      color: var(--sol-base1);
      transition: all 0.3s ease;
    }
    .ui-cache-cell.is-cached {
      border-color: var(--sol-green);
      background: rgba(133, 153, 0, 0.15);
      color: var(--sol-green);
      font-weight: bold;
      box-shadow: 0 0 6px rgba(133, 153, 0, 0.2);
    }
    
    .ui-ram-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
      margin-top: 8px;
    }
    .ui-ram-cell {
      background: #02161b;
      border: 1px solid rgba(var(--sol-base1-rgb), 0.08);
      border-radius: 4px;
      padding: 6px 8px;
      font-family: var(--font-code);
      font-size: 0.75em;
      display: flex;
      justify-content: space-between;
      transition: all 0.3s ease;
    }
    .ui-ram-cell.is-reading {
      border-color: var(--sol-yellow);
      background: rgba(181, 137, 0, 0.1);
      color: var(--sol-yellow);
    }
    .ui-ram-cell.is-prefetched {
      border-color: var(--sol-cyan);
      background: rgba(42, 161, 152, 0.1);
      color: var(--sol-cyan);
    }
    
    /* Animation du bus de données */
    .ui-bus-animator {
      height: 12px;
      position: relative;
      background: #02161b;
      border-radius: 6px;
      border: 1px solid var(--sol-base01);
      overflow: hidden;
      margin: 4px 0;
    }
    .ui-bus-pulse {
      height: 100%;
      width: 25px;
      background: linear-gradient(90deg, transparent, var(--sol-yellow), transparent);
      position: absolute;
      left: -30px;
      border-radius: 4px;
    }
    .ui-bus-pulse.is-miss {
      background: linear-gradient(90deg, transparent, var(--sol-red), transparent);
      animation: busFlow 1.2s infinite linear;
    }
    .ui-bus-pulse.is-hit {
      background: linear-gradient(90deg, transparent, var(--sol-green), transparent);
      animation: busFlow 0.3s 1 linear;
    }
    @keyframes busFlow {
      0% { left: -30px; }
      100% { left: 100%; }
    }
    
    /* Colonne 3 : Performance & Contrôles */
    .ui-perf-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }
    .ui-perf-card {
      background: rgba(var(--sol-base03-rgb), 0.5);
      border: 1px solid rgba(var(--sol-base1-rgb), 0.05);
      padding: 10px 14px;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8em;
    }
    
    /* Console de log */
    .ui-cpu-console {
      background: #011215;
      border: 1.5px solid var(--sol-base01);
      border-radius: 6px;
      padding: 12px;
      font-family: var(--font-code);
      font-size: 0.8em;
      min-height: 70px;
      display: flex;
      align-items: center;
      line-height: 1.4;
      transition: all 0.3s ease;
    }
    .console-hit {
      border-color: var(--sol-green) !important;
      color: var(--sol-green) !important;
    }
    .console-miss {
      border-color: var(--sol-red) !important;
      color: var(--sol-red) !important;
    }
    
    /* Boutons de contrôle */
    .ui-cpu-controls {
      display: flex;
      gap: 8px;
      margin-top: 15px;
    }
    .ui-cpu-btn {
      flex: 1;
      padding: 8px 12px;
      border-radius: 6px;
      border: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      cursor: pointer;
      font-family: var(--font-code);
      font-weight: bold;
      font-size: 0.8em;
      text-align: center;
      transition: all 0.25s ease;
    }
    .btn-step {
      background: var(--sol-blue);
      color: var(--sol-base03);
      border-color: var(--sol-blue);
    }
    .btn-step:hover {
      background: #2aa198;
      border-color: #2aa198;
    }
    .btn-run {
      background: var(--sol-base02);
      color: var(--sol-base1);
    }
    .btn-run.is-running {
      background: var(--sol-red);
      color: var(--sol-base03);
      border-color: var(--sol-red);
    }
    
    /* Sélecteur de mode RAM */
    .ui-cpu-mode-selector {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    .ui-mode-btn {
      flex: 1;
      background: var(--sol-base03);
      border: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      color: var(--sol-base1);
      padding: 8px;
      border-radius: 6px;
      font-family: var(--font-code);
      font-weight: bold;
      font-size: 0.8em;
      cursor: pointer;
      text-align: center;
      transition: all 0.25s ease;
    }
    .ui-mode-btn.active-mode {
      border-color: var(--sol-yellow);
      background: rgba(181, 137, 0, 0.1);
      color: var(--sol-yellow);
    }
  `;
  container.appendChild(styleEl);

  const cpuCard = document.createElement("div");
  cpuCard.className = "ui-cpu-container";
  container.appendChild(cpuCard);

  // Titre principal
  const mainTitle = document.createElement("div");
  mainTitle.className = "ui-cpu-title-main";
  mainTitle.innerText = "⚡ Simulateur Interactif : Cache Hit vs Cache Miss & Assembleur";
  cpuCard.appendChild(mainTitle);

  // Sélecteur de mode de stockage RAM
  const modeSelector = document.createElement("div");
  modeSelector.className = "ui-cpu-mode-selector";
  modeSelector.innerHTML = `
    <button class="ui-mode-btn active-mode" id="btn-mode-contiguous">📦 Contigu (Columnar / Cache Hit)</button>
    <button class="ui-mode-btn" id="btn-mode-dispersed">🌪️ Dispersé (Row-oriented / Cache Miss)</button>
  `;
  cpuCard.appendChild(modeSelector);

  // Structure Layout
  const layout = document.createElement("div");
  layout.className = "ui-cpu-layout";
  cpuCard.appendChild(layout);

  // Colonne 1 : Assembleur & Registres
  const col1 = document.createElement("div");
  col1.className = "ui-cpu-card";
  col1.innerHTML = `
    <div>
      <div class="ui-cpu-card-title">📜 Instructions Assembleur (Boucle CPU)</div>
      <div class="ui-asm-block" id="asm-block">
        <div class="ui-asm-line" id="asm-1"><span class="ui-asm-num">1</span><span>LOAD  R1, [address]  ; Lire l'article de RAM</span></div>
        <div class="ui-asm-line" id="asm-2"><span class="ui-asm-num">2</span><span>MULT  R1, 2          ; ALU : R1 = R1 * 2</span></div>
        <div class="ui-asm-line" id="asm-3"><span class="ui-asm-num">3</span><span>STORE [address], R1  ; Sauver l'article doublé</span></div>
        <div class="ui-asm-line" id="asm-4"><span class="ui-asm-num">4</span><span>ADD   address, 8     ; Pointeur element + 8 bits</span></div>
        <div class="ui-asm-line" id="asm-5"><span class="ui-asm-num">5</span><span>JUMP  LOOP           ; Retour début de boucle</span></div>
      </div>
    </div>
    
    <div>
      <div class="ui-cpu-card-title">🔬 Registres Internes du CPU</div>
      <div class="ui-reg-block">
        <div class="ui-reg-row">
          <span style="color:var(--sol-magenta); font-weight:bold;">Registre R1 (Donnée) :</span>
          <span id="reg-r1" style="font-weight:bold;">0</span>
        </div>
        <div class="ui-reg-row">
          <span style="color:var(--sol-blue); font-weight:bold;">Registre IP (Pointeur) :</span>
          <span id="reg-ip" style="font-weight:bold;">0x00</span>
        </div>
        <div class="ui-reg-row">
          <span style="color:var(--sol-yellow); font-weight:bold;">ALU (Multiplier) :</span>
          <span id="reg-alu" style="font-weight:bold;">Inactif</span>
        </div>
      </div>
    </div>
  `;
  layout.appendChild(col1);

  // Colonne 2 : Matériel (Cache et RAM)
  const col2 = document.createElement("div");
  col2.className = "ui-hw-block";
  col2.innerHTML = `
    <!-- Cache Box -->
    <div class="ui-cache-box">
      <div class="ui-cpu-card-title" style="margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
        <span>⚡ Cache L1/L2 SRAM (1 ns)</span>
        <span style="font-size:0.8em; color:var(--sol-green);" id="cache-hit-badge"></span>
      </div>
      <div style="font-size:0.7em; opacity:0.7;">Lignes de caches pré-chargées depuis la RAM :</div>
      <div class="ui-cache-grid" id="cache-slots">
        <!-- 8 cache slots -->
        <div class="ui-cache-cell" id="cslot-0">-</div>
        <div class="ui-cache-cell" id="cslot-1">-</div>
        <div class="ui-cache-cell" id="cslot-2">-</div>
        <div class="ui-cache-cell" id="cslot-3">-</div>
        <div class="ui-cache-cell" id="cslot-4">-</div>
        <div class="ui-cache-cell" id="cslot-5">-</div>
        <div class="ui-cache-cell" id="cslot-6">-</div>
        <div class="ui-cache-cell" id="cslot-7">-</div>
      </div>
    </div>
    
    <!-- Bus de données animés -->
    <div style="font-size:0.7em; opacity:0.7; font-family:monospace; text-align:center;">BUS MÉMOIRE DE LA CARTE MÈRE</div>
    <div class="ui-bus-animator">
      <div class="ui-bus-pulse" id="bus-pulse"></div>
    </div>
    
    <!-- RAM Box -->
    <div class="ui-ram-box">
      <div class="ui-cpu-card-title" style="margin-bottom:6px;">📊 RAM DRAM (100 ns)</div>
      <div style="font-size:0.7em; opacity:0.7;">Données stockées dans les adresses RAM :</div>
      <div class="ui-ram-grid" id="ram-slots">
        <!-- Addresses dynamically rendered based on mode -->
      </div>
    </div>
  `;
  layout.appendChild(col2);

  // Colonne 3 : Performance & Contrôles
  const col3 = document.createElement("div");
  col3.className = "ui-cpu-card";
  col3.innerHTML = `
    <div>
      <div class="ui-cpu-card-title">📈 Statistiques de Performance</div>
      <div class="ui-perf-grid">
        <div class="ui-perf-card">
          <span>Latence Cumulée :</span>
          <span id="stat-latency" style="color:var(--sol-blue); font-weight:bold; font-size:1.1em;">0 ns</span>
        </div>
        <div class="ui-perf-card">
          <span>Taux de Cache Hit :</span>
          <span id="stat-hitrate" style="color:var(--sol-green); font-weight:bold; font-size:1.1em;">0%</span>
        </div>
        <div class="ui-perf-card">
          <span>Cycles Perdus (Stalls) :</span>
          <span id="stat-stalls" style="color:var(--sol-red); font-weight:bold; font-size:1.1em;">0%</span>
        </div>
      </div>
    </div>
    
    <div>
      <div class="ui-cpu-card-title">🎛️ Terminal CPU & Commandes</div>
      <div class="ui-cpu-console" id="cpu-console">
        Simulateur prêt. Cliquez sur "Pas à Pas" pour démarrer l'exécution.
      </div>
      <div class="ui-cpu-controls">
        <button class="ui-cpu-btn btn-step" id="btn-step">▶ Pas à Pas</button>
        <button class="ui-cpu-btn btn-run" id="btn-run">⚙️ Auto-Run</button>
        <button class="ui-cpu-btn" id="btn-reset" style="background:var(--sol-base03); color:var(--sol-base1);">🔄 Reset</button>
      </div>
    </div>
  `;
  layout.appendChild(col3);

  // Données de simulation pour les modes
  const memoryModes = {
    contiguous: {
      addresses: ["0x00", "0x08", "0x10", "0x18", "0x20", "0x28", "0x30", "0x38"],
      values: [12, 45, 78, 33, 90, 15, 60, 22]
    },
    dispersed: {
      addresses: ["0x08", "0xF8", "0x40", "0xCC", "0x18", "0xE0", "0x78", "0x9C"],
      values: [12, 45, 78, 33, 90, 15, 60, 22]
    }
  };

  // Variables d'état de la simulation
  let currentMode = "contiguous";
  let activeIndex = 0; // 0 à 7 éléments
  let activeAsmLine = 0; // 0 à 5 (0 = pas démarré)
  let hits = 0;
  let misses = 0;
  let accumulatedLatency = 0;
  let cachedAddresses = new Set();
  let aluState = "Inactif";
  let isAutoRunning = false;
  let autoRunTimer = null;

  // Initialisation du rendu des adresses RAM
  const renderRamGrid = () => {
    const ramGrid = col2.querySelector("#ram-slots");
    ramGrid.innerHTML = "";
    
    const modeData = memoryModes[currentMode];
    modeData.addresses.forEach((addr, i) => {
      const cell = document.createElement("div");
      cell.className = "ui-ram-cell";
      cell.id = `ramcell-${i}`;
      cell.innerHTML = `
        <span style="color:var(--sol-base01);">${addr}</span>
        <span style="font-weight:bold; color:var(--sol-cyan);">${modeData.values[i]}</span>
      `;
      ramGrid.appendChild(cell);
    });
  };

  // Mettre à jour l'affichage du cache
  const updateCacheDisplay = () => {
    const slots = col2.querySelectorAll(".ui-cache-cell");
    const cachedArray = Array.from(cachedAddresses);
    
    slots.forEach((slot, i) => {
      if (i < cachedArray.length) {
        slot.innerText = cachedArray[i];
        slot.classList.add("is-cached");
      } else {
        slot.innerText = "-";
        slot.classList.remove("is-cached");
      }
    });
  };

  // Réinitialiser la simulation
  const resetSimulation = () => {
    activeIndex = 0;
    activeAsmLine = 0;
    hits = 0;
    misses = 0;
    accumulatedLatency = 0;
    cachedAddresses.clear();
    aluState = "Inactif";
    
    // Stopper AutoRun
    if (isAutoRunning) {
      clearInterval(autoRunTimer);
      isAutoRunning = false;
      const runBtn = col3.querySelector("#btn-run");
      runBtn.classList.remove("is-running");
      runBtn.innerText = "⚙️ Auto-Run";
    }

    // Reset des classes assembleurs
    const lines = col1.querySelectorAll(".ui-asm-line");
    lines.forEach(l => l.classList.remove("ui-asm-active"));

    // Reset des puces RAM
    const ramCells = col2.querySelectorAll(".ui-ram-cell");
    ramCells.forEach(cell => cell.className = "ui-ram-cell");

    // Reset registers
    col1.querySelector("#reg-r1").innerText = "0";
    col1.querySelector("#reg-ip").innerText = "0x00";
    col1.querySelector("#reg-alu").innerText = "Inactif";
    col1.querySelector("#reg-alu").style.color = "var(--sol-base0)";

    // Reset bus pulse
    const busPulse = col2.querySelector("#bus-pulse");
    busPulse.className = "ui-bus-pulse";

    // Reset badges
    col2.querySelector("#cache-hit-badge").innerText = "";

    // Reset console
    const consoleBox = col3.querySelector("#cpu-console");
    consoleBox.className = "ui-cpu-console";
    consoleBox.innerText = "Simulateur réinitialisé. Prêt pour l'exécution.";

    // Reset stats
    col3.querySelector("#stat-latency").innerText = "0 ns";
    col3.querySelector("#stat-hitrate").innerText = "0%";
    col3.querySelector("#stat-stalls").innerText = "0%";

    renderRamGrid();
    updateCacheDisplay();
  };

  // Exécuter un pas d'instruction assembleur
  const stepInstruction = () => {
    if (activeIndex >= 8) {
      resetSimulation();
      col3.querySelector("#cpu-console").innerText = "Simulation terminée avec succès pour les 8 éléments !";
      return;
    }

    // Avancer l'instruction
    activeAsmLine = activeAsmLine === 5 ? 1 : activeAsmLine + 1;

    // Mettre à jour la surbrillance de l'assembleur
    const lines = col1.querySelectorAll(".ui-asm-line");
    lines.forEach(l => l.classList.remove("ui-asm-active"));
    col1.querySelector(`#asm-${activeAsmLine}`).classList.add("ui-asm-active");

    const modeData = memoryModes[currentMode];
    const targetAddr = modeData.addresses[activeIndex];
    const targetVal = modeData.values[activeIndex];

    const regR1 = col1.querySelector("#reg-r1");
    const regIP = col1.querySelector("#reg-ip");
    const regALU = col1.querySelector("#reg-alu");
    const consoleBox = col3.querySelector("#cpu-console");
    const busPulse = col2.querySelector("#bus-pulse");
    const badge = col2.querySelector("#cache-hit-badge");

    // Reset des classes de lecture RAM
    col2.querySelectorAll(".ui-ram-cell").forEach(cell => {
      cell.classList.remove("is-reading", "is-prefetched");
    });

    if (activeAsmLine === 1) {
      // LOAD  R1, [address]
      regIP.innerText = targetAddr;
      
      const isCached = cachedAddresses.has(targetAddr);
      
      if (isCached) {
        // --- CACHE HIT ---
        hits++;
        accumulatedLatency += 1; // 1 ns cache latency
        
        badge.innerText = "🟢 CACHE HIT !";
        badge.style.color = "var(--sol-green)";
        
        consoleBox.innerText = `[LOAD] R1 ➔ Chargement de R1 depuis le cache pour l'adresse ${targetAddr} en 1 ns !`;
        consoleBox.className = "ui-cpu-console console-hit";
        
        // Fast bus animation
        busPulse.className = "ui-bus-pulse is-hit";
        
        regR1.innerText = targetVal;
      } else {
        // --- CACHE MISS ---
        misses++;
        accumulatedLatency += 100; // 100 ns RAM stall latency
        
        badge.innerText = "🔴 CACHE MISS !";
        badge.style.color = "var(--sol-red)";
        
        // Slow bus animation
        busPulse.className = "ui-bus-pulse is-miss";
        
        // Mettre la RAM cell cible en surbrillance de lecture
        const targetCell = col2.querySelector(`#ramcell-${activeIndex}`);
        if (targetCell) targetCell.classList.add("is-reading");

        if (currentMode === "contiguous") {
          // Prefetching : On charge TOUTE la ligne de cache d'un coup
          consoleBox.innerText = `[LOAD] R1 ➔ Cache Miss ! Le CPU charge ${targetAddr} depuis la RAM en 100 ns. Mode contigu : TOUTE la ligne de cache (0x00 à 0x38) est pré-chargée en L1/L2 !`;
          consoleBox.className = "ui-cpu-console console-miss";
          
          // Mettre toutes les cellules RAM en surbrillance prefetch
          col2.querySelectorAll(".ui-ram-cell").forEach(c => c.classList.add("is-prefetched"));
          
          modeData.addresses.forEach(addr => cachedAddresses.add(addr));
        } else {
          // Dispersé : Pas de prefetching possible
          consoleBox.innerText = `[LOAD] R1 ➔ Cache Miss ! Le CPU charge ${targetAddr} en 100 ns. Mode dispersé : les adresses sont chaotiques, seule l'adresse active ${targetAddr} est cachée.`;
          consoleBox.className = "ui-cpu-console console-miss";
          
          cachedAddresses.add(targetAddr);
        }
        
        regR1.innerText = targetVal;
        updateCacheDisplay();
      }
    } 
    else if (activeAsmLine === 2) {
      // MULT  R1, 2
      const currentVal = parseInt(regR1.innerText);
      const doubledVal = currentVal * 2;
      regR1.innerText = doubledVal;
      regALU.innerText = `Doubler : ${currentVal} ➔ ${doubledVal}`;
      regALU.style.color = "var(--sol-yellow)";
      badge.innerText = "";
      busPulse.className = "ui-bus-pulse";
      
      consoleBox.className = "ui-cpu-console";
      consoleBox.innerText = `[MULT] Multiplier R1 par 2. Calcul vectorisé effectué instantanément dans l'unité arithmétique (ALU) en 1 cycle d'horloge.`;
    } 
    else if (activeAsmLine === 3) {
      // STORE [address], R1
      const doubleVal = regR1.innerText;
      
      consoleBox.className = "ui-cpu-console";
      consoleBox.innerText = `[STORE] Sauvegarde du résultat doublé (${doubleVal}) dans la mémoire à l'adresse ${targetAddr}.`;
      
      // Mettre à jour visuellement la valeur dans la RAM
      const ramCell = col2.querySelector(`#ramcell-${activeIndex}`);
      if (ramCell) {
        ramCell.querySelector("span:last-child").innerText = doubleVal;
      }
    } 
    else if (activeAsmLine === 4) {
      // ADD   address, 8
      consoleBox.className = "ui-cpu-console";
      consoleBox.innerText = `[ADD] Incrémentation du pointeur d'adresse de 8 octets pour désigner l'élément suivant du tableau.`;
      
      regALU.innerText = "Inactif";
      regALU.style.color = "var(--sol-base0)";
    } 
    else if (activeAsmLine === 5) {
      // JUMP  LOOP
      consoleBox.className = "ui-cpu-console";
      consoleBox.innerText = `[JUMP] Retour au début de la boucle assembleur pour traiter l'élément index ${activeIndex + 2}.`;
      
      activeIndex++;
    }

    // Mettre à jour les statistiques globales
    const totalRequests = hits + misses;
    const hitRate = totalRequests > 0 ? Math.round((hits / totalRequests) * 100) : 0;
    
    // Calculer le taux de stall (temps passé à attendre la RAM sur le temps total)
    // Latence du cache = hits * 1 ns. Latence RAM = misses * 100 ns.
    const ramTime = misses * 100;
    const stallPct = accumulatedLatency > 0 ? Math.round((ramTime / accumulatedLatency) * 100) : 0;

    col3.querySelector("#stat-latency").innerText = `${accumulatedLatency} ns`;
    col3.querySelector("#stat-hitrate").innerText = `${hitRate}%`;
    col3.querySelector("#stat-stalls").innerText = `${stallPct}%`;
    
    const stallCol = stallPct > 50 ? "var(--sol-red)" : (stallPct > 20 ? "var(--sol-orange)" : "var(--sol-green)");
    col3.querySelector("#stat-stalls").style.color = stallCol;
  };

  // Liaison événements : Sélection du mode
  const btnContiguous = modeSelector.querySelector("#btn-mode-contiguous");
  const btnDispersed = modeSelector.querySelector("#btn-mode-dispersed");

  btnContiguous.addEventListener("click", () => {
    btnContiguous.classList.add("active-mode");
    btnDispersed.classList.remove("active-mode");
    currentMode = "contiguous";
    resetSimulation();
  });

  btnDispersed.addEventListener("click", () => {
    btnDispersed.classList.add("active-mode");
    btnContiguous.classList.remove("active-mode");
    currentMode = "dispersed";
    resetSimulation();
  });

  // Liaison événements : Clics boutons
  const btnStep = col3.querySelector("#btn-step");
  const btnRun = col3.querySelector("#btn-run");
  const btnReset = col3.querySelector("#btn-reset");

  btnStep.addEventListener("click", () => {
    if (isAutoRunning) {
      clearInterval(autoRunTimer);
      isAutoRunning = false;
      btnRun.classList.remove("is-running");
      btnRun.innerText = "⚙️ Auto-Run";
    }
    stepInstruction();
  });

  btnRun.addEventListener("click", () => {
    if (isAutoRunning) {
      clearInterval(autoRunTimer);
      isAutoRunning = false;
      btnRun.classList.remove("is-running");
      btnRun.innerText = "⚙️ Auto-Run";
    } else {
      isAutoRunning = true;
      btnRun.classList.add("is-running");
      btnRun.innerText = "⏹ Arrêter";
      autoRunTimer = setInterval(() => {
        stepInstruction();
      }, 500);
    }
  });

  btnReset.addEventListener("click", () => {
    resetSimulation();
  });

  // Rendu initial
  renderRamGrid();
  updateCacheDisplay();

  return container;
};

/**
 * 📊 Explicateur Interactif de Boîte à Moustaches (Box Plot) & Indicateurs Statistiques
 */
export const dynamicBoxplotExplainer = () => {
  const container = document.createElement("div");
  container.className = "ui-boxplot-explainer";

  // Styles CSS localisés
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .ui-bp-container {
      background: var(--sol-base03);
      color: var(--sol-base0);
      border: 1px solid var(--sol-base02);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 25px;
      font-family: var(--font-sans);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }
    .ui-bp-title-main {
      font-family: var(--font-code);
      font-weight: 800;
      color: var(--sol-cyan);
      font-size: 1.1em;
      margin-bottom: 18px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      padding-bottom: 8px;
    }
    
    /* Zone de contrôle Slider */
    .ui-bp-slider-panel {
      background: var(--sol-base02);
      border: 1px solid rgba(var(--sol-base1-rgb), 0.08);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
    }
    .ui-bp-slider-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 0.9em;
    }
    .ui-bp-slider-input {
      width: 100%;
      height: 6px;
      background: var(--sol-base01);
      outline: none;
      border-radius: 3px;
      -webkit-appearance: none;
      cursor: pointer;
    }
    .ui-bp-slider-input::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--sol-orange);
      cursor: pointer;
      box-shadow: 0 0 8px rgba(203, 75, 22, 0.6);
      transition: transform 0.15s ease;
    }
    .ui-bp-slider-input::-webkit-slider-thumb:hover {
      transform: scale(1.2);
    }
    
    /* Zone Graphique */
    .ui-bp-svg-wrapper {
      background: #001e26;
      border: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 20px;
      position: relative;
    }
    .bp-hotspot {
      cursor: pointer;
      pointer-events: all;
      transition: all 0.2s ease;
    }
    .bp-hotspot:hover {
      opacity: 0.8;
      filter: drop-shadow(0 0 6px var(--sol-cyan));
    }
    
    /* Layout du bas : Explications et Comparaison */
    .ui-bp-layout {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: 20px;
    }
    @media (max-width: 768px) {
      .ui-bp-layout {
        grid-template-columns: 1fr;
      }
    }
    
    /* Panneau Explicatif Interactif */
    .ui-bp-details-card {
      background: var(--sol-base02);
      border: 1px solid rgba(var(--sol-base1-rgb), 0.08);
      border-radius: 8px;
      padding: 16px;
      min-height: 150px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      transition: border-color 0.3s ease;
    }
    .ui-bp-details-title {
      font-family: var(--font-code);
      font-weight: bold;
      color: var(--sol-cyan);
      font-size: 1.05em;
      margin-bottom: 8px;
    }
    
    /* Panel Comparatif Moyenne vs Médiane */
    .ui-bp-comp-card {
      background: var(--sol-base02);
      border: 1px solid rgba(var(--sol-base1-rgb), 0.08);
      border-radius: 8px;
      padding: 16px;
    }
    .ui-bp-comp-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px dashed rgba(var(--sol-base1-rgb), 0.08);
    }
    .ui-bp-comp-row:last-child {
      border-bottom: none;
    }
    .ui-bp-val-badge {
      font-family: var(--font-code);
      font-weight: bold;
      font-size: 1.1em;
      padding: 2px 8px;
      border-radius: 4px;
    }
  `;
  container.appendChild(styleEl);

  const bpCard = document.createElement("div");
  bpCard.className = "ui-bp-container";
  container.appendChild(bpCard);

  // Titre
  const titleDiv = document.createElement("div");
  titleDiv.className = "ui-bp-title-main";
  titleDiv.innerText = "📊 Simulateur Interactif de Boîte à Moustaches (Box Plot)";
  bpCard.appendChild(titleDiv);

  // Zone curseur outlier
  const sliderPanel = document.createElement("div");
  sliderPanel.className = "ui-bp-slider-panel";
  sliderPanel.innerHTML = `
    <div class="ui-bp-slider-header">
      <span style="font-weight:bold;">🚨 Insérer une valeur extrême (Outlier) dans le Dataset :</span>
      <span id="slider-val-label" style="font-family:var(--font-code); font-weight:bold; color:var(--sol-orange);">X = 35 ans (normal)</span>
    </div>
    <input type="range" class="ui-bp-slider-input" id="outlier-slider" min="35" max="150" value="35">
  `;
  bpCard.appendChild(sliderPanel);

  // Zone Graphique SVG
  const svgWrapper = document.createElement("div");
  svgWrapper.className = "ui-bp-svg-wrapper";
  svgWrapper.innerHTML = `
    <svg id="boxplot-svg" viewBox="0 0 540 160" width="100%" height="160" style="overflow: visible;"></svg>
  `;
  bpCard.appendChild(svgWrapper);

  // Layout Bas
  const layout = document.createElement("div");
  layout.className = "ui-bp-layout";
  bpCard.appendChild(layout);

  // Panneau d'explications dynamiques
  const detailsCard = document.createElement("div");
  detailsCard.className = "ui-bp-details-card";
  detailsCard.id = "bp-details-panel";
  layout.appendChild(detailsCard);

  // Panneau comparatif Moyenne vs Médiane
  const compCard = document.createElement("div");
  compCard.className = "ui-bp-comp-card";
  compCard.innerHTML = `
    <div style="font-family:var(--font-code); font-size:0.8em; text-transform:uppercase; color:var(--sol-base1); margin-bottom:12px; border-bottom:1px solid rgba(var(--sol-base1-rgb), 0.08); padding-bottom:4px;">⚖️ Robustesse : Moyenne vs Médiane</div>
    <div class="ui-bp-comp-row">
      <span>Moyenne (<span style="color:var(--sol-magenta); font-weight:bold;">$\bar{x}$</span> Diamant) :</span>
      <span id="comp-mean" class="ui-bp-val-badge" style="color:var(--sol-magenta); background:rgba(211, 54, 130, 0.1);">26.9 ans</span>
    </div>
    <div class="ui-bp-comp-row">
      <span>Médiane (<span style="color:var(--sol-cyan); font-weight:bold;">$Me$</span> Barre) :</span>
      <span id="comp-median" class="ui-bp-val-badge" style="color:var(--sol-cyan); background:rgba(42, 161, 152, 0.1);">26.0 ans</span>
    </div>
    <div class="ui-bp-comp-row">
      <span>Écart Interquartile (IQR) :</span>
      <span id="comp-iqr" class="ui-bp-val-badge" style="color:var(--sol-green); background:rgba(133, 153, 0, 0.1);">7.0 ans</span>
    </div>
  `;
  layout.appendChild(compCard);

  // Dataset de base fixe (9 observations initiales saines représentant des âges de suspects)
  const baseAges = [20, 21, 23, 24, 26, 27, 29, 31, 33];

  // Calcul mathématique des quantiles par interpolation linéaire
  const getPercentile = (arr, p) => {
    const pos = (arr.length - 1) * p;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (arr[base + 1] !== undefined) {
      return arr[base] + rest * (arr[base + 1] - arr[base]);
    } else {
      return arr[base];
    }
  };

  // Les définitions des notions pour l'affichage interactif au survol
  const conceptDefinitions = {
    default: {
      title: "🔎 Guide d'exploration interactif",
      desc: "Passez votre souris (ou cliquez) sur les composants de la boîte à moustaches (boîte, moustaches, diamant, points isolés) pour découvrir en temps réel leur sens mathématique et leur comportement."
    },
    median: {
      title: "🟢 La Médiane ($Me$)",
      desc: "Le point de partage parfait : 50% des observations ont un âge inférieur et 50% supérieur. Elle est **ultra-robuste** face aux valeurs extrêmes car elle ne dépend que du classement ordonné, non de la grandeur numérique."
    },
    mean: {
      title: "🔴 La Moyenne ($\bar{x}$)",
      desc: "Le centre de gravité arithmétique de la distribution. Elle prend en compte la valeur exacte de chaque point. C'est pourquoi elle est **extrêmement sensible** aux valeurs aberrantes : faites grimper la valeur de l'outlier et observez le diamant magenta s'enfuir vers la droite !"
    },
    quartiles: {
      title: "🩵 Quartiles ($Q_1$ et $Q_3$) & Boîte",
      desc: "La boîte englobe les **50% de données centrales** de l'échantillon. $Q_1$ marque le premier quart (25% des données inférieures) et $Q_3$ le troisième quart (75% des données inférieures). L'intervalle entre les deux est la hauteur de la boîte, appelée **IQR** (Intervalle Interquartile)."
    },
    moustaches: {
      title: "📦 Moustaches (Min/Max)",
      desc: "Elles s'étirent de la boîte jusqu'au point sémantiquement 'sain' le plus éloigné. Par définition, elles ne peuvent dépasser les **barrières de Tukey** : $Q_1 - 1.5 \\times IQR$ à gauche et $Q_3 + 1.5 \\times IQR$ à droite."
    },
    outliers: {
      title: "🔥 Valeurs Aberrantes (Outliers)",
      desc: "Tout point situé en dehors des moustaches (au-delà de $Q_3 + 1.5 \\times IQR$). Les algorithmes de Data Science l'isolent automatiquement pour éviter qu'il ne pollue les calculs de moyenne ou d'écart-type !"
    }
  };

  const updateDetails = (key) => {
    const detailsPanel = bpCard.querySelector("#bp-details-panel");
    const data = conceptDefinitions[key] || conceptDefinitions.default;
    
    // Déterminer la couleur de bordure selon le concept
    let borderCol = "rgba(var(--sol-base1-rgb), 0.08)";
    if (key === "median") borderCol = "var(--sol-cyan)";
    else if (key === "mean") borderCol = "var(--sol-magenta)";
    else if (key === "outliers") borderCol = "var(--sol-orange)";
    else if (key === "quartiles") borderCol = "var(--sol-green)";
    
    detailsPanel.style.borderColor = borderCol;
    detailsPanel.innerHTML = `
      <div class="ui-bp-details-title">${data.title}</div>
      <div style="font-size:0.85em; line-height:1.5; color:var(--sol-base0);">${data.desc}</div>
    `;
  };

  // Logique principale de calcul et de rendu SVG
  const renderBoxplot = (outlierValue) => {
    // 1. Composer le dataset
    const ages = [...baseAges, outlierValue].sort((a, b) => a - b);
    
    // 2. Calculs statistiques
    const sum = ages.reduce((a, b) => a + b, 0);
    const mean = sum / ages.length;
    
    const q1 = getPercentile(ages, 0.25);
    const median = getPercentile(ages, 0.5);
    const q3 = getPercentile(ages, 0.75);
    
    const iqr = q3 - q1;
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;
    
    const outliers = ages.filter(v => v < lowerFence || v > upperFence);
    const nonOutliers = ages.filter(v => v >= lowerFence && v <= upperFence);
    
    const minVal = Math.min(...nonOutliers);
    const maxVal = Math.max(...nonOutliers);

    // 3. Mettre à jour les indicateurs comparatifs
    bpCard.querySelector("#comp-mean").innerText = `${mean.toFixed(1)} ans`;
    bpCard.querySelector("#comp-median").innerText = `${median.toFixed(1)} ans`;
    bpCard.querySelector("#comp-iqr").innerText = `${iqr.toFixed(1)} ans`;
    
    // Colorer dynamiquement la moyenne en rouge si elle s'écarte beaucoup de la médiane
    const diff = Math.abs(mean - median);
    if (diff > 5) {
      bpCard.querySelector("#comp-mean").style.color = "var(--sol-red)";
      bpCard.querySelector("#comp-mean").style.background = "rgba(220, 50, 47, 0.15)";
    } else {
      bpCard.querySelector("#comp-mean").style.color = "var(--sol-magenta)";
      bpCard.querySelector("#comp-mean").style.background = "rgba(211, 54, 130, 0.1)";
    }

    // 4. Générer le rendu SVG
    const svg = bpCard.querySelector("#boxplot-svg");
    svg.innerHTML = "";

    // Échelle linéaire X (Val 0 ➔ 160 maps to px 40 ➔ 500)
    const scaleX = (val) => 40 + ((val - 0) / 160) * 460;

    // A. Ligne d'axe principale et ticks
    const ticks = [0, 20, 40, 60, 80, 100, 120, 140, 160];
    ticks.forEach(t => {
      const px = scaleX(t);
      // Grille verticale discrète
      svg.innerHTML += `
        <line x1="${px}" y1="20" x2="${px}" y2="105" stroke="rgba(147, 161, 161, 0.08)" stroke-width="1" />
        <line x1="${px}" y1="105" x2="${px}" y2="112" stroke="var(--sol-base01)" stroke-width="1.5" />
        <text x="${px}" y="128" font-family="var(--font-code)" font-size="9" fill="var(--sol-base01)" text-anchor="middle">${t}</text>
      `;
    });
    
    // Ligne horizontale de l'axe
    svg.innerHTML += `
      <line x1="${scaleX(0)}" y1="105" x2="${scaleX(160)}" y2="105" stroke="var(--sol-base01)" stroke-width="1.5" />
      <!-- Ligne d'axe centrale reliant les moustaches -->
      <line x1="${scaleX(minVal)}" y1="65" x2="${scaleX(maxVal)}" y2="65" stroke="var(--sol-base0)" stroke-width="1.5" stroke-dasharray="2 2" />
    `;

    // B. Dessiner les moustaches
    // Moustache gauche (Min)
    svg.innerHTML += `
      <line class="bp-hotspot" data-concept="moustaches" x1="${scaleX(minVal)}" y1="45" x2="${scaleX(minVal)}" y2="85" stroke="var(--sol-base0)" stroke-width="2.5" />
      <line class="bp-hotspot" data-concept="moustaches" x1="${scaleX(minVal)}" y1="65" x2="${scaleX(q1)}" y2="65" stroke="var(--sol-base0)" stroke-width="2" />
    `;
    // Moustache droite (Max)
    svg.innerHTML += `
      <line class="bp-hotspot" data-concept="moustaches" x1="${scaleX(maxVal)}" y1="45" x2="${scaleX(maxVal)}" y2="85" stroke="var(--sol-base0)" stroke-width="2.5" />
      <line class="bp-hotspot" data-concept="moustaches" x1="${scaleX(q3)}" y1="65" x2="${scaleX(maxVal)}" y2="65" stroke="var(--sol-base0)" stroke-width="2" />
    `;

    // C. Dessiner la boîte interquartile
    const boxW = scaleX(q3) - scaleX(q1);
    svg.innerHTML += `
      <rect class="bp-hotspot" data-concept="quartiles" x="${scaleX(q1)}" y="35" width="${boxW}" height="60" 
        fill="rgba(133, 153, 0, 0.15)" stroke="var(--sol-green)" stroke-width="2.5" rx="3" />
    `;

    // D. Dessiner la médiane
    svg.innerHTML += `
      <line class="bp-hotspot" data-concept="median" x1="${scaleX(median)}" y1="35" x2="${scaleX(median)}" y2="95" 
        stroke="var(--sol-cyan)" stroke-width="4.5" stroke-linecap="round" />
    `;

    // E. Dessiner la moyenne (Diamant Magenta)
    const mx = scaleX(mean);
    svg.innerHTML += `
      <polygon class="bp-hotspot" data-concept="mean" points="${mx},57 ${mx+8},65 ${mx},73 ${mx-8},65" 
        fill="var(--sol-magenta)" stroke="#fff" stroke-width="1" />
    `;

    // F. Dessiner les Outliers (Points rouges vibrants)
    outliers.forEach(o => {
      svg.innerHTML += `
        <circle class="bp-hotspot" data-concept="outliers" cx="${scaleX(o)}" cy="65" r="7" 
          fill="var(--sol-orange)" stroke="var(--sol-red)" stroke-width="1.5" />
      `;
    });

    // 5. Relier les événements de survol/clic sur le SVG
    const hotspots = svg.querySelectorAll(".bp-hotspot");
    hotspots.forEach(el => {
      const concept = el.getAttribute("data-concept");
      el.addEventListener("mouseenter", () => updateDetails(concept));
      el.addEventListener("mouseleave", () => updateDetails("default"));
      el.addEventListener("click", () => updateDetails(concept));
    });
  };



/**
 * 📏 Simulateur de Mise à l'Échelle (Normalisation vs Standardisation)
 */
export const scalingSimulator = () => {
  const container = document.createElement("div");
  container.className = "ui-scaling-simulator";

  // Styles CSS localisés haut de gamme
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .ui-ss-container {
      background: var(--sol-base03);
      color: var(--sol-base0);
      border: 1px solid var(--sol-base02);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 25px;
      font-family: var(--font-sans);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }
    .ui-ss-title {
      font-family: var(--font-code);
      font-weight: 800;
      color: var(--sol-cyan);
      font-size: 1.1em;
      margin-bottom: 18px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      padding-bottom: 8px;
    }
    
    /* Zone de contrôle Slider */
    .ui-ss-slider-panel {
      background: var(--sol-base02);
      border: 1px solid rgba(var(--sol-base1-rgb), 0.08);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
    }
    .ui-ss-slider-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 0.9em;
    }
    .ui-ss-slider-input {
      width: 100%;
      height: 6px;
      background: var(--sol-base01);
      outline: none;
      border-radius: 3px;
      -webkit-appearance: none;
      cursor: pointer;
    }
    .ui-ss-slider-input::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--sol-orange);
      cursor: pointer;
      box-shadow: 0 0 8px rgba(203, 75, 22, 0.6);
      transition: transform 0.15s ease;
    }
    .ui-ss-slider-input::-webkit-slider-thumb:hover {
      transform: scale(1.2);
    }
    
    /* Tranches Graphiques */
    .ui-ss-plots {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    .ui-ss-plot-card {
      background: #001e26;
      border: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      border-radius: 8px;
      padding: 16px;
    }
    .ui-ss-plot-title {
      font-family: var(--font-code);
      font-size: 0.85em;
      font-weight: bold;
      color: var(--sol-base1);
      margin-bottom: 12px;
      display: flex;
      justify-content: space-between;
    }
    
    /* Panneau de Diagnostic */
    .ui-ss-diag-panel {
      background: var(--sol-base02);
      border: 1px solid rgba(var(--sol-base1-rgb), 0.08);
      border-radius: 8px;
      padding: 16px;
      font-size: 0.9em;
      line-height: 1.5;
      min-height: 80px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      transition: all 0.3s ease;
    }
    .ss-diag-ok {
      border-left: 4px solid var(--sol-green);
      color: var(--sol-green);
    }
    .ss-diag-warn {
      border-left: 4px solid var(--sol-orange);
      color: var(--sol-orange);
    }
    .ss-diag-err {
      border-left: 4px solid var(--sol-red);
      color: var(--sol-red);
    }
  `;
  container.appendChild(styleEl);

  const ssCard = document.createElement("div");
  ssCard.className = "ui-ss-container";
  container.appendChild(ssCard);

  // Titre
  const titleDiv = document.createElement("div");
  titleDiv.className = "ui-ss-title";
  titleDiv.innerText = "📏 Confrontation Visuelle : Normalisation vs Standardisation";
  ssCard.appendChild(titleDiv);

  // Zone curseur outlier
  const sliderPanel = document.createElement("div");
  sliderPanel.className = "ui-ss-slider-panel";
  sliderPanel.innerHTML = `
    <div class="ui-ss-slider-header">
      <span style="font-weight:bold;">🚨 Insérer une observation extrême (Outlier) :</span>
      <span id="ss-slider-label" style="font-family:var(--font-code); font-weight:bold; color:var(--sol-orange);">X = 30 (Sain)</span>
    </div>
    <input type="range" class="ui-ss-slider-input" id="ss-outlier-slider" min="30" max="250" value="30">
  `;
  ssCard.appendChild(sliderPanel);

  // Plots SVGs
  const plotsContainer = document.createElement("div");
  plotsContainer.className = "ui-ss-plots";
  plotsContainer.innerHTML = `
    <!-- Min-Max normalisation -->
    <div class="ui-ss-plot-card">
      <div class="ui-ss-plot-title">
        <span>📏 1. Normalisation Min-Max (Limites strictes [0, 1])</span>
        <span style="color:var(--sol-green);" id="normal-stats">Plage normale : 100%</span>
      </div>
      <svg id="svg-minmax" viewBox="0 0 500 80" width="100%" height="80" style="overflow:visible;"></svg>
    </div>
    
    <!-- Z-Score standardisation -->
    <div class="ui-ss-plot-card">
      <div class="ui-ss-plot-title">
        <span>🎯 2. Standardisation Z-Score (Moyenne = 0, Écart-Type = 1)</span>
        <span style="color:var(--sol-cyan);" id="zscore-stats">Écartement préservé</span>
      </div>
      <svg id="svg-zscore" viewBox="0 0 500 80" width="100%" height="80" style="overflow:visible;"></svg>
    </div>
  `;
  ssCard.appendChild(plotsContainer);

  // Panneau Diagnostic
  const diagPanel = document.createElement("div");
  diagPanel.className = "ui-ss-diag-panel ss-diag-ok";
  diagPanel.id = "ss-diag-card";
  ssCard.appendChild(diagPanel);

  // Dataset de base fixe saine (4 valeurs saines)
  const baseData = [10, 15, 20, 25];

  // Rendu principal des graphs
  const renderScaling = (outlierVal) => {
    // 1. Dataset complet
    const data = [...baseData, outlierVal];
    
    // 2. Calculs statistiques pour Min-Max
    const min = Math.min(...data);
    const max = Math.max(...data);
    const minMaxData = data.map(v => (max - min === 0) ? 0.5 : (v - min) / (max - min));

    // 3. Calculs statistiques pour Z-Score
    const sum = data.reduce((a, b) => a + b, 0);
    const mean = sum / data.length;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    const zData = data.map(v => (stdDev === 0) ? 0 : (v - mean) / stdDev);

    // 4. Rendu SVG Min-Max
    const svgMinMax = ssCard.querySelector("#svg-minmax");
    svgMinMax.innerHTML = "";
    
    // Échelle linéaire X pour [0, 1] maps to px [40, 460]
    const scaleXMM = (val) => 40 + val * 420;
    
    // Grille Min-Max
    const ticksMM = [0.0, 0.25, 0.5, 0.75, 1.0];
    ticksMM.forEach(t => {
      const px = scaleXMM(t);
      svgMinMax.innerHTML += `
        <line x1="${px}" y1="10" x2="${px}" y2="45" stroke="rgba(147, 161, 161, 0.08)" stroke-width="1.5" />
        <line x1="${px}" y1="45" x2="${px}" y2="52" stroke="var(--sol-base01)" stroke-width="1.5" />
        <text x="${px}" y="68" font-family="var(--font-code)" font-size="9" fill="var(--sol-base01)" text-anchor="middle">${t.toFixed(2)}</text>
      `;
    });
    
    // Ligne centrale
    svgMinMax.innerHTML += `
      <line x1="${scaleXMM(0)}" y1="45" x2="${scaleXMM(1)}" y2="45" stroke="var(--sol-base01)" stroke-width="1.5" />
    `;

    // Dessiner les points Min-Max
    minMaxData.forEach((v, idx) => {
      const isOutlier = idx === 4;
      const col = isOutlier ? "var(--sol-orange)" : "var(--sol-green)";
      const glow = isOutlier ? "rgba(203, 75, 22, 0.5)" : "rgba(133, 153, 0, 0.3)";
      const px = scaleXMM(v);
      svgMinMax.innerHTML += `
        <circle cx="${px}" cy="45" r="${isOutlier ? 7 : 6}" fill="${col}" stroke="#fff" stroke-width="1" style="filter: drop-shadow(0 0 5px ${glow});" />
      `;
    });

    // 5. Rendu SVG Z-Score
    const svgZScore = ssCard.querySelector("#svg-zscore");
    svgZScore.innerHTML = "";
    
    // Échelle linéaire X pour [-2, 4] standard deviations maps to px [40, 460]
    // scaleXZ maps -2 to 40px and 4 to 460px
    const scaleXZ = (val) => 40 + ((val - (-2.0)) / 6.0) * 420;
    
    // Grille Z-Score
    const ticksZ = [-2, -1, 0, 1, 2, 3, 4];
    ticksZ.forEach(t => {
      const px = scaleXZ(t);
      const isMean = t === 0;
      const strokeCol = isMean ? "var(--sol-cyan)" : "var(--sol-base01)";
      svgZScore.innerHTML += `
        <line x1="${px}" y1="10" x2="${px}" y2="45" stroke="${isMean ? "rgba(42, 161, 152, 0.15)" : "rgba(147, 161, 161, 0.08)"}" stroke-width="1.5" />
        <line x1="${px}" y1="45" x2="${px}" y2="52" stroke="${strokeCol}" stroke-width="1.5" />
        <text x="${px}" y="68" font-family="var(--font-code)" font-size="9" fill="${strokeCol}" text-anchor="middle" font-weight="${isMean ? "bold" : "normal"}">${t >= 0 ? "+" : ""}${t}σ</text>
      `;
    });

    // Ligne centrale
    svgZScore.innerHTML += `
      <line x1="${scaleXZ(-2)}" y1="45" x2="${scaleXZ(4)}" y2="45" stroke="var(--sol-base01)" stroke-width="1.5" />
    `;

    // Dessiner les points Z-Score
    zData.forEach((v, idx) => {
      const isOutlier = idx === 4;
      const col = isOutlier ? "var(--sol-orange)" : "var(--sol-cyan)";
      const glow = isOutlier ? "rgba(203, 75, 22, 0.5)" : "rgba(42, 161, 152, 0.3)";
      const px = scaleXZ(v);
      svgZScore.innerHTML += `
        <circle cx="${px}" cy="45" r="${isOutlier ? 7 : 6}" fill="${col}" stroke="#fff" stroke-width="1" style="filter: drop-shadow(0 0 5px ${glow});" />
      `;
    });

    // 6. Calculer le taux de "Crush Effect" (Écrasement)
    // Plage relative occupée par les 4 données saines sous Min-Max Normalization
    const mmSaines = minMaxData.slice(0, 4);
    const mmPlage = Math.max(...mmSaines) - Math.min(...mmSaines);
    const mmPercentage = mmPlage * 100;
    
    ssCard.querySelector("#normal-stats").innerText = `Plage des données saines : ${mmPercentage.toFixed(1)}%`;

    // 7. Panneau de diagnostic dynamique
    const ssDiag = ssCard.querySelector("#ss-diag-card");
    if (outlierVal === 30) {
      ssDiag.className = "ui-ss-diag-panel ss-diag-ok";
      ssDiag.innerHTML = `
        <div style="font-weight:bold; margin-bottom:4px;">🟢 Échelles Normales : Les deux méthodes sont optimales</div>
        <div style="font-size:0.85em; color:var(--sol-base0);">Aucune valeur extrême détectée. Les données saines [10, 15, 20, 25, 30] se répartissent harmonieusement sur toute la plage disponible.</div>
      `;
      ssCard.querySelector("#normal-stats").style.color = "var(--sol-green)";
    } else if (outlierVal < 100) {
      ssDiag.className = "ui-ss-diag-panel ss-diag-warn";
      ssDiag.innerHTML = `
        <div style="font-weight:bold; margin-bottom:4px;">⚠️ Effet d'écrasement modéré (Min-Max)</div>
        <div style="font-size:0.85em; color:var(--sol-base0);">L'outlier (X = ${outlierVal}) étire la plage totale. Les 4 données saines ne représentent plus que <strong>${mmPercentage.toFixed(1)}%</strong> de la boîte [0, 1]. Elles commencent à se tasser sur la gauche.</div>
      `;
      ssCard.querySelector("#normal-stats").style.color = "var(--sol-yellow)";
    } else {
      ssDiag.className = "ui-ss-diag-panel ss-diag-err";
      ssDiag.innerHTML = `
        <div style="font-weight:bold; margin-bottom:4px;">🔴 Alerte Écrasement Critique : Normalisation Inopérante !</div>
        <div style="font-size:0.85em; color:var(--sol-base0);">À cause de l'outlier extrême (X = ${outlierVal}), les données saines sont écrasées sur seulement <strong>${mmPercentage.toFixed(1)}%</strong> de la plage [0, 1] ! Elles deviennent virtuellement indissociables (tassées entre 0.00 et ${(25/outlierVal).toFixed(2)}). Le Z-Score, lui, préserve leur structure et leur distribution relative.</div>
      `;
      ssCard.querySelector("#normal-stats").style.color = "var(--sol-red)";
    }
  };

  // Liaison événements : Slider
  const slider = sliderPanel.querySelector("#ss-outlier-slider");
  const label = sliderPanel.querySelector("#ss-slider-label");

  slider.addEventListener("input", (e) => {
    const val = parseInt(e.target.value);
    
    // Mettre à jour l'étiquette texte
    if (val === 30) {
      label.innerText = `X = ${val} (Sain)`;
      label.style.color = "var(--sol-green)";
    } else if (val < 100) {
      label.innerText = `X = ${val} (Outlier modéré)`;
      label.style.color = "var(--sol-yellow)";
    } else {
      label.innerText = `X = ${val} (Outlier extrême !)`;
      label.style.color = "var(--sol-orange)";
    }

    renderScaling(val);
  });

  // Initialisation par défaut
  renderScaling(30);

  return container;
};

/**
 * 🌌 Simulateur Interactif de Nuage de Points (Scatter Plot)
 */
export const scatterSimulator = () => {
  const container = document.createElement("div");
  container.className = "ui-scatter-simulator";

  // Styles CSS localisés haut de gamme
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .ui-sc-container {
      background: var(--sol-base03);
      color: var(--sol-base0);
      border: 1px solid var(--sol-base02);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 25px;
      font-family: var(--font-sans);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }
    .ui-sc-title {
      font-family: var(--font-code);
      font-weight: 800;
      color: var(--sol-cyan);
      font-size: 1.1em;
      margin-bottom: 18px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      padding-bottom: 8px;
    }
    
    /* Contrôles */
    .ui-sc-controls {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      background: var(--sol-base02);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    @media (max-width: 600px) {
      .ui-sc-controls {
        grid-template-columns: 1fr;
      }
    }
    .ui-sc-control-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .ui-sc-label {
      font-size: 0.85em;
      font-weight: bold;
      color: var(--sol-base1);
    }
    .ui-sc-select {
      background: var(--sol-base03);
      color: var(--sol-base2);
      border: 1px solid var(--sol-base01);
      padding: 8px 12px;
      border-radius: 6px;
      font-family: var(--font-sans);
      outline: none;
    }
    .ui-sc-slider {
      width: 100%;
      height: 6px;
      background: var(--sol-base01);
      border-radius: 3px;
      outline: none;
      -webkit-appearance: none;
      cursor: pointer;
    }
    .ui-sc-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--sol-cyan);
      cursor: pointer;
    }
    
    /* Graph */
    .ui-sc-plot-card {
      background: #001e26;
      border: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 15px;
      position: relative;
    }
    .ui-sc-badge {
      position: absolute;
      top: 25px;
      right: 25px;
      font-family: var(--font-code);
      font-size: 0.8em;
      padding: 4px 10px;
      border-radius: 4px;
      background: rgba(42, 161, 152, 0.1);
      color: var(--sol-cyan);
      border: 1px solid var(--sol-cyan);
      font-weight: bold;
    }
    
    /* Explainer */
    .ui-sc-explain {
      background: var(--sol-base02);
      border-left: 4px solid var(--sol-cyan);
      border-radius: 4px;
      padding: 16px;
      font-size: 0.85em;
      line-height: 1.5;
    }
  `;
  container.appendChild(styleEl);

  const scCard = document.createElement("div");
  scCard.className = "ui-sc-container";
  container.appendChild(scCard);

  // Titre
  const titleDiv = document.createElement("div");
  titleDiv.className = "ui-sc-title";
  titleDiv.innerText = "🌌 Exemple Interactif : Explorer le Scatter Plot (Nuage de Points)";
  scCard.appendChild(titleDiv);

  // Contrôles
  const controls = document.createElement("div");
  controls.className = "ui-sc-controls";
  controls.innerHTML = `
    <div class="ui-sc-control-group">
      <label class="ui-sc-label">🧬 Relation mathématique :</label>
      <select class="ui-sc-select" id="sc-pattern">
        <option value="linear_pos">Corrélation linéaire positive (ex: Ventes vs Budget)</option>
        <option value="linear_neg">Corrélation linéaire négative (ex: Erreurs vs Expérience)</option>
        <option value="parabolic">Corrélation non-linéaire (U-Shape)</option>
        <option value="clusters">Segmentation en Groupes (Clusters distincts)</option>
        <option value="noise">Absence totale de corrélation (Bruit)</option>
      </select>
    </div>
    <div class="ui-sc-control-group">
      <div class="ui-sc-label" style="display:flex; justify-content:space-between;">
        <span>🌪️ Dispersion (Bruit statistique) :</span>
        <span id="sc-noise-label" style="font-family:var(--font-code); color:var(--sol-cyan);">Faible</span>
      </div>
      <input type="range" class="ui-sc-slider" id="sc-noise" min="5" max="80" value="15" style="margin-top:10px;">
    </div>
  `;
  scCard.appendChild(controls);

  // Plot Area
  const plotCard = document.createElement("div");
  plotCard.className = "ui-sc-plot-card";
  plotCard.innerHTML = `
    <div class="ui-sc-badge" id="sc-stat-badge">r = 0.00</div>
    <svg id="sc-svg" viewBox="0 0 500 300" width="100%" height="300" style="overflow:visible;"></svg>
  `;
  scCard.appendChild(plotCard);

  // Explainer
  const explainPanel = document.createElement("div");
  explainPanel.className = "ui-sc-explain";
  scCard.appendChild(explainPanel);

  // Génération déterministe pseudo-aléatoire
  let seed = 42;
  const random = () => {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const renderScatter = (pattern, noise) => {
    const svg = scCard.querySelector("#sc-svg");
    svg.innerHTML = "";
    
    seed = 42; // Reset seed to maintain layout consistency
    const points = [];
    const n = 50;

    // Calcul des coordonnées [0, 500] et [0, 300]
    if (pattern === "linear_pos") {
      for (let i = 0; i < n; i++) {
        const x = 50 + (i / n) * 400;
        const base_y = 250 - (i / n) * 200; // Positive slope in graph (y goes from 250 to 50)
        const y = base_y + (random() - 0.5) * noise * 2.5;
        points.push({ x, y });
      }
    } else if (pattern === "linear_neg") {
      for (let i = 0; i < n; i++) {
        const x = 50 + (i / n) * 400;
        const base_y = 50 + (i / n) * 200; // Negative slope in graph
        const y = base_y + (random() - 0.5) * noise * 2.5;
        points.push({ x, y });
      }
    } else if (pattern === "parabolic") {
      for (let i = 0; i < n; i++) {
        const x = 50 + (i / n) * 400;
        const norm_x = (x - 250) / 200; // Normalisé [-1, 1]
        const base_y = 80 + norm_x * norm_x * 160;
        const y = base_y + (random() - 0.5) * noise * 2.5;
        points.push({ x, y });
      }
    } else if (pattern === "clusters") {
      // Deux paquets distincts
      const n_half = n / 2;
      // Cluster A (bas-gauche)
      for (let i = 0; i < n_half; i++) {
        const x = 120 + (random() - 0.5) * (noise * 1.5 + 40);
        const y = 200 + (random() - 0.5) * (noise * 1.5 + 40);
        points.push({ x, y, cluster: "A" });
      }
      // Cluster B (haut-droite)
      for (let i = 0; i < n_half; i++) {
        const x = 360 + (random() - 0.5) * (noise * 1.5 + 40);
        const y = 80 + (random() - 0.5) * (noise * 1.5 + 40);
        points.push({ x, y, cluster: "B" });
      }
    } else if (pattern === "noise") {
      for (let i = 0; i < n; i++) {
        const x = 50 + random() * 400;
        const y = 50 + random() * 200;
        points.push({ x, y });
      }
    }

    // Limiter les points à l'intérieur du cadre
    points.forEach(p => {
      p.x = Math.max(30, Math.min(470, p.x));
      p.y = Math.max(30, Math.min(270, p.y));
    });

    // 1. Dessiner les axes et quadrillage
    svg.innerHTML += `
      <line x1="40" y1="20" x2="40" y2="280" stroke="var(--sol-base01)" stroke-width="1.5" />
      <line x1="40" y1="280" x2="480" y2="280" stroke="var(--sol-base01)" stroke-width="1.5" />
      <text x="40" y="15" font-family="var(--font-code)" font-size="8" fill="var(--sol-base1)">Variable Y (Continue)</text>
      <text x="480" y="295" font-family="var(--font-code)" font-size="8" fill="var(--sol-base1)" text-anchor="end">Variable X (Continue)</text>
    `;

    // 2. Calcul du coefficient de corrélation de Pearson r
    const meanX = points.reduce((acc, p) => acc + p.x, 0) / points.length;
    const meanY = points.reduce((acc, p) => acc + p.y, 0) / points.length;
    let num = 0;
    let denX = 0;
    let denY = 0;
    points.forEach(p => {
      const dx = p.x - meanX;
      // Inverser Y pour le calcul de corrélation car Y=0 est en haut en SVG
      const dy = meanY - p.y;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    });
    const r = denX * denY === 0 ? 0 : num / Math.sqrt(denX * denY);
    
    // Mettre à jour le badge de corrélation
    const badge = scCard.querySelector("#sc-stat-badge");
    badge.innerText = `Pearson r = ${r >= 0 ? "+" : ""}${r.toFixed(2)}`;

    // 3. Dessiner la ligne de tendance (Régression linéaire) pour les cas linéaires
    if (pattern === "linear_pos" || pattern === "linear_neg") {
      const b = num / denX;
      // En SVG : y = meanY - b * (x - meanX)
      const yStart = meanY - b * (40 - meanX);
      const yEnd = meanY - b * (460 - meanX);
      
      const pxYStart = Math.max(30, Math.min(270, yStart));
      const pxYEnd = Math.max(30, Math.min(270, yEnd));

      svg.innerHTML += `
        <line x1="40" y1="${pxYStart}" x2="460" y2="${pxYEnd}" stroke="var(--sol-magenta)" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.7" />
      `;
    }

    // 4. Dessiner les points du nuage
    points.forEach(p => {
      let color = "var(--sol-green)";
      let glow = "rgba(133, 153, 0, 0.4)";
      if (p.cluster) {
        color = p.cluster === "A" ? "var(--sol-blue)" : "var(--sol-orange)";
        glow = p.cluster === "A" ? "rgba(38, 139, 210, 0.4)" : "rgba(203, 75, 22, 0.4)";
      }
      svg.innerHTML += `
        <circle cx="${p.x}" cy="${p.y}" r="5.5" fill="${color}" stroke="#fff" stroke-width="1" style="filter: drop-shadow(0 0 4px ${glow});" />
      `;
    });

    // 5. Explications dynamiques
    let explanation = "";
    if (pattern === "linear_pos") {
      explanation = `
        <strong>Corrélation linéaire positive (r = ${r.toFixed(2)}) :</strong> Lorsque X augmente, Y augmente de façon proportionnelle. La ligne de tendance pointillée matérialise cette corrélation. <br>
        <span style="color:var(--sol-green); font-weight:bold;">💡 Décryptage :</span> Une dispersion faible (curseur à gauche) indique que la variable X explique presque à elle seule la variable Y. Utile pour projeter des tendances simples.
      `;
      explainPanel.style.borderLeftColor = "var(--sol-green)";
    } else if (pattern === "linear_neg") {
      explanation = `
        <strong>Corrélation linéaire négative (r = ${r.toFixed(2)}) :</strong> Lorsque X augmente, Y diminue de façon constante. C'est typiquement le cas lors de l'apprentissage (les erreurs chutent avec le temps).<br>
        <span style="color:var(--sol-green); font-weight:bold;">💡 Décryptage :</span> Les points se concentrent le long d'une droite de pente négative. Idéal pour matérialiser les gains d'efficacité.
      `;
      explainPanel.style.borderLeftColor = "var(--sol-cyan)";
    } else if (pattern === "parabolic") {
      explanation = `
        <strong>Relation non-linéaire (U-Shape, r = ${r.toFixed(2)}) :</strong> Le coefficient de Pearson $r$ est proche de 0, suggérant à tort qu'il n'y a pas de lien entre X et Y ! Pourtant, le graphique montre une structure parabolique très nette.<br>
        <span style="color:var(--sol-orange); font-weight:bold;">⚠️ Leçon cruciale :</span> Un coefficient $r$ nul ne signifie pas qu'il n'y a pas de lien, mais simplement qu'il n'y a pas de lien **linéaire**. Regarder le graphique est indispensable pour ne pas passer à côté de cette forme en U.
      `;
      explainPanel.style.borderLeftColor = "var(--sol-orange)";
    } else if (pattern === "clusters") {
      explanation = `
        <strong>Segmentation en Clusters distincts :</strong> Les données se partagent naturellement en deux îles isolées (clientèle économe en bleu vs clientèle premium en orange).<br>
        <span style="color:var(--sol-green); font-weight:bold;">💡 Décryptage :</span> Un modèle d'IA cherchant à faire des moyennes globales ici échouera, car il visera le vide situé au milieu des deux groupes. Il faut diviser l'audience avant de l'analyser !
      `;
      explainPanel.style.borderLeftColor = "var(--sol-blue)";
    } else if (pattern === "noise") {
      explanation = `
        <strong>Absence totale de corrélation (r = ${r.toFixed(2)}) :</strong> Dispersion chaotique et aléatoire. La connaissance de la variable X ne vous donne absolument aucun indice sur la valeur de Y.<br>
        <span style="color:var(--sol-red); font-weight:bold;">⚠️ Leçon cruciale :</span> C'est le bruit. Vouloir forcer un modèle d'IA à prédire Y à partir de X dans ces conditions mènerait inévitablement à du surapprentissage pur.
      `;
      explainPanel.style.borderLeftColor = "var(--sol-red)";
    }

    explainPanel.innerHTML = explanation;
  };

  // Liaison événements : Contrôles
  const patternSelect = scCard.querySelector("#sc-pattern");
  const noiseSlider = scCard.querySelector("#sc-noise");
  const noiseLabel = scCard.querySelector("#sc-noise-label");

  const updateSC = () => {
    const pat = patternSelect.value;
    const noise = parseInt(noiseSlider.value);
    
    // Label de dispersion
    if (noise < 20) {
      noiseLabel.innerText = "Faible";
      noiseLabel.style.color = "var(--sol-green)";
    } else if (noise < 50) {
      noiseLabel.innerText = "Modérée";
      noiseLabel.style.color = "var(--sol-yellow)";
    } else {
      noiseLabel.innerText = "Forte (Bruit critique)";
      noiseLabel.style.color = "var(--sol-orange)";
    }

    renderScatter(pat, noise);
  };

  patternSelect.addEventListener("change", updateSC);
  noiseSlider.addEventListener("input", updateSC);

  // Initialisation par défaut
  renderScatter("linear_pos", 15);

  return container;
};

/**
 * 📈 Simulateur Interactif de Graphique Linéaire (Line Plot)
 */
export const lineSimulator = () => {
  const container = document.createElement("div");
  container.className = "ui-line-simulator";

  // Styles CSS localisés de qualité premium
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .ui-ln-container {
      background: var(--sol-base03);
      color: var(--sol-base0);
      border: 1px solid var(--sol-base02);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 25px;
      font-family: var(--font-sans);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }
    .ui-ln-title {
      font-family: var(--font-code);
      font-weight: 800;
      color: var(--sol-cyan);
      font-size: 1.1em;
      margin-bottom: 18px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      padding-bottom: 8px;
    }
    
    /* Contrôles */
    .ui-ln-controls {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      background: var(--sol-base02);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    @media (max-width: 600px) {
      .ui-ln-controls {
        grid-template-columns: 1fr;
      }
    }
    .ui-ln-control-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .ui-ln-label {
      font-size: 0.85em;
      font-weight: bold;
      color: var(--sol-base1);
    }
    .ui-ln-select {
      background: var(--sol-base03);
      color: var(--sol-base2);
      border: 1px solid var(--sol-base01);
      padding: 8px 12px;
      border-radius: 6px;
      font-family: var(--font-sans);
      outline: none;
    }
    
    /* Graph */
    .ui-ln-plot-card {
      background: #001e26;
      border: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 15px;
    }
    
    /* Explainer */
    .ui-ln-explain {
      background: var(--sol-base02);
      border-left: 4px solid var(--sol-cyan);
      border-radius: 4px;
      padding: 16px;
      font-size: 0.85em;
      line-height: 1.5;
      transition: border-color 0.3s ease;
    }
  `;
  container.appendChild(styleEl);

  const lnCard = document.createElement("div");
  lnCard.className = "ui-ln-container";
  container.appendChild(lnCard);

  // Titre
  const titleDiv = document.createElement("div");
  titleDiv.className = "ui-ln-title";
  titleDiv.innerText = "📈 Exemple Interactif : La Règle d'Or du Line Plot (Graphique Linéaire)";
  lnCard.appendChild(titleDiv);

  // Contrôles
  const controls = document.createElement("div");
  controls.className = "ui-ln-controls";
  controls.innerHTML = `
    <div class="ui-ln-control-group">
      <label class="ui-ln-label">🕰️ Ordre de l'axe temporel (Axe X) :</label>
      <select class="ui-ln-select" id="ln-order">
        <option value="chrono">Chronologique : Jan, Fév, Mar, Avr, Mai, Jun (Correct !)</option>
        <option value="shuffled">Mélangé : Mar, Jan, Jun, Fév, Mai, Avr (Piège !)</option>
      </select>
    </div>
    <div class="ui-ln-control-group">
      <label class="ui-ln-label">📈 Lissage de courbe :</label>
      <select class="ui-ln-select" id="ln-smooth">
        <option value="none">Aucun lissage (Données Brutes)</option>
        <option value="ma">Moyenne Mobile (Lissage tendance)</option>
      </select>
    </div>
  `;
  lnCard.appendChild(controls);

  // Plot Area
  const plotCard = document.createElement("div");
  plotCard.className = "ui-ln-plot-card";
  plotCard.innerHTML = `
    <svg id="ln-svg" viewBox="0 0 500 200" width="100%" height="200" style="overflow:visible;"></svg>
  `;
  lnCard.appendChild(plotCard);

  // Explainer
  const explainPanel = document.createElement("div");
  explainPanel.className = "ui-ln-explain";
  lnCard.appendChild(explainPanel);

  // Données mensuelles ordonnées d'origine
  const orderedData = [
    { label: "Jan", val: 80, x: 50 },
    { label: "Fév", val: 120, x: 130 },
    { label: "Mar", val: 95, x: 210 },
    { label: "Avr", val: 150, x: 290 },
    { label: "Mai", val: 140, x: 370 },
    { label: "Jun", val: 190, x: 450 }
  ];

  // Données désordonnées (mélangées)
  const shuffledData = [
    { label: "Mar", val: 95, x: 50 },
    { label: "Jan", val: 80, x: 130 },
    { label: "Jun", val: 190, x: 210 },
    { label: "Fév", val: 120, x: 290 },
    { label: "Mai", val: 140, x: 370 },
    { label: "Avr", val: 150, x: 450 }
  ];

  const renderLine = (orderMode, smoothMode) => {
    const svg = lnCard.querySelector("#ln-svg");
    svg.innerHTML = "";

    const activeData = orderMode === "chrono" ? orderedData : shuffledData;

    // 1. Dessiner axes
    svg.innerHTML += `
      <line x1="40" y1="20" x2="40" y2="170" stroke="var(--sol-base01)" stroke-width="1.5" />
      <line x1="40" y1="170" x2="480" y2="170" stroke="var(--sol-base01)" stroke-width="1.5" />
      <text x="40" y="15" font-family="var(--font-code)" font-size="8" fill="var(--sol-base1)">Ventes (k€)</text>
    `;

    // Fonction d'échelle Y de [0, 220] maps to px [170, 30] (inversé)
    const scaleY = (val) => 170 - (val / 220) * 140;

    // Dessiner les étiquettes de l'axe X
    activeData.forEach(d => {
      svg.innerHTML += `
        <line x1="${d.x}" y1="170" x2="${d.x}" y2="175" stroke="var(--sol-base01)" stroke-width="1" />
        <text x="${d.x}" y="190" font-family="var(--font-code)" font-size="9" fill="var(--sol-base01)" text-anchor="middle">${d.label}</text>
      `;
    });

    // Calculer les valeurs finales (avec ou sans moyenne mobile)
    let plottedValues = activeData.map(d => d.val);
    if (smoothMode === "ma") {
      // Moyenne mobile d'ordre 2 : v_smoothed[i] = (v[i-1] + v[i]) / 2 (premier point inchangé)
      plottedValues = activeData.map((d, idx) => {
        if (idx === 0) return d.val;
        return (activeData[idx - 1].val + d.val) / 2;
      });
    }

    // 2. Construire la trajectoire (Path)
    let pathD = "";
    activeData.forEach((d, idx) => {
      const py = scaleY(plottedValues[idx]);
      if (idx === 0) {
        pathD += `M ${d.x} ${py}`;
      } else {
        pathD += ` L ${d.x} ${py}`;
      }
    });

    // Dessiner le tracé principal de la ligne
    const lineCol = orderMode === "chrono" ? "var(--sol-cyan)" : "var(--sol-red)";
    const glow = orderMode === "chrono" ? "rgba(42, 161, 152, 0.4)" : "rgba(220, 50, 47, 0.4)";
    
    svg.innerHTML += `
      <path d="${pathD}" fill="none" stroke="${lineCol}" stroke-width="2.5" 
            style="filter: drop-shadow(0 0 5px ${glow});" />
    `;

    // 3. Ploter les points
    activeData.forEach((d, idx) => {
      const py = scaleY(plottedValues[idx]);
      svg.innerHTML += `
        <circle cx="${d.x}" cy="${py}" r="5" fill="${lineCol}" stroke="#fff" stroke-width="1" />
        <text x="${d.x}" y="${py - 10}" font-family="var(--font-code)" font-size="8" fill="var(--sol-base1)" text-anchor="middle">${d.val}</text>
      `;
    });

    // 4. Explications dynamiques et règles d'or
    let explanation = "";
    if (orderMode === "chrono") {
      explainPanel.style.borderLeftColor = "var(--sol-cyan)";
      if (smoothMode === "none") {
        explanation = `
          <strong>Ligne Chronologique Ordonnée (Correct) :</strong> La ligne relie les mois dans leur ordre naturel d'écoulement. L'œil saisit immédiatement la tendance globale, les baisses saisonnières (mars) et l'accélération en juin.<br>
          <span style="color:var(--sol-green); font-weight:bold;">🟢 Causalité respectée :</span> La ligne prend tout son sens, car elle matérialise une continuité temporelle réelle.
        `;
      } else {
        explanation = `
          <strong>Ligne Lissée (Moyenne Mobile active) :</strong> Les fluctuations brusques d'un mois sur l'autre sont atténuées. Cela permet de révéler la tendance de fond à plus long terme (croissance constante).<br>
          <span style="color:var(--sol-green); font-weight:bold;">🟢 Tendance claire :</span> Le lissage est très utile pour filtrer le bruit sur des séries temporelles complexes.
        `;
      }
    } else {
      explainPanel.style.borderLeftColor = "var(--sol-red)";
      explanation = `
        <strong>🔴 Piège du Spaghetti Plot (Ordre violé) :</strong> Regardez ce gribouillage ! Les mois ont été mélangés sur l'axe X (mars avant janvier, etc.). Connecter ces points par une ligne suggère un lien de cause à effet ou un mouvement temporel qui n'existe absolument pas.<br>
        <span style="color:var(--sol-red); font-weight:bold;">⚠️ La Règle d'Or violée :</span> Si l'ordre de vos points sur l'axe X peut être mélangé (ex: des catégories comme des villes ou des pays), <strong>vous ne devez jamais tracer de ligne</strong>. Utilisez un Scatter Plot (nuage) ou un Bar Plot !
      `;
    }

    explainPanel.innerHTML = explanation;
  };

  // Liaison événements : Contrôles
  const orderSelect = lnCard.querySelector("#ln-order");
  const smoothSelect = lnCard.querySelector("#ln-smooth");

  const updateLN = () => {
    renderLine(orderSelect.value, smoothSelect.value);
  };

  orderSelect.addEventListener("change", updateLN);
  smoothSelect.addEventListener("change", updateLN);

  // Initialisation par défaut
  renderLine("chrono", "none");

  return container;
};

/**
 * 🫧 Simulateur Interactif de Bubble Plot (Graphique à Bulles)
 */
export const bubbleSimulator = () => {
  const container = document.createElement("div");
  container.className = "ui-bubble-simulator";

  // Styles CSS localisés haut de gamme
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .ui-bb-container {
      background: var(--sol-base03);
      color: var(--sol-base0);
      border: 1px solid var(--sol-base02);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 25px;
      font-family: var(--font-sans);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }
    .ui-bb-title {
      font-family: var(--font-code);
      font-weight: 800;
      color: var(--sol-cyan);
      font-size: 1.1em;
      margin-bottom: 18px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      padding-bottom: 8px;
    }
    
    /* Contrôles */
    .ui-bb-controls {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      background: var(--sol-base02);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    @media (max-width: 600px) {
      .ui-bb-controls {
        grid-template-columns: 1fr;
      }
    }
    .ui-bb-control-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .ui-bb-label {
      font-size: 0.85em;
      font-weight: bold;
      color: var(--sol-base1);
    }
    .ui-bb-select {
      background: var(--sol-base03);
      color: var(--sol-base2);
      border: 1px solid var(--sol-base01);
      padding: 8px 12px;
      border-radius: 6px;
      font-family: var(--font-sans);
      outline: none;
    }
    
    /* Graph */
    .ui-bb-plot-card {
      background: #001e26;
      border: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      border-radius: 8px;
      padding: 16px;
      position: relative;
      margin-bottom: 15px;
    }
    .ui-bb-tooltip {
      position: absolute;
      background: var(--sol-base02);
      border: 1px solid var(--sol-cyan);
      color: var(--sol-base2);
      padding: 10px 14px;
      border-radius: 6px;
      font-size: 0.8em;
      pointer-events: none;
      display: none;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
      z-index: 10;
      max-width: 200px;
      line-height: 1.4;
    }
    
    /* Explainer */
    .ui-bb-explain {
      background: var(--sol-base02);
      border-left: 4px solid var(--sol-cyan);
      border-radius: 4px;
      padding: 16px;
      font-size: 0.85em;
      line-height: 1.5;
    }
  `;
  container.appendChild(styleEl);

  const bbCard = document.createElement("div");
  bbCard.className = "ui-bb-container";
  container.appendChild(bbCard);

  // Titre
  const titleDiv = document.createElement("div");
  titleDiv.className = "ui-bb-title";
  titleDiv.innerText = "🫧 Exemple Interactif : Le Bubble Plot (Taille & Couleur en 4D)";
  bbCard.appendChild(titleDiv);

  // Contrôles
  const controls = document.createElement("div");
  controls.className = "ui-bb-controls";
  controls.innerHTML = `
    <div class="ui-bb-control-group">
      <label class="ui-bb-label">⚖️ Dimension 3 : Variable encodée par la Taille (Z) :</label>
      <select class="ui-bb-select" id="bb-size-var">
        <option value="pop">Population du pays (Milliers à Millions)</option>
        <option value="health">Dépenses de santé (% PIB)</option>
        <option value="constant">Taille constante (Scatter classique 2D)</option>
      </select>
    </div>
    <div class="ui-bb-control-group">
      <label class="ui-bb-label">🎨 Dimension 4 : Variable encodée par la Couleur :</label>
      <select class="ui-bb-select" id="bb-color-var">
        <option value="continent">Continent (Catégorielle : Europe, Asie...)</option>
        <option value="carbon">Empreinte carbone (Continue : Dégradé Vert ➔ Rouge)</option>
      </select>
    </div>
  `;
  bbCard.appendChild(controls);

  // Plot Area
  const plotCard = document.createElement("div");
  plotCard.className = "ui-bb-plot-card";
  plotCard.innerHTML = `
    <div class="ui-bb-tooltip" id="bb-tip"></div>
    <svg id="bb-svg" viewBox="0 0 500 300" width="100%" height="300" style="overflow:visible;"></svg>
  `;
  bbCard.appendChild(plotCard);

  // Explainer
  const explainPanel = document.createElement("div");
  explainPanel.className = "ui-bb-explain";
  bbCard.appendChild(explainPanel);

  // Dataset pays 4D
  const countries = [
    { name: "Norvège", pib: 82000, life: 83.2, pop: 5.4, health: 10.5, continent: "Europe", carbon: 7.2 },
    { name: "Inde", pib: 2300, life: 70.1, pop: 1400.0, health: 3.5, continent: "Asie", carbon: 1.9 },
    { name: "États-Unis", pib: 70000, life: 77.3, pop: 332.0, health: 16.8, continent: "Amériques", carbon: 14.5 },
    { name: "Kenya", pib: 2100, life: 62.7, pop: 55.0, health: 4.8, continent: "Afrique", carbon: 0.4 },
    { name: "Chine", pib: 12500, life: 78.2, pop: 1412.0, health: 5.4, continent: "Asie", carbon: 7.6 },
    { name: "Allemagne", pib: 51000, life: 80.9, pop: 83.2, health: 11.7, continent: "Europe", carbon: 7.9 },
    { name: "Brésil", pib: 7500, life: 76.2, pop: 214.0, health: 9.6, continent: "Amériques", carbon: 2.2 },
    { name: "Sénégal", pib: 1600, life: 67.9, pop: 17.2, health: 4.1, continent: "Afrique", carbon: 0.6 }
  ];

  const renderBubble = (sizeVar, colorVar) => {
    const svg = bbCard.querySelector("#bb-svg");
    const tip = bbCard.querySelector("#bb-tip");
    svg.innerHTML = "";

    // 1. Dessiner axes
    svg.innerHTML += `
      <line x1="45" y1="20" x2="45" y2="260" stroke="var(--sol-base01)" stroke-width="1.5" />
      <line x1="45" y1="260" x2="480" y2="260" stroke="var(--sol-base01)" stroke-width="1.5" />
      <text x="45" y="15" font-family="var(--font-code)" font-size="8" fill="var(--sol-base1)">Espérance de Vie (Années)</text>
      <text x="480" y="275" font-family="var(--font-code)" font-size="8" fill="var(--sol-base1)" text-anchor="end">PIB par Habitant ($ Log)</text>
    `;

    // Échelle X logarithmique simplifiée : PIB 1000 à 100 000 maps to px [60, 460]
    const scaleX = (pib) => 60 + (Math.log10(pib) - 3) * 200;
    // Échelle Y : Espérance de vie 60 à 85 maps to px [250, 30]
    const scaleY = (life) => 250 - ((life - 60) / 25) * 220;

    // Rendu des bulles
    countries.forEach(c => {
      const px = scaleX(c.pib);
      const py = scaleY(c.life);

      // Calcul de la taille de bulle Z
      let radius = 6;
      if (sizeVar === "pop") {
        // Population : échelle racine carrée pour le ratio de surface
        radius = 4 + Math.sqrt(c.pop) * 0.9;
      } else if (sizeVar === "health") {
        radius = 3 + c.health * 1.2;
      }

      // Calcul de la couleur
      let color = "var(--sol-cyan)";
      if (colorVar === "continent") {
        const colors = {
          "Europe": "var(--sol-blue)",
          "Asie": "var(--sol-orange)",
          "Amériques": "var(--sol-green)",
          "Afrique": "var(--sol-yellow)"
        };
        color = colors[c.continent] || "var(--sol-cyan)";
      } else if (colorVar === "carbon") {
        // Dégradé vert (faible carbone) à rouge (fort carbone)
        const ratio = Math.min(1.0, c.carbon / 15.0);
        // HSL Interpolation de 120 (Vert) à 0 (Rouge)
        const hue = 120 - ratio * 120;
        color = `hsl(${hue}, 70%, 45%)`;
      }

      // Dessiner la bulle
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", px);
      circle.setAttribute("cy", py);
      circle.setAttribute("r", radius);
      circle.setAttribute("fill", color);
      circle.setAttribute("stroke", "#fff");
      circle.setAttribute("stroke-width", "1");
      circle.setAttribute("opacity", "0.75");
      circle.style.cursor = "pointer";
      circle.style.transition = "r 0.3s ease, fill 0.3s ease";

      // Hover events
      circle.addEventListener("mouseenter", (e) => {
        circle.setAttribute("opacity", "1.0");
        circle.setAttribute("stroke-width", "2");
        
        let zText = "";
        if (sizeVar === "pop") zText = `<br><b>Population</b> : ${c.pop} M`;
        else if (sizeVar === "health") zText = `<br><b>Dépenses Santé</b> : ${c.health}% PIB`;

        let colorText = "";
        if (colorVar === "continent") colorText = `<br><b>Continent</b> : ${c.continent}`;
        else if (colorVar === "carbon") colorText = `<br><b>Carbone</b> : ${c.carbon} t/hab`;

        tip.innerHTML = `
          <b>${c.name}</b><br>
          <b>PIB/hab</b> : ${c.pib.toLocaleString()} $<br>
          <b>Espérance</b> : ${c.life} ans
          ${zText}
          ${colorText}
        `;
        tip.style.display = "block";
        tip.style.left = `${px + 15}px`;
        tip.style.top = `${py - 20}px`;
      });

      circle.addEventListener("mousemove", (e) => {
        tip.style.left = `${px + 15}px`;
        tip.style.top = `${py - 20}px`;
      });

      circle.addEventListener("mouseleave", () => {
        circle.setAttribute("opacity", "0.75");
        circle.setAttribute("stroke-width", "1");
        tip.style.display = "none";
      });

      svg.appendChild(circle);

      // Label pays discret si la bulle est assez grosse ou pays important
      if (c.pop > 100 || c.pib > 50000 || sizeVar === "constant") {
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", px);
        text.setAttribute("y", py - radius - 4);
        text.setAttribute("font-family", "var(--font-code)");
        text.setAttribute("font-size", "7.5");
        text.setAttribute("fill", "var(--sol-base1)");
        text.setAttribute("text-anchor", "middle");
        text.style.pointerEvents = "none";
        text.textContent = c.name;
        svg.appendChild(text);
      }
    });

    // 4. Explication pédagogique
    let explanation = `
      <strong>Comment lire ce Bubble Plot ?</strong> <br>
      • <b>Axe X</b> : Richesse du pays (PIB/habitant en échelle logarithmique).<br>
      • <b>Axe Y</b> : Santé (Espérance de vie en années).<br>
    `;
    if (sizeVar !== "constant") {
      explanation += `• <b>Taille (Axe Z)</b> : Visualise la variable <i>${sizeVar === "pop" ? "Population" : "Dépenses de santé"}</i>. Plus la bulle est grosse, plus le pays a une valeur élevée.<br>`;
    }
    if (colorVar === "continent") {
      explanation += `• <b>Couleur (4e Dimension)</b> : Identifie les continents de manière catégorielle (les pays d'Asie sont orange, l'Europe en bleu, etc.).`;
    } else {
      explanation += `• <b>Couleur (4e Dimension)</b> : Identifie l'empreinte carbone continue (du vert sain pour les faibles émetteurs au rouge pour les gros pollueurs).`;
    }

    explainPanel.innerHTML = explanation;
  };

  // Liaison événements : Clics
  const sizeSelect = bbCard.querySelector("#bb-size-var");
  const colorSelect = bbCard.querySelector("#bb-color-var");

  const updateBB = () => {
    renderBubble(sizeSelect.value, colorSelect.value);
  };

  sizeSelect.addEventListener("change", updateBB);
  colorSelect.addEventListener("change", updateBB);

  // Initialisation par défaut
  renderBubble("pop", "continent");

  return container;
};

/**
 * 🔥 Simulateur Interactif de Heatmap de Corrélation
 */
export const heatmapSimulator = () => {
  const container = document.createElement("div");
  container.className = "ui-heatmap-simulator";

  // Styles CSS localisés haut de gamme
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .ui-hm-container {
      background: var(--sol-base03);
      color: var(--sol-base0);
      border: 1px solid var(--sol-base02);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 25px;
      font-family: var(--font-sans);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }
    .ui-hm-title {
      font-family: var(--font-code);
      font-weight: 800;
      color: var(--sol-cyan);
      font-size: 1.1em;
      margin-bottom: 18px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      padding-bottom: 8px;
    }
    
    /* Contrôles */
    .ui-hm-controls {
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: var(--sol-base02);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .ui-hm-label {
      font-size: 0.85em;
      font-weight: bold;
      color: var(--sol-base1);
    }
    .ui-hm-select {
      background: var(--sol-base03);
      color: var(--sol-base2);
      border: 1px solid var(--sol-base01);
      padding: 8px 12px;
      border-radius: 6px;
      font-family: var(--font-sans);
      outline: none;
    }
    
    /* Grid */
    .ui-hm-workspace {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 20px;
      align-items: center;
    }
    @media (max-width: 768px) {
      .ui-hm-workspace {
        grid-template-columns: 1fr;
      }
    }
    .ui-hm-grid-box {
      background: #001e26;
      border: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      border-radius: 8px;
      padding: 16px;
      display: flex;
      justify-content: center;
    }
    
    /* Explainer */
    .ui-hm-explain {
      background: var(--sol-base02);
      border-left: 4px solid var(--sol-cyan);
      border-radius: 4px;
      padding: 16px;
      font-size: 0.85em;
      line-height: 1.5;
      min-height: 150px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      transition: border-color 0.3s ease;
    }
  `;
  container.appendChild(styleEl);

  const hmCard = document.createElement("div");
  hmCard.className = "ui-hm-container";
  container.appendChild(hmCard);

  // Titre
  const titleDiv = document.createElement("div");
  titleDiv.className = "ui-hm-title";
  titleDiv.innerText = "🔥 Exemple Interactif : Décoder une Heatmap de Corrélation";
  hmCard.appendChild(titleDiv);

  // Contrôles
  const controls = document.createElement("div");
  controls.className = "ui-hm-controls";
  controls.innerHTML = `
    <label class="ui-hm-label">📈 Scénario d'étude marketing :</label>
    <select class="ui-hm-select" id="hm-scenario">
      <option value="success">Scénario A : Campagne marketing hautement réussie</option>
      <option value="failure">Scénario B : Problème de qualité produit majeur</option>
      <option value="random">Scénario C : Données décorrélées (Bruit de collecte)</option>
    </select>
  `;
  hmCard.appendChild(controls);

  // Workspace Grid + Details
  const workspace = document.createElement("div");
  workspace.className = "ui-hm-workspace";
  workspace.innerHTML = `
    <div class="ui-hm-grid-box">
      <svg id="hm-svg" viewBox="0 0 340 320" width="100%" height="320" style="overflow:visible;"></svg>
    </div>
    <div class="ui-hm-explain" id="hm-details">
      Survolez une cellule de la matrice de corrélation pour obtenir son diagnostic statistique et métier précis.
    </div>
  `;
  hmCard.appendChild(workspace);

  // Matrices de corrélation pré-définies
  const variablesList = ["Ventes", "Budget", "Plaintes", "Score_Avis"];

  const scenarios = {
    success: [
      [1.00, 0.85, -0.15, 0.65],  // Ventes
      [0.85, 1.00, -0.05, 0.40],  // Budget
      [-0.15, -0.05, 1.00, -0.80], // Plaintes
      [0.65, 0.40, -0.80, 1.00]   // Score_Avis
    ],
    failure: [
      [1.00, 0.20, 0.75, -0.85],  // Ventes
      [0.20, 1.00, 0.10, -0.05],  // Budget
      [0.75, 0.10, 1.00, -0.92],  // Plaintes
      [-0.85, -0.05, -0.92, 1.00]  // Score_Avis
    ],
    random: [
      [1.00, 0.04, -0.09, 0.12],  // Ventes
      [0.04, 1.00, 0.08, -0.03],  // Budget
      [-0.09, 0.08, 1.00, -0.11], // Plaintes
      [0.12, -0.03, -0.11, 1.00]  // Score_Avis
    ]
  };

  const renderHeatmap = (scenKey) => {
    const svg = hmCard.querySelector("#hm-svg");
    const details = hmCard.querySelector("#hm-details");
    svg.innerHTML = "";

    const matrix = scenarios[scenKey];

    // Constantes de grille
    const xStart = 80;
    const yStart = 30;
    const size = 50;

    // 1. Dessiner les labels d'axes
    variablesList.forEach((v, idx) => {
      // Axe Y (Ligne)
      svg.innerHTML += `
        <text x="${xStart - 10}" y="${yStart + idx * size + size / 2 + 3}" 
              font-family="var(--font-code)" font-size="8.5" fill="var(--sol-base1)" text-anchor="end">${v}</text>
      `;
      // Axe X (Colonne)
      svg.innerHTML += `
        <text x="${xStart + idx * size + size / 2}" y="${yStart - 8}" 
              font-family="var(--font-code)" font-size="8.5" fill="var(--sol-base1)" text-anchor="middle">${v}</text>
      `;
    });

    // 2. Dessiner les cellules
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = matrix[r][c];
        
        // Diverging Color Map : Bleu (Positif +1.0) ➔ Blanc (Neutre 0.0) ➔ Rouge (Négatif -1.0)
        let color = "#ffffff";
        let textColor = "var(--sol-base03)";
        if (val > 0) {
          // Bleu standard HSL(195, 70%, L)
          const lightness = 95 - val * 45;
          color = `hsl(195, 70%, ${lightness}%)`;
          if (val > 0.6) textColor = "#ffffff";
        } else if (val < 0) {
          // Rouge/Orange standard HSL(10, 70%, L)
          const lightness = 95 - Math.abs(val) * 45;
          color = `hsl(10, 70%, ${lightness}%)`;
          if (Math.abs(val) > 0.6) textColor = "#ffffff";
        } else {
          color = "var(--sol-base02)";
          textColor = "var(--sol-base1)";
        }

        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", xStart + c * size);
        rect.setAttribute("y", yStart + r * size);
        rect.setAttribute("width", size - 2);
        rect.setAttribute("height", size - 2);
        rect.setAttribute("fill", color);
        rect.setAttribute("rx", "4");
        rect.style.cursor = "pointer";
        rect.style.transition = "transform 0.15s ease, stroke-width 0.15s ease";

        // Text value
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", xStart + c * size + size / 2);
        text.setAttribute("y", yStart + r * size + size / 2 + 3);
        text.setAttribute("font-family", "var(--font-code)");
        text.setAttribute("font-size", "9");
        text.setAttribute("fill", textColor);
        text.setAttribute("text-anchor", "middle");
        text.style.pointerEvents = "none";
        text.textContent = val >= 0 ? `+${val.toFixed(2)}` : val.toFixed(2);

        // Hover diagnostics
        rect.addEventListener("mouseenter", () => {
          rect.setAttribute("stroke", "var(--sol-cyan)");
          rect.setAttribute("stroke-width", "2");
          rect.style.transform = "scale(1.05)";
          rect.style.transformOrigin = `${xStart + c * size + size / 2}px ${yStart + r * size + size / 2}px`;
          
          let diag = "";
          const v1 = variablesList[r];
          const v2 = variablesList[c];

          if (r === c) {
            diag = `
              <div style="font-weight:bold; color:var(--sol-cyan); margin-bottom:6px;">🔗 Auto-Corrélation parfaite (${v1} / ${v2})</div>
              <div>Une variable est toujours parfaitement corrélée à elle-même (r = 1.00). C'est la diagonale pivot de la matrice.</div>
            `;
            details.style.borderLeftColor = "var(--sol-cyan)";
          } else if (val >= 0.7) {
            diag = `
              <div style="font-weight:bold; color:var(--sol-blue); margin-bottom:6px;">📈 Très forte corrélation positive (+${val.toFixed(2)})</div>
              <div><strong>${v1}</strong> et <strong>${v2}</strong> progressent de concert. <br>
              <span style="color:var(--sol-green);">💡 Métier :</span> Dans ce scénario, chaque dollar dépensé en budget pub se traduit par une envolée spectaculaire des ventes. Liaison stable et valide.</div>
            `;
            details.style.borderLeftColor = "var(--sol-blue)";
          } else if (val <= -0.7) {
            diag = `
              <div style="font-weight:bold; color:var(--sol-red); margin-bottom:6px;">📉 Très forte corrélation négative (${val.toFixed(2)})</div>
              <div><strong>${v1}</strong> et <strong>${v2}</strong> évoluent en sens opposé de façon critique.<br>
              <span style="color:var(--sol-red);">💡 Métier :</span> Une hausse tragique des plaintes détruit instantanément le score d'avis client moyen. C'est une alerte de crise opérationnelle majeure.</div>
            `;
            details.style.borderLeftColor = "var(--sol-red)";
          } else if (Math.abs(val) < 0.2) {
            diag = `
              <div style="font-weight:bold; color:var(--sol-base1); margin-bottom:6px;">⚪ Absence de liaison (${val.toFixed(2)})</div>
              <div><strong>${v1}</strong> et <strong>${v2}</strong> sont statistiquement indépendantes. <br>
              <span style="color:var(--sol-yellow);">💡 Métier :</span> Le volume de plaintes ou le score d'avis n'a aucune influence détectable sur les variations du budget de publicité. C'est cohérent.</div>
            `;
            details.style.borderLeftColor = "var(--sol-base1)";
          } else {
            diag = `
              <div style="font-weight:bold; color:var(--sol-orange); margin-bottom:6px;">🟡 Corrélation modérée (${val >= 0 ? "+" : ""}${val.toFixed(2)})</div>
              <div>Une liaison existe mais reste perturbée par d'autres facteurs externes. Une analyse plus fine est nécessaire pour dissocier les variables.</div>
            `;
            details.style.borderLeftColor = "var(--sol-orange)";
          }

          details.innerHTML = diag;
        });

        rect.addEventListener("mouseleave", () => {
          rect.removeAttribute("stroke");
          rect.removeAttribute("stroke-width");
          rect.style.transform = "none";
        });

        svg.appendChild(rect);
        svg.appendChild(text);
      }
    }
  };

  // Liaison événements : Contrôles
  const scenSelect = hmCard.querySelector("#hm-scenario");
  scenSelect.addEventListener("change", (e) => {
    renderHeatmap(e.target.value);
    hmCard.querySelector("#hm-details").innerHTML = "Survolez une cellule de la matrice de corrélation pour obtenir son diagnostic statistique et métier précis.";
    hmCard.querySelector("#hm-details").style.borderLeftColor = "var(--sol-cyan)";
  });

  // Initialisation par défaut
  renderHeatmap("success");

  return container;
};

/**
 * 🌍 Simulateur Interactif de Carte Choroplèthe Vectorielle
 */
export const choroplethSimulator = () => {
  const container = document.createElement("div");
  container.className = "ui-choropleth-simulator";

  // Styles CSS localisés haut de gamme
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .ui-cp-container {
      background: var(--sol-base03);
      color: var(--sol-base0);
      border: 1px solid var(--sol-base02);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 25px;
      font-family: var(--font-sans);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }
    .ui-cp-title {
      font-family: var(--font-code);
      font-weight: 800;
      color: var(--sol-cyan);
      font-size: 1.1em;
      margin-bottom: 18px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      padding-bottom: 8px;
    }
    
    /* Contrôles */
    .ui-cp-controls {
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: var(--sol-base02);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .ui-cp-label {
      font-size: 0.85em;
      font-weight: bold;
      color: var(--sol-base1);
    }
    .ui-cp-select {
      background: var(--sol-base03);
      color: var(--sol-base2);
      border: 1px solid var(--sol-base01);
      padding: 8px 12px;
      border-radius: 6px;
      font-family: var(--font-sans);
      outline: none;
    }
    
    /* Workspace */
    .ui-cp-workspace {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 20px;
      align-items: center;
    }
    @media (max-width: 768px) {
      .ui-cp-workspace {
        grid-template-columns: 1fr;
      }
    }
    .ui-cp-map-box {
      background: #001e26;
      border: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      border-radius: 8px;
      padding: 16px;
      display: flex;
      justify-content: center;
    }
    
    /* Explainer */
    .ui-cp-explain {
      background: var(--sol-base02);
      border-left: 4px solid var(--sol-cyan);
      border-radius: 4px;
      padding: 16px;
      font-size: 0.85em;
      line-height: 1.5;
      min-height: 140px;
    }
  `;
  container.appendChild(styleEl);

  const cpCard = document.createElement("div");
  cpCard.className = "ui-cp-container";
  container.appendChild(cpCard);

  // Titre
  const titleDiv = document.createElement("div");
  titleDiv.className = "ui-cp-title";
  titleDiv.innerText = "🌍 Exemple Interactif : La Carte Choroplèthe Vectorielle";
  cpCard.appendChild(titleDiv);

  // Contrôles
  const controls = document.createElement("div");
  controls.className = "ui-cp-controls";
  controls.innerHTML = `
    <label class="ui-cp-label">🗺️ Sélectionner la variable statistique d'échelle :</label>
    <select class="ui-cp-select" id="cp-variable">
      <option value="density">Densité de Population (hab/km² ➔ Échelle de Violet)</option>
      <option value="income">Revenu Médian Annuel (€ ➔ Échelle de Vert)</option>
      <option value="unemployment">Taux de Chômage (% ➔ Échelle de Rouge)</option>
    </select>
  `;
  cpCard.appendChild(controls);

  // Workspace
  const workspace = document.createElement("div");
  workspace.className = "ui-cp-workspace";
  workspace.innerHTML = `
    <div class="ui-cp-map-box">
      <svg id="cp-svg" viewBox="0 0 300 240" width="100%" height="240" style="overflow:visible;"></svg>
    </div>
    <div class="ui-cp-explain" id="cp-details">
      Survolez ou cliquez sur une région de la carte pour afficher ses métriques et comprendre comment la choroplèthe convertit des grandeurs continues en variations chromatiques géographiques.
    </div>
  `;
  cpCard.appendChild(workspace);

  // Données des régions vectorielles (SVG connectés)
  const regions = [
    {
      id: "north",
      name: "Région Nord",
      path: "M 40 30 L 160 30 L 160 110 L 40 110 Z",
      density: 350,
      income: 42000,
      unemployment: 5.2,
      desc: "Zone industrielle dense avec des pôles de recherche de pointe."
    },
    {
      id: "south",
      name: "Région Sud",
      path: "M 40 110 L 160 110 L 160 210 L 40 210 Z",
      density: 120,
      income: 29000,
      unemployment: 9.8,
      desc: "Zone touristique ensoleillée sujette aux variations saisonnières d'emploi."
    },
    {
      id: "east",
      name: "Région Est",
      path: "M 160 30 L 260 30 L 260 130 L 160 130 Z",
      density: 210,
      income: 35000,
      unemployment: 7.1,
      desc: "Bassin économique frontalier à forte activité d'échange commercial."
    },
    {
      id: "west",
      name: "Région Ouest",
      path: "M 160 130 L 260 130 L 260 210 L 160 210 Z",
      density: 85,
      income: 31000,
      unemployment: 6.4,
      desc: "Zone littorale rurale à forte composante agricole et agroalimentaire."
    }
  ];

  const renderChoropleth = (varKey) => {
    const svg = cpCard.querySelector("#cp-svg");
    const details = cpCard.querySelector("#cp-details");
    svg.innerHTML = "";

    // Trouver le min et max pour interpoler la couleur
    const values = regions.map(r => r[varKey]);
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Dessiner les régions vectorielles
    regions.forEach(r => {
      const val = r[varKey];
      const ratio = max === min ? 0.5 : (val - min) / (max - min);

      // Calcul de la couleur
      let color = "#ffffff";
      if (varKey === "density") {
        // Violet/Indigo : HSL(270, 60%, L)
        const lightness = 85 - ratio * 45;
        color = `hsl(270, 60%, ${lightness}%)`;
      } else if (varKey === "income") {
        // Vert : HSL(120, 60%, L)
        const lightness = 85 - ratio * 45;
        color = `hsl(120, 60%, ${lightness}%)`;
      } else if (varKey === "unemployment") {
        // Rouge : HSL(10, 60%, L)
        const lightness = 85 - ratio * 45;
        color = `hsl(10, 60%, ${lightness}%)`;
      }

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", r.path);
      path.setAttribute("fill", color);
      path.setAttribute("stroke", "var(--sol-base03)");
      path.setAttribute("stroke-width", "2");
      path.style.cursor = "pointer";
      path.style.transition = "fill 0.3s ease, stroke 0.2s ease";

      // Hover events
      path.addEventListener("mouseenter", () => {
        path.setAttribute("stroke", "var(--sol-cyan)");
        
        let valText = "";
        let colorBorder = "var(--sol-cyan)";
        if (varKey === "density") {
          valText = `<b style="color:var(--sol-magenta);">${val} hab/km²</b>`;
          colorBorder = "var(--sol-magenta)";
        } else if (varKey === "income") {
          valText = `<b style="color:var(--sol-green);">${val.toLocaleString()} €</b>`;
          colorBorder = "var(--sol-green)";
        } else if (varKey === "unemployment") {
          valText = `<b style="color:var(--sol-red);">${val}%</b>`;
          colorBorder = "var(--sol-red)";
        }

        details.style.borderLeftColor = colorBorder;
        details.innerHTML = `
          <div style="font-weight:bold; font-size:1.1em; color:var(--sol-base2); margin-bottom:6px;">🗺️ ${r.name}</div>
          <div style="margin-bottom:8px;">Valeur actuelle : ${valText}</div>
          <div style="font-size:0.9em; color:var(--sol-base1); line-height:1.4;">${r.desc}</div>
        `;
      });

      path.addEventListener("mouseleave", () => {
        path.setAttribute("stroke", "var(--sol-base03)");
      });

      svg.appendChild(path);
    });

    // Dessiner les noms des régions au-dessus
    regions.forEach(r => {
      let tx = 100;
      let ty = 70;
      if (r.id === "north") { tx = 100; ty = 75; }
      else if (r.id === "south") { tx = 100; ty = 165; }
      else if (r.id === "east") { tx = 210; ty = 85; }
      else if (r.id === "west") { tx = 210; ty = 175; }

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", tx);
      text.setAttribute("y", ty);
      text.setAttribute("font-family", "var(--font-sans)");
      text.setAttribute("font-size", "9");
      text.setAttribute("font-weight", "bold");
      text.setAttribute("fill", "#ffffff");
      text.setAttribute("text-anchor", "middle");
      text.style.pointerEvents = "none";
      text.textContent = r.name;
      svg.appendChild(text);
    });
  };

  // Liaison événements : Clics
  const varSelect = cpCard.querySelector("#cp-variable");
  varSelect.addEventListener("change", (e) => {
    renderChoropleth(e.target.value);
    cpCard.querySelector("#cp-details").innerHTML = "Survolez ou cliquez sur une région de la carte pour afficher ses métriques et comprendre comment la choroplèthe convertit des grandeurs continues en variations chromatiques géographiques.";
    cpCard.querySelector("#cp-details").style.borderLeftColor = "var(--sol-cyan)";
  });

  // Initialisation par défaut
  renderChoropleth("density");

  return container;
};

/**
 * 🪄 Simulateur Interactif d'Analyse en Composantes Principales (PCA / ACP)
 */
export const pcaSimulator = () => {
  const container = document.createElement("div");
  container.className = "ui-pca-simulator";

  // Styles CSS localisés haut de gamme
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .ui-pa-container {
      background: var(--sol-base03);
      color: var(--sol-base0);
      border: 1px solid var(--sol-base02);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 25px;
      font-family: var(--font-sans);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }
    .ui-pa-title {
      font-family: var(--font-code);
      font-weight: 800;
      color: var(--sol-cyan);
      font-size: 1.1em;
      margin-bottom: 18px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      padding-bottom: 8px;
    }
    
    /* Contrôles */
    .ui-pa-controls {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 15px;
      background: var(--sol-base02);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      align-items: center;
    }
    @media (max-width: 600px) {
      .ui-pa-controls {
        grid-template-columns: 1fr;
      }
    }
    .ui-pa-control-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .ui-pa-label {
      font-size: 0.85em;
      font-weight: bold;
      color: var(--sol-base1);
    }
    .ui-pa-slider {
      width: 100%;
      height: 6px;
      background: var(--sol-base01);
      border-radius: 3px;
      outline: none;
      -webkit-appearance: none;
      cursor: pointer;
    }
    .ui-pa-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--sol-cyan);
      cursor: pointer;
    }
    .ui-pa-btn {
      background: var(--sol-cyan);
      color: var(--sol-base03);
      border: none;
      padding: 10px 14px;
      border-radius: 6px;
      cursor: pointer;
      font-family: var(--font-sans);
      font-size: 0.85em;
      font-weight: bold;
      transition: all 0.2s ease;
      text-align: center;
    }
    .ui-pa-btn:hover {
      background: var(--sol-blue);
      color: #fff;
    }
    
    /* Workspace */
    .ui-pa-workspace {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 20px;
      align-items: center;
    }
    @media (max-width: 768px) {
      .ui-pa-workspace {
        grid-template-columns: 1fr;
      }
    }
    .ui-pa-plot-card {
      background: #001e26;
      border: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      border-radius: 8px;
      padding: 16px;
      display: flex;
      justify-content: center;
      position: relative;
    }
    
    /* Gauges */
    .ui-pa-gauge-box {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .ui-pa-gauge-title {
      font-family: var(--font-code);
      font-size: 0.8em;
      color: var(--sol-base1);
      text-transform: uppercase;
      font-weight: bold;
    }
    .ui-pa-progress-container {
      background: var(--sol-base02);
      border-radius: 6px;
      height: 18px;
      width: 100%;
      overflow: hidden;
      position: relative;
      border: 1px solid var(--sol-base01);
    }
    .ui-pa-progress-bar {
      height: 100%;
      background: var(--sol-red);
      width: 0%;
      transition: width 0.1s linear, background-color 0.3s ease;
    }
    .ui-pa-progress-label {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-code);
      font-size: 0.8em;
      font-weight: bold;
      color: #fff;
      text-shadow: 0 1px 2px rgba(0,0,0,0.8);
    }
    
    /* Diagnostic */
    .ui-pa-explain {
      background: var(--sol-base02);
      border-left: 4px solid var(--sol-cyan);
      border-radius: 4px;
      padding: 16px;
      font-size: 0.85em;
      line-height: 1.5;
      transition: border-color 0.3s ease;
    }
  `;
  container.appendChild(styleEl);

  const paCard = document.createElement("div");
  paCard.className = "ui-pa-container";
  container.appendChild(paCard);

  // Titre
  const titleDiv = document.createElement("div");
  titleDiv.className = "ui-pa-title";
  titleDiv.innerText = "🪄 Exemple Interactif : Maîtriser la Rotation d'axes PCA";
  paCard.appendChild(titleDiv);

  // Contrôles
  const controls = document.createElement("div");
  controls.className = "ui-pa-controls";
  controls.innerHTML = `
    <div class="ui-pa-control-group">
      <div class="ui-pa-label" style="display:flex; justify-content:space-between;">
        <span>🔄 Angle de rotation des axes (PC1 / PC2) :</span>
        <span id="pa-angle-label" style="font-family:var(--font-code); color:var(--sol-cyan);">0°</span>
      </div>
      <input type="range" class="ui-pa-slider" id="pa-angle-slider" min="0" max="180" value="120" style="margin-top:10px;">
    </div>
    <div class="ui-pa-btn" id="pa-btn-snap">⚡ Trouver l'alignement PCA optimal</div>
  `;
  paCard.appendChild(controls);

  // Workspace
  const workspace = document.createElement("div");
  workspace.className = "ui-pa-workspace";
  workspace.innerHTML = `
    <div class="ui-pa-plot-card">
      <svg id="pa-svg" viewBox="0 0 500 300" width="100%" height="300" style="overflow:visible;"></svg>
    </div>
    <div class="ui-pa-gauge-box">
      <div>
        <div class="ui-pa-gauge-title">📊 Variance Expliquée par la Composante PC1 :</div>
        <div class="ui-pa-progress-container" style="margin-top:6px;">
          <div class="ui-pa-progress-bar" id="pa-bar-pc1"></div>
          <div class="ui-pa-progress-label" id="pa-label-pc1">0%</div>
        </div>
      </div>
      <div>
        <div class="ui-pa-gauge-title">📊 Variance Restante dans PC2 :</div>
        <div class="ui-pa-progress-container" style="margin-top:6px;">
          <div class="ui-pa-progress-bar" id="pa-bar-pc2" style="background-color: var(--sol-blue);"></div>
          <div class="ui-pa-progress-label" id="pa-label-pc2">0%</div>
        </div>
      </div>
      <div class="ui-pa-explain" id="pa-details">
        Faites glisser la barre de rotation des axes pour aligner la ligne rouge (PC1) avec la plus grande longueur du nuage de points elliptique.
      </div>
    </div>
  `;
  paCard.appendChild(workspace);

  // Génération déterministe pseudo-aléatoire de points fortement corrélés
  // Alignement naturel optimal à 35° (ellipse)
  const targetAngle = 35; 
  const points = [];
  const n = 35;
  let seed = 77;
  const random = () => {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const center = { x: 250, y: 150 };
  const radOptimal = (targetAngle * Math.PI) / 180;

  for (let i = 0; i < n; i++) {
    // Coordonnées locales dans le repère de l'ellipse
    // Étirement fort sur l'axe local U (major axis) et faible sur V (minor axis)
    const u = (random() - 0.5) * 260; // Major axis spread
    const v = (random() - 0.5) * 50;  // Minor axis spread
    
    // Rotation globale de 35° pour créer la corrélation
    const x = center.x + u * Math.cos(radOptimal) - v * Math.sin(radOptimal);
    const y = center.y + u * Math.sin(radOptimal) + v * Math.cos(radOptimal);
    
    points.push({ x, y, u_orig: u, v_orig: v });
  }

  const renderPCA = (angleDegrees) => {
    const svg = paCard.querySelector("#pa-svg");
    const barPC1 = paCard.querySelector("#pa-bar-pc1");
    const labelPC1 = paCard.querySelector("#pa-label-pc1");
    const barPC2 = paCard.querySelector("#pa-bar-pc2");
    const labelPC2 = paCard.querySelector("#pa-label-pc2");
    const details = paCard.querySelector("#pa-details");

    svg.innerHTML = "";
    
    const theta = (angleDegrees * Math.PI) / 180;

    // 1. Calculer les projections sur les axes PC1 et PC2 définis par theta
    // PC1 est un vecteur unitaire [cos(theta), sin(theta)]
    // PC2 est orthogonal [ -sin(theta), cos(theta) ]
    let sumU2 = 0; // Somme des distances carrées le long de PC1 (Variance PC1)
    let sumV2 = 0; // Somme des distances carrées le long de PC2 (Variance PC2)

    const projectedPoints = points.map(p => {
      const dx = p.x - center.x;
      const dy = p.y - center.y;

      // Coordonnées projetées dans la rotation actuelle
      const u = dx * Math.cos(theta) + dy * Math.sin(theta);
      const v = -dx * Math.sin(theta) + dy * Math.cos(theta);

      sumU2 += u * u;
      sumV2 += v * v;

      // Coordonnées absolues de la projection de P sur la droite PC1
      const projX = center.x + u * Math.cos(theta);
      const projY = center.y + u * Math.sin(theta);

      return {
        x: p.x,
        y: p.y,
        projX,
        projY
      };
    });

    // 2. Calcul du ratio de variance expliquée
    const totalVar = sumU2 + sumV2;
    const ratioPC1 = totalVar === 0 ? 0 : sumU2 / totalVar;
    const ratioPC2 = 1 - ratioPC1;

    const pc1Pct = Math.round(ratioPC1 * 100);
    const pc2Pct = 100 - pc1Pct;

    // Mettre à jour les jauges de variance expliquée
    barPC1.style.width = `${pc1Pct}%`;
    labelPC1.innerText = `${pc1Pct}% de Variance`;
    
    barPC2.style.width = `${pc2Pct}%`;
    labelPC2.innerText = `${pc2Pct}% de Variance`;

    // Ajuster couleur de la jauge PC1 en fonction de la qualité
    if (pc1Pct >= 90) {
      barPC1.style.backgroundColor = "var(--sol-green)";
    } else if (pc1Pct >= 65) {
      barPC1.style.backgroundColor = "var(--sol-yellow)";
    } else {
      barPC1.style.backgroundColor = "var(--sol-red)";
    }

    // 3. Dessiner la grille de fond et axes d'origine en gris très clair
    svg.innerHTML += `
      <line x1="250" y1="10" x2="250" y2="290" stroke="var(--sol-base02)" stroke-width="1" stroke-dasharray="2,2" />
      <line x1="10" y1="150" x2="490" y2="150" stroke="var(--sol-base02)" stroke-width="1" stroke-dasharray="2,2" />
    `;

    // 4. Dessiner les droites de projection perpendiculaires (points -> PC1)
    projectedPoints.forEach(p => {
      svg.innerHTML += `
        <line x1="${p.x}" y1="${p.y}" x2="${p.projX}" y2="${p.projY}" stroke="var(--sol-base01)" stroke-width="0.8" stroke-dasharray="1.5,1.5" opacity="0.6" />
      `;
    });

    // 5. Dessiner les lignes d'axes PC1 et PC2 actuelles
    // Ligne PC1 : rouge/magenta s'étendant à travers le centre
    const pc1Length = 220;
    const pc1X1 = center.x - pc1Length * Math.cos(theta);
    const pc1Y1 = center.y - pc1Length * Math.sin(theta);
    const pc1X2 = center.x + pc1Length * Math.cos(theta);
    const pc1Y2 = center.y + pc1Length * Math.sin(theta);

    svg.innerHTML += `
      <line x1="${pc1X1}" y1="${pc1Y1}" x2="${pc1X2}" y2="${pc1Y2}" stroke="var(--sol-magenta)" stroke-width="2.5" style="filter: drop-shadow(0 0 4px rgba(211, 54, 130, 0.4));" />
      <text x="${pc1X2 - 15 * Math.cos(theta)}" y="${pc1Y2 - 15 * Math.sin(theta) - 8}" font-family="var(--font-code)" font-weight="bold" font-size="9.5" fill="var(--sol-magenta)">PC1 (Axe Majeur)</text>
    `;

    // Ligne PC2 : bleu orthogonal
    const pc2Length = 90;
    const pc2X1 = center.x - pc2Length * (-Math.sin(theta));
    const pc2Y1 = center.y - pc2Length * Math.cos(theta);
    const pc2X2 = center.x + pc2Length * (-Math.sin(theta));
    const pc2Y2 = center.y + pc2Length * Math.cos(theta);

    svg.innerHTML += `
      <line x1="${pc2X1}" y1="${pc2Y1}" x2="${pc2X2}" y2="${pc2Y2}" stroke="var(--sol-blue)" stroke-width="1.8" stroke-dasharray="3,3" opacity="0.8" />
      <text x="${pc2X2 + 8}" y="${pc2Y2}" font-family="var(--font-code)" font-weight="bold" font-size="8.5" fill="var(--sol-blue)">PC2</text>
    `;

    // 6. Dessiner les points physiques du nuage de données en vert/cyan brillant
    points.forEach(p => {
      svg.innerHTML += `
        <circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--sol-cyan)" stroke="#fff" stroke-width="0.8" style="filter: drop-shadow(0 0 2px rgba(42, 161, 152, 0.4));" />
      `;
    });

    // 7. Diagnostics et explication métier
    let diag = "";
    if (pc1Pct >= 92) {
      diag = `
        <div style="font-weight:bold; color:var(--sol-green); margin-bottom:6px;">🏆 ALIGNEMENT PCA OPTIMAL ! (Angle ≈ ${angleDegrees}°)</div>
        <div>L'axe PC1 est parfaitement aligné avec la plus grande diagonale du nuage. Il capture <strong>${pc1Pct}%</strong> de l'information totale. La dimension PC2 peut être écartée sans perte d'information majeure.</div>
      `;
      details.style.borderLeftColor = "var(--sol-green)";
    } else if (pc1Pct <= 10) {
      diag = `
        <div style="font-weight:bold; color:var(--sol-red); margin-bottom:6px;">⚠️ ALIGNEMENT INVERSÉ (Pire Cas)</div>
        <div>PC1 est alignée sur la plus petite largeur du nuage. Elle n'explique que <strong>${pc1Pct}%</strong> de la variance, tandis que PC2 en porte ${pc2Pct}%. C'est l'inverse exact de ce qu'on recherche !</div>
      `;
      details.style.borderLeftColor = "var(--sol-red)";
    } else if (pc1Pct >= 70) {
      diag = `
        <div style="font-weight:bold; color:var(--sol-yellow); margin-bottom:6px;">🟡 Alignement intermédiaire (${pc1Pct}%)</div>
        <div>PC1 capture une part significative de la variance, mais l'axe rouge n'est pas tout à fait au centre de l'étirement maximum des points. Continuez à tourner !</div>
      `;
      details.style.borderLeftColor = "var(--sol-yellow)";
    } else {
      diag = `
        <div style="font-weight:bold; color:var(--sol-orange); margin-bottom:6px;">🔴 Mauvais alignement (${pc1Pct}%)</div>
        <div>La ligne rouge PC1 coupe le nuage de travers. Les distances de projection (traits pointillés gris) sont importantes, ce qui engendre une perte importante d'information.</div>
      `;
      details.style.borderLeftColor = "var(--sol-orange)";
    }

    details.innerHTML = diag;
  };

  // Liaison événements : Contrôles
  const slider = paCard.querySelector("#pa-angle-slider");
  const label = paCard.querySelector("#pa-angle-label");
  const btnSnap = paCard.querySelector("#pa-btn-snap");

  const updatePCA = (val) => {
    label.innerText = `${val}°`;
    renderPCA(val);
  };

  slider.addEventListener("input", (e) => {
    updatePCA(parseInt(e.target.value));
  });

  // Bouton de capture optimale
  btnSnap.addEventListener("click", () => {
    // Aligner à 35° ou 215° (les deux axes maximisent la variance)
    slider.value = 35;
    updatePCA(35);
    
    // Animation de pulsation du bouton pour signifier le succès
    btnSnap.style.transform = "scale(0.95)";
    setTimeout(() => { btnSnap.style.transform = "none"; }, 150);
  });

  // Initialisation par défaut
  updatePCA(120);

  return container;
};

/**
 * 🧊 Simulateur Interactif d'Illusion et Distorsion de Perspective 3D
 */
export const threeDSimulator = () => {
  const container = document.createElement("div");
  container.className = "ui-3d-simulator";

  // Styles CSS localisés haut de gamme
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .ui-td-container {
      background: var(--sol-base03);
      color: var(--sol-base0);
      border: 1px solid var(--sol-base02);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 25px;
      font-family: var(--font-sans);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }
    .ui-td-title {
      font-family: var(--font-code);
      font-weight: 800;
      color: var(--sol-cyan);
      font-size: 1.1em;
      margin-bottom: 18px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      padding-bottom: 8px;
    }
    
    /* Contrôles */
    .ui-td-controls {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 15px;
      background: var(--sol-base02);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      align-items: center;
    }
    @media (max-width: 600px) {
      .ui-td-controls {
        grid-template-columns: 1fr;
      }
    }
    .ui-td-control-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .ui-td-label {
      font-size: 0.85em;
      font-weight: bold;
      color: var(--sol-base1);
    }
    .ui-td-slider {
      width: 100%;
      height: 6px;
      background: var(--sol-base01);
      border-radius: 3px;
      outline: none;
      -webkit-appearance: none;
      cursor: pointer;
    }
    .ui-td-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--sol-cyan);
      cursor: pointer;
    }
    
    /* Switch */
    .ui-td-switch-container {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      user-select: none;
    }
    .ui-td-switch-label {
      font-size: 0.85em;
      font-weight: bold;
      color: var(--sol-base1);
    }
    .ui-td-checkbox {
      width: 16px;
      height: 16px;
      accent-color: var(--sol-cyan);
    }
    
    /* Workspace */
    .ui-td-workspace {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 20px;
      align-items: center;
    }
    @media (max-width: 768px) {
      .ui-td-workspace {
        grid-template-columns: 1fr;
      }
    }
    .ui-td-plot-card {
      background: #001e26;
      border: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      border-radius: 8px;
      padding: 16px;
      display: flex;
      justify-content: center;
    }
    
    /* Explainer */
    .ui-td-explain {
      background: var(--sol-base02);
      border-left: 4px solid var(--sol-cyan);
      border-radius: 4px;
      padding: 16px;
      font-size: 0.85em;
      line-height: 1.5;
      min-height: 180px;
    }
  `;
  container.appendChild(styleEl);

  const tdCard = document.createElement("div");
  tdCard.className = "ui-td-container";
  container.appendChild(tdCard);

  // Titre
  const titleDiv = document.createElement("div");
  titleDiv.className = "ui-td-title";
  titleDiv.innerText = "🧊 Démo Interactive : Le Piège de la Perspective 3D";
  tdCard.appendChild(titleDiv);

  // Contrôles
  const controls = document.createElement("div");
  controls.className = "ui-td-controls";
  controls.innerHTML = `
    <div class="ui-td-control-group">
      <div class="ui-td-label" style="display:flex; justify-content:space-between;">
        <span>🎥 Rotation Horizontale de la Caméra (Azimut) :</span>
        <span id="td-angle-label" style="font-family:var(--font-code); color:var(--sol-cyan);">30°</span>
      </div>
      <input type="range" class="ui-td-slider" id="td-angle-slider" min="-90" max="90" value="30">
    </div>
    <div class="ui-td-control-group">
      <label class="ui-td-switch-container">
        <input type="checkbox" class="ui-td-checkbox" id="td-guide-cb" checked>
        <span class="ui-td-switch-label">📏 Afficher les lignes de rappel Z (sol)</span>
      </label>
    </div>
  `;
  tdCard.appendChild(controls);

  // Workspace
  const workspace = document.createElement("div");
  workspace.className = "ui-td-workspace";
  workspace.innerHTML = `
    <div class="ui-td-plot-card">
      <svg id="td-svg" viewBox="0 0 500 320" width="100%" height="320" style="overflow:visible;"></svg>
    </div>
    <div class="ui-td-explain" id="td-details">
      Survolez un point 3D ou désactivez les lignes de rappel pour constater le paradoxe géométrique fondamental de la 3D.
    </div>
  `;
  tdCard.appendChild(workspace);

  // 12 points dans l'espace 3D normalisé [-100, 100] sur X, Y, Z
  // X = Taille, Y = Prix, Z = Salles
  const points3D = [
    { name: "Villa A", x: 60, y: 70, z: 80, desc: "Très grande maison, prix fort, beaucoup de pièces." },
    { name: "Loft B", x: -70, y: 50, z: -50, desc: "Petit espace haut de gamme (prix élevé pour sa taille)." },
    { name: "Studio C", x: -80, y: -80, z: -90, desc: "Petit, pas cher, 1 seule pièce." },
    { name: "Pavillon D", x: 20, y: -10, z: 30, desc: "Taille moyenne, prix modéré, pièces confortables." },
    { name: "Château E", x: 90, y: 90, z: 90, desc: "Maximum sur les 3 axes statistiques !" },
    { name: "Hangar F", x: 80, y: -60, z: -70, desc: "Immense hangar, très bon marché, aucune pièce interne." },
    { name: "Appart G", x: -40, y: -30, z: 10, desc: "Petit appartement familial à prix décent." },
    { name: "Cabane H", x: -60, y: -90, z: -80, desc: "Réfugié en forêt : minimaliste et gratuit." }
  ];

  const render3D = (angleDegrees, showGuides) => {
    const svg = tdCard.querySelector("#td-svg");
    svg.innerHTML = "";

    const details = tdCard.querySelector("#td-details");

    const theta = (angleDegrees * Math.PI) / 180;
    const phi = (25 * Math.PI) / 180; // Angle d'élévation vertical constant (25°)

    const center = { x: 250, y: 160 };

    // Projection 3D -> 2D (Rotation autour de Y puis élévation X)
    const project = (x, y, z) => {
      // Rotation Y (horizontal)
      const xRot = x * Math.cos(theta) - z * Math.sin(theta);
      const zRot = x * Math.sin(theta) + z * Math.cos(theta);

      // Élévation et projection écran plane
      const screenX = center.x + xRot * 1.3;
      const screenY = center.y - (y * Math.cos(phi) - zRot * Math.sin(phi)) * 0.9;

      return {
        x: screenX,
        y: screenY,
        depth: zRot // Profondeur pour trier l'affichage (éviter les inversions)
      };
    };

    // Dessiner le cube de référence 3D (les 12 arêtes)
    const d = 100; // taille de demi-cube
    const vertices = [
      { x: -d, y: -d, z: -d },
      { x: d, y: -d, z: -d },
      { x: d, y: d, z: -d },
      { x: -d, y: d, z: -d },
      { x: -d, y: -d, z: d },
      { x: d, y: -d, z: d },
      { x: d, y: d, z: d },
      { x: -d, y: d, z: d }
    ].map(v => project(v.x, v.y, v.z));

    const drawLine = (i, j, color = "var(--sol-base01)", width = "1.5", dash = "") => {
      svg.innerHTML += `
        <line x1="${vertices[i].x}" y1="${vertices[i].y}" 
              x2="${vertices[j].x}" y2="${vertices[j].y}" 
              stroke="${color}" stroke-width="${width}" 
              ${dash ? `stroke-dasharray="${dash}"` : ""} />
      `;
    };

    // Arêtes arrières (fines)
    drawLine(0, 1); drawLine(1, 2); drawLine(2, 3); drawLine(3, 0);
    // Arêtes avant
    drawLine(4, 5); drawLine(5, 6); drawLine(6, 7); drawLine(7, 4);
    // Connexions
    drawLine(0, 4); drawLine(1, 5); drawLine(2, 6); drawLine(3, 7);

    // Dessiner axe étiquettes aux coins
    const labelX = project(130, -100, -100);
    const labelY = project(-100, 130, -100);
    const labelZ = project(-100, -100, 130);

    svg.innerHTML += `
      <text x="${labelX.x}" y="${labelX.y}" font-family="var(--font-code)" font-size="8.5" fill="var(--sol-magenta)" text-anchor="middle">Axe X (Taille)</text>
      <text x="${labelY.x}" y="${labelY.y - 5}" font-family="var(--font-code)" font-size="8.5" fill="var(--sol-green)" text-anchor="middle">Axe Y (Prix)</text>
      <text x="${labelZ.x}" y="${labelZ.y + 10}" font-family="var(--font-code)" font-size="8.5" fill="var(--sol-blue)" text-anchor="middle">Axe Z (Pièces)</text>
    `;

    // Calculer les projections 2D de nos points 3D
    const projectedPoints = points3D.map(p => {
      const proj = project(p.x, p.y, p.z);
      // Projection uniquement sur le sol (Y = -d)
      const floorProj = project(p.x, -d, p.z);
      return {
        ...p,
        px: proj.x,
        py: proj.y,
        depth: proj.depth,
        fx: floorProj.x,
        fy: floorProj.y
      };
    });

    // Trier les points par profondeur Z (Painter's Algorithm) pour que les objets plus proches cachent les plus éloignés !
    projectedPoints.sort((a, b) => a.depth - b.depth);

    // Dessiner les guides et points
    projectedPoints.forEach(p => {
      // 1. Guides de rappel vers le sol
      if (showGuides) {
        svg.innerHTML += `
          <line x1="${p.px}" y1="${p.py}" x2="${p.fx}" y2="${p.fy}" stroke="var(--sol-blue)" stroke-width="1" stroke-dasharray="2,2" opacity="0.6" />
          <circle cx="${p.fx}" cy="${p.fy}" r="2" fill="var(--sol-blue)" opacity="0.6" />
        `;
      }

      // 2. Point 3D (Sphère avec effet 3D)
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", p.px);
      circle.setAttribute("cy", p.py);
      
      // La taille varie subtilement avec la perspective (profondeur) pour le réalisme
      const rScale = 4 + (p.depth + 150) * 0.015;
      circle.setAttribute("r", rScale);
      circle.setAttribute("fill", "var(--sol-cyan)");
      circle.setAttribute("stroke", "#ffffff");
      circle.setAttribute("stroke-width", "1");
      circle.style.cursor = "pointer";
      circle.style.transition = "transform 0.1s ease";

      circle.addEventListener("mouseenter", () => {
        circle.setAttribute("fill", "var(--sol-orange)");
        circle.setAttribute("stroke-width", "2");
        circle.setAttribute("r", rScale * 1.4);

        let guideDiag = "";
        if (!showGuides) {
          guideDiag = `<br><span style="color:var(--sol-red); font-weight:bold;">⚠️ Illusion d'optique active :</span> Sans lignes de rappel, il vous est physiquement impossible de dire si ce point flotte haut ou s'il est simplement proche de la caméra.`;
        }

        details.style.borderLeftColor = "var(--sol-cyan)";
        details.innerHTML = `
          <div style="font-weight:bold; font-size:1.1em; color:var(--sol-cyan); margin-bottom:6px;">🏠 ${p.name}</div>
          <div style="font-size:0.9em; margin-bottom:6px;">
            • Taille (X) : <b>${((p.x + 100) / 2).toFixed(0)} m²</b><br>
            • Prix (Y) : <b>${((p.y + 100) * 3).toFixed(0)} k€</b><br>
            • Pièces (Z) : <b>${((p.z + 100) / 20).toFixed(0)} pièces</b>
          </div>
          <div style="font-style:italic; font-size:0.85em; color:var(--sol-base1);">${p.desc}</div>
          ${guideDiag}
        `;
      });

      circle.addEventListener("mouseleave", () => {
        circle.setAttribute("fill", "var(--sol-cyan)");
        circle.setAttribute("stroke-width", "1");
        circle.setAttribute("r", rScale);
      });

      svg.appendChild(circle);

      // Petite étiquette nom
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", p.px);
      text.setAttribute("y", p.py - rScale - 4);
      text.setAttribute("font-family", "var(--font-code)");
      text.setAttribute("font-size", "7.5");
      text.setAttribute("fill", "var(--sol-base1)");
      text.setAttribute("text-anchor", "middle");
      text.style.pointerEvents = "none";
      text.textContent = p.name;
      svg.appendChild(text);
    });

    // Message pédagogique si les guides sont éteints
    if (!showGuides) {
      details.innerHTML = `
        <div style="font-weight:bold; color:var(--sol-red); margin-bottom:6px;">🚨 Le Piège de la Flottaison 3D</div>
        <div>Décochez ou recochez la case "📏 Lignes de rappel". <br>
        Sans ces guides pointillés, <strong>vos yeux sont incapables de situer les points dans l'espace 3D</strong>. Une villa en hauteur semble juxtaposée à une petite cabane au sol. C'est la distorsion de perspective.</div>
      `;
      details.style.borderLeftColor = "var(--sol-red)";
    }
  };

  // Liaison événements : Contrôles
  const slider = tdCard.querySelector("#td-angle-slider");
  const label = tdCard.querySelector("#td-angle-label");
  const checkbox = tdCard.querySelector("#td-guide-cb");

  const update3D = () => {
    const val = parseInt(slider.value);
    label.innerText = `${val}°`;
    render3D(val, checkbox.checked);
  };

  slider.addEventListener("input", update3D);
  checkbox.addEventListener("change", update3D);

  // Initialisation par défaut
  render3D(30, true);

  return container;
};

/**
 * 📊 Simulateur Interactif de Pairplot (Matrice de Graphiques)
 */
export const pairplotSimulator = () => {
  const container = document.createElement("div");
  container.className = "ui-pairplot-simulator";

  // Styles CSS localisés haut de gamme
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .ui-pp-container {
      background: var(--sol-base03);
      color: var(--sol-base0);
      border: 1px solid var(--sol-base02);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 25px;
      font-family: var(--font-sans);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }
    .ui-pp-title {
      font-family: var(--font-code);
      font-weight: 800;
      color: var(--sol-cyan);
      font-size: 1.1em;
      margin-bottom: 18px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      padding-bottom: 8px;
    }
    
    /* Contrôles */
    .ui-pp-controls {
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: var(--sol-base02);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .ui-pp-label {
      font-size: 0.85em;
      font-weight: bold;
      color: var(--sol-base1);
    }
    .ui-pp-select {
      background: var(--sol-base03);
      color: var(--sol-base2);
      border: 1px solid var(--sol-base01);
      padding: 8px 12px;
      border-radius: 6px;
      font-family: var(--font-sans);
      outline: none;
    }
    
    /* Workspace */
    .ui-pp-workspace {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 20px;
      align-items: start;
    }
    @media (max-width: 768px) {
      .ui-pp-workspace {
        grid-template-columns: 1fr;
      }
    }
    .ui-pp-grid-box {
      background: #001e26;
      border: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      border-radius: 8px;
      padding: 16px;
      display: flex;
      justify-content: center;
    }
    
    /* Cell style override for SVG interactivity */
    .pp-cell-bg {
      fill: rgba(0,0,0,0.15);
      stroke: var(--sol-base02);
      stroke-width: 1;
      cursor: pointer;
      transition: fill 0.2s ease, stroke 0.2s ease;
    }
    .pp-cell-bg:hover {
      fill: rgba(42, 161, 152, 0.1);
      stroke: var(--sol-cyan);
    }
    .pp-cell-bg.active {
      fill: rgba(211, 54, 130, 0.1);
      stroke: var(--sol-magenta);
      stroke-width: 2;
    }
    
    /* Explainer */
    .ui-pp-explain {
      background: var(--sol-base02);
      border-left: 4px solid var(--sol-cyan);
      border-radius: 4px;
      padding: 16px;
      font-size: 0.85em;
      line-height: 1.5;
      min-height: 220px;
    }
  `;
  container.appendChild(styleEl);

  const ppCard = document.createElement("div");
  ppCard.className = "ui-pp-container";
  container.appendChild(ppCard);

  // Titre
  const titleDiv = document.createElement("div");
  titleDiv.className = "ui-pp-title";
  titleDiv.innerText = "📊 Exemple Interactif : La Grille de Pairplot (Analyse Pairwise)";
  ppCard.appendChild(titleDiv);

  // Contrôles
  const controls = document.createElement("div");
  controls.className = "ui-pp-controls";
  controls.innerHTML = `
    <label class="ui-pp-label">🎨 Coloration catégorielle (Argument 'hue') :</label>
    <select class="ui-pp-select" id="pp-hue">
      <option value="type">Type de Bien (Maison vs Appartement)</option>
      <option value="none">Aucune coloration (Monochrome)</option>
    </select>
  `;
  ppCard.appendChild(controls);

  // Workspace
  const workspace = document.createElement("div");
  workspace.className = "ui-pp-workspace";
  workspace.innerHTML = `
    <div class="ui-pp-grid-box">
      <svg id="pp-svg" viewBox="0 0 360 360" width="100%" height="360" style="overflow:visible;"></svg>
    </div>
    <div class="ui-pp-explain" id="pp-details">
      <h3>💡 Qu'est-ce qu'un Pairplot ?</h3>
      <p>C'est une matrice de graphiques indispensable pour l'EDA. Elle affiche :</p>
      <ul>
        <li><b>La Diagonale :</b> L'histogramme univarié de chaque variable pour voir sa distribution individuelle.</li>
        <li><b>Hors Diagonale :</b> Les nuages de points de chaque paire possible de variables pour identifier les corrélations.</li>
      </ul>
      <p style="color:var(--sol-cyan); font-weight:bold;">👉 Cliquez sur n'importe quelle case de la grille pour l'analyser en détail !</p>
    </div>
  `;
  ppCard.appendChild(workspace);

  // Dataset immobilier
  const data = [
    { type: "maison", taille: 140, prix: 420, chambres: 5 },
    { type: "maison", taille: 180, prix: 550, chambres: 6 },
    { type: "maison", taille: 110, prix: 310, chambres: 4 },
    { type: "maison", taille: 150, prix: 460, chambres: 5 },
    { type: "maison", taille: 200, prix: 620, chambres: 6 },
    { type: "appartement", taille: 45, prix: 180, chambres: 2 },
    { type: "appartement", taille: 65, prix: 220, chambres: 3 },
    { type: "appartement", taille: 35, prix: 140, chambres: 1 },
    { type: "appartement", taille: 80, prix: 280, chambres: 3 },
    { type: "appartement", taille: 55, prix: 190, chambres: 2 }
  ];

  const variables = ["taille", "prix", "chambres"];
  const varLabels = ["Taille (m²)", "Prix (k€)", "Chambres"];

  const renderPairplot = (hueMode, activeRow = 0, activeCol = 1) => {
    const svg = ppCard.querySelector("#pp-svg");
    svg.innerHTML = "";

    const details = ppCard.querySelector("#pp-details");

    const cellSize = 80;
    const padding = 15;
    const offset = 45; // espace pour axes/labels

    // Échelles locales pour chaque variable
    const minMax = {
      taille: { min: 20, max: 220 },
      prix: { min: 100, max: 700 },
      chambres: { min: 0, max: 8 }
    };

    // Helper conversion coordonnées dans la cellule
    const scale = (val, min, max, span = cellSize) => {
      return 5 + ((val - min) / (max - min)) * (span - 10);
    };

    // 1. Dessiner les labels de la grille
    variables.forEach((v, idx) => {
      // Axe Y labels
      svg.innerHTML += `
        <text x="35" y="${offset + idx * (cellSize + padding) + cellSize / 2 + 3}" 
              font-family="var(--font-code)" font-size="8.5" fill="var(--sol-base1)" text-anchor="end">${varLabels[idx]}</text>
      `;
      // Axe X labels
      svg.innerHTML += `
        <text x="${offset + idx * (cellSize + padding) + cellSize / 2}" y="${offset + 3 * (cellSize + padding) - 5}" 
              font-family="var(--font-code)" font-size="8.5" fill="var(--sol-base1)" text-anchor="middle">${varLabels[idx]}</text>
      `;
    });

    // 2. Dessiner les 9 cellules (3x3)
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const cx = offset + c * (cellSize + padding);
        const cy = offset + r * (cellSize + padding);

        // Group container de cellule
        const cellG = document.createElementNS("http://www.w3.org/2000/svg", "g");

        // Fond interactif
        const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        bg.setAttribute("x", cx);
        bg.setAttribute("y", cy);
        bg.setAttribute("width", cellSize);
        bg.setAttribute("height", cellSize);
        bg.setAttribute("rx", "4");
        bg.setAttribute("class", `pp-cell-bg ${r === activeRow && c === activeCol ? "active" : ""}`);

        // Clic sur cellule pour analyser
        bg.addEventListener("click", () => {
          renderPairplot(hueMode, r, c);
        });

        cellG.appendChild(bg);

        // Variables comparées
        const varY = variables[r];
        const varX = variables[c];

        if (r === c) {
          // --- DIAGONALE : Histogrammes univariés ---
          const bins = 5;
          const range = minMax[varY];
          const binWidth = (range.max - range.min) / bins;

          const countsMaison = new Array(bins).fill(0);
          const countsAppart = new Array(bins).fill(0);

          data.forEach(d => {
            const val = d[varY];
            const binIdx = Math.min(bins - 1, Math.floor((val - range.min) / binWidth));
            if (d.type === "maison") countsMaison[binIdx]++;
            else countsAppart[binIdx]++;
          });

          // Dessiner barres
          const cellBinWidth = cellSize / bins;
          const maxCount = 5;

          for (let b = 0; b < bins; b++) {
            const bx = cx + b * cellBinWidth;
            
            if (hueMode === "type") {
              // Barres empilées
              const hMaison = (countsMaison[b] / maxCount) * (cellSize - 10);
              const hAppart = (countsAppart[b] / maxCount) * (cellSize - 10);

              // Appart (bleu) au sol
              if (hAppart > 0) {
                const appartBar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                appartBar.setAttribute("x", bx + 1);
                appartBar.setAttribute("y", cy + cellSize - hAppart);
                appartBar.setAttribute("width", cellBinWidth - 2);
                appartBar.setAttribute("height", hAppart);
                appartBar.setAttribute("fill", "var(--sol-blue)");
                appartBar.setAttribute("opacity", "0.75");
                cellG.appendChild(appartBar);
              }

              // Maison (orange) par-dessus
              if (hMaison > 0) {
                const maisonBar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                maisonBar.setAttribute("x", bx + 1);
                maisonBar.setAttribute("y", cy + cellSize - hAppart - hMaison);
                maisonBar.setAttribute("width", cellBinWidth - 2);
                maisonBar.setAttribute("height", hMaison);
                maisonBar.setAttribute("fill", "var(--sol-orange)");
                maisonBar.setAttribute("opacity", "0.75");
                cellG.appendChild(maisonBar);
              }
            } else {
              // Monochrome (tous)
              const total = countsMaison[b] + countsAppart[b];
              const hTotal = (total / maxCount) * (cellSize - 10);
              if (hTotal > 0) {
                const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                bar.setAttribute("x", bx + 1);
                bar.setAttribute("y", cy + cellSize - hTotal);
                bar.setAttribute("width", cellBinWidth - 2);
                bar.setAttribute("height", hTotal);
                bar.setAttribute("fill", "var(--sol-cyan)");
                bar.setAttribute("opacity", "0.75");
                cellG.appendChild(bar);
              }
            }
          }
        } else {
          // --- HORS-DIAGONALE : Scatter Plots ---
          data.forEach(d => {
            const valX = d[varX];
            const valY = d[varY];

            const px = cx + scale(valX, minMax[varX].min, minMax[varX].max);
            // Y inversé dans SVG
            const py = cy + cellSize - scale(valY, minMax[varY].min, minMax[varY].max);

            let color = "var(--sol-cyan)";
            if (hueMode === "type") {
              color = d.type === "maison" ? "var(--sol-orange)" : "var(--sol-blue)";
            }

            const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            dot.setAttribute("cx", px);
            dot.setAttribute("cy", py);
            dot.setAttribute("r", "3");
            dot.setAttribute("fill", color);
            dot.setAttribute("opacity", "0.8");
            cellG.appendChild(dot);
          });
        }

        svg.appendChild(cellG);
      }
    }

    // 3. Mettre à jour l'explication interactive de la cellule sélectionnée
    const vY = variables[activeRow];
    const vX = variables[activeCol];
    const labelY = varLabels[activeRow];
    const labelX = varLabels[activeCol];

    let cellExpl = "";
    if (activeRow === activeCol) {
      cellExpl = `
        <div style="font-weight:bold; font-size:1.1em; color:var(--sol-cyan); margin-bottom:6px;">📈 Diagonale : Distribution Univariée (${labelY})</div>
        <div>Cette cellule représente la **distribution simple** de la variable <b>${labelY}</b> sous forme d'histogramme.</div>
        <div style="margin-top:10px;">
          • ${hueMode === "type" 
            ? `<span style="color:var(--sol-orange);">■ Maisons</span> et <span style="color:var(--sol-blue);">■ Appartements</span> sont empilés. On constate immédiatement que les maisons ont des valeurs de <i>${vY}</i> généralement plus élevées que les appartements.`
            : `L'histogramme global montre la forme de la population immobilière totale.`}
        </div>
      `;
      details.style.borderLeftColor = "var(--sol-cyan)";
    } else {
      let insight = "";
      if (vY === "taille" && vX === "prix" || vY === "prix" && vX === "taille") {
        insight = `On observe une <b>forte corrélation linéaire positive</b>. Plus la taille augmente, plus le prix s'envole. C'est le motif le plus évident du dataset.`;
      } else if (vY === "chambres" && vX === "taille" || vY === "taille" && vX === "chambres") {
        insight = `Liaison positive par paliers. Une maison plus grande possède naturellement plus de chambres, mais cela forme des bandes discrètes horizontales/verticales car le nombre de chambres est un entier discret.`;
      } else {
        insight = `Corrélation modérée. Le prix augmente avec le nombre de chambres, mais avec une dispersion significative due à la localisation ou à l'agencement du bien.`;
      }

      cellExpl = `
        <div style="font-weight:bold; font-size:1.1em; color:var(--sol-magenta); margin-bottom:6px;">🔗 Hors Diagonale : Nuage de Points Bivarié</div>
        <div style="margin-bottom:8px;">Axe Vertical (Y) : <b>${labelY}</b><br>Axe Horizontal (X) : <b>${labelX}</b></div>
        <div style="line-height:1.4;">${insight}</div>
        <div style="margin-top:10px; font-size:0.95em; color:var(--sol-base1);">
          ${hueMode === "type" 
            ? `💡 <span style="color:var(--sol-orange); font-weight:bold;">Visualisation des Clusters :</span> Colorer en orange (Maisons) et bleu (Appartements) sépare instantanément le jeu de données en deux nuages distincts.` 
            : `💡 Sans coloration 'hue', vous ne distinguez pas les deux natures de biens immobiliers.`}
        </div>
      `;
      details.style.borderLeftColor = "var(--sol-magenta)";
    }

    details.innerHTML = cellExpl;
  };

  // Liaison événements : Contrôles
  const hueSelect = ppCard.querySelector("#pp-hue");
  hueSelect.addEventListener("change", (e) => {
    // Garder la cellule active courante
    const activeCell = ppCard.querySelector(".pp-cell-bg.active");
    let r = 0, c = 1;
    if (activeCell) {
      // Retrouver l'index
      const bgs = Array.from(ppCard.querySelectorAll(".pp-cell-bg"));
      const idx = bgs.indexOf(activeCell);
      r = Math.floor(idx / 3);
      c = idx % 3;
    }
    renderPairplot(e.target.value, r, c);
  });

  // Initialisation par défaut (cellule (0,1) = Taille vs Prix active)
  renderPairplot("type", 0, 1);

  return container;
};

/**
 * 📈 Simulateur Interactif des Chemins de Régularisation (Ridge vs Lasso vs ElasticNet)
 */
export const regularizationSimulator = () => {
  const container = document.createElement("div");
  container.className = "ui-regularization-simulator";

  // Styles CSS localisés haut de gamme
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .ui-reg-container {
      background: var(--sol-base03);
      color: var(--sol-base0);
      border: 1px solid var(--sol-base02);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 25px;
      font-family: var(--font-sans);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }
    .ui-reg-title {
      font-family: var(--font-code);
      font-weight: 800;
      color: var(--sol-cyan);
      font-size: 1.1em;
      margin-bottom: 18px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      padding-bottom: 8px;
    }
    
    /* Contrôles */
    .ui-reg-controls {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 15px;
      background: var(--sol-base02);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      align-items: center;
    }
    @media (max-width: 600px) {
      .ui-reg-controls {
        grid-template-columns: 1fr;
      }
    }
    .ui-reg-control-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .ui-reg-label {
      font-size: 0.85em;
      font-weight: bold;
      color: var(--sol-base1);
    }
    .ui-reg-select {
      background: var(--sol-base03);
      color: var(--sol-base2);
      border: 1px solid var(--sol-base01);
      padding: 8px 12px;
      border-radius: 6px;
      font-family: var(--font-sans);
      outline: none;
    }
    .ui-reg-slider {
      width: 100%;
      height: 6px;
      background: var(--sol-base01);
      border-radius: 3px;
      outline: none;
      -webkit-appearance: none;
      cursor: pointer;
    }
    .ui-reg-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--sol-cyan);
      cursor: pointer;
    }
    
    /* Workspace */
    .ui-reg-workspace {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 20px;
      align-items: start;
    }
    @media (max-width: 768px) {
      .ui-reg-workspace {
        grid-template-columns: 1fr;
      }
    }
    .ui-reg-plot-card {
      background: #001e26;
      border: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      border-radius: 8px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    /* Variables List */
    .ui-reg-vars-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .ui-reg-var-row {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr 2fr;
      gap: 10px;
      align-items: center;
      background: var(--sol-base02);
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.85em;
    }
    
    /* Explainer */
    .ui-reg-explain {
      background: var(--sol-base02);
      border-left: 4px solid var(--sol-cyan);
      border-radius: 4px;
      padding: 16px;
      font-size: 0.85em;
      line-height: 1.5;
      min-height: 220px;
    }
  `;
  container.appendChild(styleEl);

  const regCard = document.createElement("div");
  regCard.className = "ui-reg-container";
  container.appendChild(regCard);

  // Titre
  const titleDiv = document.createElement("div");
  titleDiv.className = "ui-reg-title";
  titleDiv.innerText = "📈 Simulateur de Régularisation : Ridge vs Lasso vs ElasticNet";
  regCard.appendChild(titleDiv);

  // Contrôles
  const controls = document.createElement("div");
  controls.className = "ui-reg-controls";
  controls.innerHTML = `
    <div class="ui-reg-control-group">
      <label class="ui-reg-label">🛠️ Type de Régularisation :</label>
      <select class="ui-reg-select" id="reg-type">
        <option value="lasso">Lasso (Pénalité L1 - Sélection Sparsity)</option>
        <option value="ridge">Ridge (Pénalité L2 - Réduction Variance)</option>
        <option value="elastic">ElasticNet (Pénalité Hybride L1 + L2)</option>
      </select>
    </div>
    <div class="ui-reg-control-group">
      <div class="ui-reg-label" style="display:flex; justify-content:space-between;">
        <span>⚡ Intensité de Pénalité (λ) :</span>
        <span id="reg-lambda-label" style="font-family:var(--font-code); color:var(--sol-cyan);">0</span>
      </div>
      <input type="range" class="ui-reg-slider" id="reg-lambda" min="0" max="100" value="0">
    </div>
  `;
  regCard.appendChild(controls);

  // Workspace
  const workspace = document.createElement("div");
  workspace.className = "ui-reg-workspace";
  workspace.innerHTML = `
    <div class="ui-reg-plot-card">
      <div style="font-weight:bold; font-size:0.9em; color:var(--sol-base1); text-transform:uppercase; font-family:var(--font-code);">🧪 Évolution des Coefficients Régressifs</div>
      <svg id="reg-svg" viewBox="0 0 450 220" width="100%" height="220" style="overflow:visible;"></svg>
    </div>
    <div class="ui-reg-vars-list" id="reg-vars">
      <!-- Rendu dynamique des lignes de variables -->
    </div>
  `;
  regCard.appendChild(workspace);

  // Pied de page / Explainer
  const footerExplain = document.createElement("div");
  footerExplain.className = "ui-reg-explain";
  footerExplain.style.marginTop = "20px";
  footerExplain.id = "reg-details";
  regCard.appendChild(footerExplain);

  // Spécification de nos 5 variables
  const variables = [
    { id: "taille", name: "Taille (m²)", w0: 8.0, color: "var(--sol-cyan)", desc: "Variable majeure très prédictive." },
    { id: "chambres", name: "Chambres", w0: 5.0, color: "var(--sol-green)", desc: "Variable importante modérée." },
    { id: "garage", name: "Garage", w0: 3.5, color: "var(--sol-yellow)", desc: "Corrélée à Taille (Redondance)." },
    { id: "age", name: "Âge", w0: -4.0, color: "var(--sol-red)", desc: "Impact négatif sur le prix." },
    { id: "bruit", name: "Bruit dB (Bruit)", w0: 1.5, color: "var(--sol-magenta)", desc: "Bruit aléatoire sans intérêt." }
  ];

  const calculateCoefficients = (type, lambda) => {
    // Calcul théorique du rétrécissement
    const x = lambda / 100; // Normalisé [0, 1]

    return variables.map(v => {
      let w = v.w0;
      if (type === "ridge") {
        // Ridge (L2) : w = w0 / (1 + lambda * 5)
        w = v.w0 / (1 + x * 9);
      } else if (type === "lasso") {
        // Lasso (L1) : soft-thresholding
        // Chaque variable a un point de coupure à zéro différent !
        const thresholds = {
          bruit: 0.12,
          garage: 0.28,
          age: 0.48,
          chambres: 0.72,
          taille: 0.98
        };
        const th = thresholds[v.id];
        if (x >= th) {
          w = 0;
        } else {
          // Décroissance linéaire jusqu'au threshold
          w = v.w0 * (1 - x / th);
        }
      } else {
        // ElasticNet : Hybride
        const thresholds = {
          bruit: 0.20,
          garage: 0.45,
          age: 0.68,
          chambres: 0.85,
          taille: 0.99
        };
        const th = thresholds[v.id];
        if (x >= th) {
          w = 0;
        } else {
          // L1 fait décroître vers 0, L2 courbe la descente
          w = (v.w0 * (1 - x / th)) / (1 + x * 2.5);
        }
      }
      return {
        ...v,
        w: parseFloat(w.toFixed(2))
      };
    });
  };

  const renderRegularization = () => {
    const type = regCard.querySelector("#reg-type").value;
    const lambda = parseInt(regCard.querySelector("#reg-lambda").value);
    regCard.querySelector("#reg-lambda-label").innerText = lambda;

    const svg = regCard.querySelector("#reg-svg");
    svg.innerHTML = "";

    const listDiv = regCard.querySelector("#reg-vars");
    listDiv.innerHTML = "";

    const details = regCard.querySelector("#reg-details");

    const currentCoeffs = calculateCoefficients(type, lambda);

    // 1. Dessiner le graphique en ligne d'évolution globale de lambda de 0 à 100
    // Ligne centrale Y = 110 (w = 0)
    svg.innerHTML += `
      <line x1="40" y1="110" x2="420" y2="110" stroke="var(--sol-base02)" stroke-width="1.5" />
      <text x="35" y="113" font-family="var(--font-code)" font-size="8" fill="var(--sol-base1)" text-anchor="end">W = 0</text>
      <line x1="40" y1="10" x2="40" y2="200" stroke="var(--sol-base02)" stroke-width="1" />
      <text x="40" y="212" font-family="var(--font-code)" font-size="7.5" fill="var(--sol-base1)" text-anchor="middle">λ = 0</text>
      <text x="420" y="212" font-family="var(--font-code)" font-size="7.5" fill="var(--sol-base1)" text-anchor="middle">λ = Max</text>
    `;

    // Calculer les chemins de 0 à 100 pour chaque variable et les tracer
    variables.forEach(v => {
      let pointsStr = "";
      for (let l = 0; l <= 100; l += 5) {
        const tempCoeffs = calculateCoefficients(type, l);
        const coeffVal = tempCoeffs.find(tc => tc.id === v.id).w;

        // Projection coordonnées : X de 40 à 420, Y de 10 à 200 (W de -10 à +10)
        const px = 40 + (l / 100) * 380;
        const py = 110 - (coeffVal / 10) * 100;

        pointsStr += `${px},${py} `;
      }

      svg.innerHTML += `
        <polyline points="${pointsStr}" fill="none" stroke="${v.color}" stroke-width="1.8" opacity="0.45" stroke-dasharray="1.5,1.5" />
      `;
    });

    // Dessiner la barre verticale de la pénalité λ actuelle
    const currentLambdaX = 40 + (lambda / 100) * 380;
    svg.innerHTML += `
      <line x1="${currentLambdaX}" y1="10" x2="${currentLambdaX}" y2="200" stroke="var(--sol-magenta)" stroke-width="1.5" style="filter:drop-shadow(0 0 3px rgba(211,54,130,0.5));" />
    `;

    // Placer les points ronds sur la barre λ actuelle
    currentCoeffs.forEach(c => {
      const px = currentLambdaX;
      const py = 110 - (c.w / 10) * 100;

      svg.innerHTML += `
        <circle cx="${px}" cy="${py}" r="4" fill="${c.color}" stroke="#fff" stroke-width="1" />
      `;
    });

    // 2. Rendu de la liste latérale avec barres horizontales de valeur
    currentCoeffs.forEach(c => {
      const activeState = Math.abs(c.w) > 0.01 
        ? `<span style="color:var(--sol-green); font-weight:bold;">✅ Actif</span>`
        : `<span style="color:var(--sol-red); font-weight:bold;">❌ Éliminé</span>`;

      // Barre horizontale de coefficient
      const pct = Math.min(100, Math.max(0, (Math.abs(c.w) / 10) * 100));
      const isNegative = c.w < 0;
      const alignStyle = isNegative ? "justify-content: flex-end;" : "justify-content: flex-start;";
      const flexDir = isNegative ? "background-color:var(--sol-red);" : "background-color:var(--sol-cyan);";

      const row = document.createElement("div");
      row.className = "ui-reg-var-row";
      row.innerHTML = `
        <div style="font-weight:bold; color:${c.color};">${c.name}</div>
        <div style="font-family:var(--font-code);">${c.w > 0 ? "+" : ""}${c.w}</div>
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="background:var(--sol-base03); border:1px solid var(--sol-base01); height:8px; width:60px; border-radius:3px; overflow:hidden; display:flex; ${alignStyle}">
            <div style="height:100%; width:${pct}%; ${flexDir}"></div>
          </div>
          <div>${activeState}</div>
        </div>
      `;
      listDiv.appendChild(row);
    });

    // 3. Explication pédagogique dynamique selon l'état actuel
    let textExplain = "";
    if (type === "lasso") {
      if (lambda === 0) {
        textExplain = `
          <div style="font-weight:bold; color:var(--sol-cyan); margin-bottom:6px;">🟡 Lasso (λ = 0) : Régression standard (Moindres Carrés)</div>
          <div>Sans aucune pénalité, le modèle garde toutes les variables, y compris la variable de <b>bruit purement aléatoire</b> avec un coefficient de +1.5. C'est la zone propice au <strong>surapprentissage (overfitting)</strong>.</div>
        `;
        details.style.borderLeftColor = "var(--sol-cyan)";
      } else if (lambda > 0 && lambda < 35) {
        textExplain = `
          <div style="font-weight:bold; color:var(--sol-green); margin-bottom:6px;">🏆 Lasso (λ = ${lambda}) : Sélection intelligente active !</div>
          <div>La pénalité L1 a immédiatement **annulé** la variable de <i>Bruit</i> (w = 0) ! Elle a également fortement réduit le coefficient de la variable <i>Garage</i> (qui fait doublon avec la <i>Taille</i>). Le modèle se concentre sur les variables réellement importantes.</div>
        `;
        details.style.borderLeftColor = "var(--sol-green)";
      } else if (lambda >= 35 && lambda < 75) {
        textExplain = `
          <div style="font-weight:bold; color:var(--sol-yellow); margin-bottom:6px;">🟡 Lasso (λ = ${lambda}) : Sélection sévère</div>
          <div>La pénalité élimine maintenant l'<i>Âge</i> et le <i>Garage</i>. Seules les variables fondamentales <i>Taille</i> et <i>Chambres</i> survivent dans l'équation. C'est idéal pour obtenir un modèle **très parcimonieux** et simple.</div>
        `;
        details.style.borderLeftColor = "var(--sol-yellow)";
      } else {
        textExplain = `
          <div style="font-weight:bold; color:var(--sol-red); margin-bottom:6px;">⚠️ Lasso (λ = ${lambda}) : Sous-apprentissage (Underfitting)</div>
          <div>La pénalité L1 est trop agressive. Elle a tué quasiment tous les coefficients. Même la <i>Taille</i> (variable majeure) s'approche de zéro. Le modèle a perdu sa capacité prédictive.</div>
        `;
        details.style.borderLeftColor = "var(--sol-red)";
      }
    } else if (type === "ridge") {
      if (lambda === 0) {
        textExplain = `
          <div style="font-weight:bold; color:var(--sol-cyan); margin-bottom:6px;">🟡 Ridge (λ = 0) : Aucune régularisation</div>
          <div>Le modèle conserve tous les coefficients au maximum. La colinéarité entre <i>Taille</i> et <i>Garage</i> n'est pas traitée, ce qui gonfle artificiellement la variance du modèle.</div>
        `;
        details.style.borderLeftColor = "var(--sol-cyan)";
      } else {
        textExplain = `
          <div style="font-weight:bold; color:var(--sol-green); margin-bottom:6px;">🏆 Ridge (λ = ${lambda}) : Réduction de la variance (L2)</div>
          <div>Observez la différence avec Lasso ! La pénalité Ridge **ne réduit jamais aucun coefficient à exactement zéro** (toutes les variables restent vertes/actives). Elle courbe et atténue les poids de manière progressive pour stabiliser le modèle face au bruit, ce qui est parfait pour gérer la <b>colinéarité (les variables corrélées)</b> sans jeter d'information.</div>
        `;
        details.style.borderLeftColor = "var(--sol-green)";
      }
    } else {
      // ElasticNet
      textExplain = `
        <div style="font-weight:bold; color:var(--sol-magenta); margin-bottom:6px;">🏆 ElasticNet (λ = ${lambda}) : Le Compromis L1 + L2</div>
        <div>ElasticNet mélange le meilleur des deux mondes : il **élimine** complètement les variables de bruit (comme Lasso) tout en conservant les variables corrélées ensemble avec des coefficients stables (effet de groupe Ridge), évitant le choix aléatoire d'une variable par rapport à une autre.</div>
      `;
      details.style.borderLeftColor = "var(--sol-magenta)";
    }

    details.innerHTML = textExplain;
  };

  // Liaison événements : Contrôles
  const select = regCard.querySelector("#reg-type");
  const slider = regCard.querySelector("#reg-lambda");

  select.addEventListener("change", renderRegularization);
  slider.addEventListener("input", renderRegularization);

  // Initialisation par défaut (Lasso actif, lambda = 15)
  slider.value = 15;
  renderRegularization();

  return container;
};

/**
 * 🎯 Simulateur d'Ajustement de Modèle (Underfitting vs Optimal vs Overfitting)
 */
export const fittingSimulator = () => {
  const container = document.createElement("div");
  container.className = "ui-fitting-simulator";

  // Styles CSS localisés haut de gamme
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .ui-fit-container {
      background: var(--sol-base03);
      color: var(--sol-base0);
      border: 1px solid var(--sol-base02);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 25px;
      font-family: var(--font-sans);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }
    .ui-fit-title {
      font-family: var(--font-code);
      font-weight: 800;
      color: var(--sol-cyan);
      font-size: 1.1em;
      margin-bottom: 18px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      padding-bottom: 8px;
    }
    
    /* Contrôles */
    .ui-fit-controls {
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: var(--sol-base02);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .ui-fit-btn-group {
      display: flex;
      gap: 10px;
    }
    .ui-fit-btn {
      flex: 1;
      background: var(--sol-base03);
      color: var(--sol-base1);
      border: 1px solid var(--sol-base01);
      padding: 10px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
      font-size: 0.85em;
      transition: all 0.2s ease;
      text-align: center;
    }
    .ui-fit-btn:hover {
      border-color: var(--sol-cyan);
      color: var(--sol-cyan);
    }
    .ui-fit-btn.active {
      background: var(--sol-cyan);
      color: var(--sol-base03);
      border-color: var(--sol-cyan);
    }
    
    /* Workspace */
    .ui-fit-workspace {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 20px;
      align-items: start;
    }
    @media (max-width: 768px) {
      .ui-fit-workspace {
        grid-template-columns: 1fr;
      }
    }
    .ui-fit-plot-card {
      background: #001e26;
      border: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      border-radius: 8px;
      padding: 16px;
      display: flex;
      justify-content: center;
    }
    
    /* Explainer */
    .ui-fit-explain {
      background: var(--sol-base02);
      border-left: 4px solid var(--sol-cyan);
      border-radius: 4px;
      padding: 16px;
      font-size: 0.85em;
      line-height: 1.5;
      min-height: 220px;
    }
    
    /* Metrics */
    .ui-fit-metrics {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 15px;
      background: var(--sol-base03);
      padding: 12px;
      border-radius: 6px;
    }
    .ui-fit-metric-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9em;
    }
  `;
  container.appendChild(styleEl);

  const fitCard = document.createElement("div");
  fitCard.className = "ui-fit-container";
  container.appendChild(fitCard);

  // Titre
  const titleDiv = document.createElement("div");
  titleDiv.className = "ui-fit-title";
  titleDiv.innerText = "🎯 Simulateur de Surapprentissage : Underfitting vs Overfitting";
  fitCard.appendChild(titleDiv);

  // Contrôles
  const controls = document.createElement("div");
  controls.className = "ui-fit-controls";
  controls.innerHTML = `
    <div style="font-size:0.85em; font-weight:bold; color:var(--sol-base1);">🛠️ Complexité du Modèle (Degré du Polynôme de régression) :</div>
    <div class="ui-fit-btn-group">
      <button class="ui-fit-btn active" data-type="under">Degré 1 : Linéaire (Underfitting)</button>
      <button class="ui-fit-btn" data-type="optimal">Degré 2 : Quadratique (Idéal)</button>
      <button class="ui-fit-btn" data-type="over">Degré 9 : Polynominal (Overfitting)</button>
    </div>
  `;
  fitCard.appendChild(controls);

  // Workspace
  const workspace = document.createElement("div");
  workspace.className = "ui-fit-workspace";
  workspace.innerHTML = `
    <div class="ui-fit-plot-card">
      <svg id="fit-svg" viewBox="0 0 320 220" width="100%" height="220" style="overflow:visible;"></svg>
    </div>
    <div>
      <div class="ui-fit-explain" id="fit-details">
        <!-- Diagnostic dynamique -->
      </div>
      <div class="ui-fit-metrics">
        <div style="font-weight:bold; font-size:0.8em; text-transform:uppercase; color:var(--sol-base1);">📊 Mesure des Erreurs (MSE) :</div>
        <div class="ui-fit-metric-row">
          <span>Erreur Entraînement (Train) :</span>
          <span id="fit-err-train" style="font-family:var(--font-code); font-weight:bold;">0.00</span>
        </div>
        <div class="ui-fit-metric-row">
          <span>Erreur Généralisation (Test) :</span>
          <span id="fit-err-test" style="font-family:var(--font-code); font-weight:bold;">0.00</span>
        </div>
      </div>
    </div>
  `;
  fitCard.appendChild(workspace);

  // 10 points de données (X de 20 à 300, Y de 20 à 200)
  // X originaux normalisés de 1 à 10, Cible Y quadratique + bruit
  const trainPoints = [
    { x: 40, y: 170 },  // 1
    { x: 70, y: 120 },  // 2
    { x: 100, y: 80 },  // 3
    { x: 130, y: 55 },  // 4
    { x: 160, y: 45 },  // 5
    { x: 190, y: 60 },  // 6
    { x: 220, y: 85 },  // 7
    { x: 250, y: 130 }, // 8
    { x: 280, y: 180 }  // 9
  ];

  // Point test "nouveau" (la réalité générale)
  const testPoints = [
    { x: 145, y: 42 }, // Proche du sommet théorique
    { x: 265, y: 145 } // Proche de la courbe idéale
  ];

  const renderFit = (fitType) => {
    const svg = fitCard.querySelector("#fit-svg");
    svg.innerHTML = "";

    const details = fitCard.querySelector("#fit-details");
    const errTrainSpan = fitCard.querySelector("#fit-err-train");
    const errTestSpan = fitCard.querySelector("#fit-err-test");

    // 1. Dessiner grille et axes
    svg.innerHTML += `
      <line x1="20" y1="200" x2="300" y2="200" stroke="var(--sol-base02)" stroke-width="1.5" />
      <line x1="20" y1="20" x2="20" y2="200" stroke="var(--sol-base02)" stroke-width="1.5" />
      <text x="300" y="212" font-family="var(--font-code)" font-size="7.5" fill="var(--sol-base1)" text-anchor="end">X (Surface)</text>
      <text x="25" y="15" font-family="var(--font-code)" font-size="7.5" fill="var(--sol-base1)">Y (Prix)</text>
    `;

    // 2. Tracer la courbe du modèle selon la complexité
    let curvePath = "";
    if (fitType === "under") {
      // Ligne droite sous-ajustée : Y = -0.3 * X + 150
      const yStart = 150;
      const yEnd = 80;
      curvePath = `M 20 ${yStart} L 300 ${yEnd}`;
      
      errTrainSpan.innerText = "2.84 (Très Élevée)";
      errTrainSpan.style.color = "var(--sol-red)";
      errTestSpan.innerText = "3.12 (Très Élevée)";
      errTestSpan.style.color = "var(--sol-red)";

      details.innerHTML = `
        <div style="font-weight:bold; color:var(--sol-red); margin-bottom:6px;">❌ Degré 1 : Sous-ajustement (Underfitting)</div>
        <div>Le modèle (une simple droite) est **trop simpliste** pour capturer la courbure naturelle des données. Il passe "à côté" de la structure.</div>
        <div style="margin-top:10px; font-weight:bold; color:var(--sol-base1);">
          👉 Conséquence : Biais élevé. Le modèle fait de grosses erreurs sur l'entraînement ET sur le test.
        </div>
      `;
      details.style.borderLeftColor = "var(--sol-red)";
    } else if (fitType === "optimal") {
      // Courbe idéale (Parabole inversée)
      // Y = 0.003 * (X - 150)^2 + 45
      curvePath = "M 20 180";
      for (let x = 20; x <= 300; x += 5) {
        const y = 0.0035 * Math.pow(x - 155, 2) + 42;
        curvePath += ` L ${x} ${y}`;
      }

      errTrainSpan.innerText = "0.15 (Faible)";
      errTrainSpan.style.color = "var(--sol-green)";
      errTestSpan.innerText = "0.18 (Faible - Idéal !)";
      errTestSpan.style.color = "var(--sol-green)";

      details.innerHTML = `
        <div style="font-weight:bold; color:var(--sol-green); margin-bottom:6px;">🏆 Degré 2 : Ajustement Idéal (Compromis Biais-Variance)</div>
        <div>Le modèle a capturé la **tendance générale quadratique** du phénomène. Il ignore le bruit résiduel pour se focaliser sur la vraie relation physique.</div>
        <div style="margin-top:10px; font-weight:bold; color:var(--sol-base1);">
          👉 Conséquence : Faible biais et faible variance. Excellente capacité de généralisation sur les nouvelles données (Test).
        </div>
      `;
      details.style.borderLeftColor = "var(--sol-green)";
    } else {
      // Overfitting : Polynôme oscillant de haut degré passant exactement par les points train !
      curvePath = "M 20 220";
      for (let x = 20; x <= 300; x += 2) {
        // Formule de Fourier / Polynomiale ajustée pour passer pile par les points mais osciller follement
        let y = 0.0035 * Math.pow(x - 155, 2) + 42;
        // Ajout d'oscillations folles
        y += 45 * Math.sin((x - 20) / 13) * Math.cos((x - 60) / 25);
        
        // Clamper dans le cadre du SVG pour ne pas déborder salement
        y = Math.max(10, Math.min(210, y));

        if (x === 20) curvePath = `M ${x} ${y}`;
        else curvePath += ` L ${x} ${y}`;
      }

      errTrainSpan.innerText = "0.00 (Nulle !)";
      errTrainSpan.style.color = "var(--sol-cyan)";
      errTestSpan.innerText = "5.85 (Catastrophique !)";
      errTestSpan.style.color = "var(--sol-red)";

      details.innerHTML = `
        <div style="font-weight:bold; color:var(--sol-cyan); margin-bottom:6px;">⚡ Degré 9 : Surapprentissage (Overfitting)</div>
        <div>Le modèle est **trop complexe**. Il a cherché à mémoriser chaque point d'entraînement, apprenant par cœur le bruit aléatoire. En dehors de ces points précis, la courbe oscille de manière absurde et irréaliste.</div>
        <div style="margin-top:10px; font-weight:bold; color:var(--sol-red);">
          👉 Conséquence : Variance extrême. L'erreur d'entraînement est à 0.00, mais l'erreur sur les nouvelles données (Test) explose !
        </div>
      `;
      details.style.borderLeftColor = "var(--sol-cyan)";
    }

    // Dessiner la ligne du modèle
    svg.innerHTML += `
      <path d="${curvePath}" fill="none" stroke="${fitType === "optimal" ? "var(--sol-green)" : fitType === "under" ? "var(--sol-red)" : "var(--sol-cyan)"}" stroke-width="2.2" />
    `;

    // 3. Dessiner les points d'entraînement (Vert)
    trainPoints.forEach(p => {
      svg.innerHTML += `
        <circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--sol-green)" stroke="var(--sol-base03)" stroke-width="1" />
      `;
    });

    // 4. Dessiner les points de test (Rouge)
    testPoints.forEach(p => {
      svg.innerHTML += `
        <circle cx="${p.x}" cy="${p.y}" r="5" fill="var(--sol-orange)" stroke="white" stroke-width="1.2" />
      `;
    });

    // Légende
    svg.innerHTML += `
      <g transform="translate(180, 20)">
        <circle cx="0" cy="0" r="3" fill="var(--sol-green)" />
        <text x="8" y="3.5" font-family="var(--font-sans)" font-size="7" fill="var(--sol-base1)">Train (Données connues)</text>
        <circle cx="0" cy="10" r="3.5" fill="var(--sol-orange)" />
        <text x="8" y="13.5" font-family="var(--font-sans)" font-size="7" fill="var(--sol-base1)">Test (Nouvelles données)</text>
      </g>
    `;
  };

  // Liaison événements : Boutons
  const btns = fitCard.querySelectorAll(".ui-fit-btn");
  btns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      btns.forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      renderFit(e.target.getAttribute("data-type"));
    });
  });

  // Initialisation par défaut (Idéal actif au départ)
  setTimeout(() => {
    const optBtn = fitCard.querySelector('[data-type="optimal"]');
    if (optBtn) optBtn.click();
  }, 50);

  return container;
};

/**
 * 🍕 Simulateur Interactif de Diagramme Circulaire (Camembert & Donut vs Bar)
 */
export const pieSimulator = () => {
  const container = document.createElement("div");
  container.className = "ui-pie-simulator";

  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .ui-pie-container {
      background: var(--sol-base03);
      color: var(--sol-base0);
      border: 1px solid var(--sol-base02);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 25px;
      font-family: var(--font-sans);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }
    .ui-pie-title {
      font-family: var(--font-code);
      font-weight: 800;
      color: var(--sol-cyan);
      font-size: 1.1em;
      margin-bottom: 18px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      padding-bottom: 8px;
    }
    
    .ui-pie-controls {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 15px;
      background: var(--sol-base02);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    @media (max-width: 600px) {
      .ui-pie-controls {
        grid-template-columns: 1fr;
      }
    }
    .ui-pie-control-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .ui-pie-label {
      font-size: 0.85em;
      font-weight: bold;
      color: var(--sol-base1);
    }
    .ui-pie-select {
      background: var(--sol-base03);
      color: var(--sol-base2);
      border: 1px solid var(--sol-base01);
      padding: 8px 12px;
      border-radius: 6px;
      font-family: var(--font-sans);
      outline: none;
      cursor: pointer;
    }
    
    .ui-pie-workspace {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 20px;
      align-items: start;
    }
    @media (max-width: 768px) {
      .ui-pie-workspace {
        grid-template-columns: 1fr;
      }
    }
    
    .ui-pie-plot-card {
      background: #001e26;
      border: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      border-radius: 8px;
      padding: 20px;
      position: relative;
      min-height: 320px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .ui-pie-tooltip {
      position: absolute;
      background: var(--sol-base02);
      border: 1px solid var(--sol-cyan);
      color: var(--sol-base2);
      padding: 10px 14px;
      border-radius: 6px;
      font-size: 0.8em;
      pointer-events: none;
      display: none;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
      z-index: 10;
      max-width: 220px;
      line-height: 1.4;
    }
    
    .ui-pie-slice {
      cursor: pointer;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
    }
    .ui-pie-slice:hover {
      opacity: 1.0 !important;
      transform: scale(1.03);
    }
    
    .ui-pie-bar-wrapper {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 10px 20px;
    }
    .ui-pie-bar-item {
      display: grid;
      grid-template-columns: 120px 1fr 50px;
      align-items: center;
      gap: 15px;
      cursor: pointer;
    }
    .ui-pie-bar-label {
      font-size: 0.85em;
      font-weight: bold;
      color: var(--sol-base1);
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    }
    .ui-pie-bar-track {
      background: var(--sol-base02);
      height: 20px;
      border-radius: 10px;
      overflow: hidden;
      position: relative;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .ui-pie-bar-fill {
      height: 100%;
      border-radius: 9px;
      transition: width 0.6s cubic-bezier(0.1, 0.8, 0.3, 1);
    }
    .ui-pie-bar-val {
      font-family: var(--font-code);
      font-size: 0.85em;
      font-weight: bold;
      color: var(--sol-cyan);
      text-align: right;
    }
  `;
  container.appendChild(styleEl);

  const pieCard = document.createElement("div");
  pieCard.className = "ui-pie-container";
  container.appendChild(pieCard);

  // Titre
  const titleDiv = document.createElement("div");
  titleDiv.className = "ui-pie-title";
  titleDiv.innerText = "🍕 Expérience Cognitive : Camembert vs Donut vs Bar Chart";
  pieCard.appendChild(titleDiv);

  // Contrôles
  const controls = document.createElement("div");
  controls.className = "ui-pie-controls";
  controls.innerHTML = `
    <div class="ui-pie-control-group">
      <label class="ui-pie-label">📐 Type de Représentation Graphique :</label>
      <select class="ui-pie-select" id="pie-type-select">
        <option value="pie">Diagramme Circulaire (Camembert classique)</option>
        <option value="donut">Diagramme en Anneau (Donut Chart - Moderne)</option>
        <option value="bar">Diagramme à Barres (Bar Chart - Linéaire)</option>
      </select>
    </div>
    <div class="ui-pie-control-group">
      <label class="ui-pie-label">🔢 Complexité (Nombre de Catégories) :</label>
      <select class="ui-pie-select" id="pie-cats-select">
        <option value="2">2 Catégories (Simple - Idéal pour camembert)</option>
        <option value="3">3 Catégories (Modéré - Lisible)</option>
        <option value="5">5 Catégories (Complexe - Surchargé)</option>
      </select>
    </div>
  `;
  pieCard.appendChild(controls);

  // Workspace
  const workspace = document.createElement("div");
  workspace.className = "ui-pie-workspace";
  pieCard.appendChild(workspace);

  // Plot Area
  const plotCard = document.createElement("div");
  plotCard.className = "ui-pie-plot-card";
  plotCard.innerHTML = `
    <div class="ui-pie-tooltip" id="pie-tip"></div>
    <div id="pie-render-target" style="width:100%; height:100%; display:flex; justify-content:center; align-items:center;"></div>
  `;
  workspace.appendChild(plotCard);

  // Sidebar
  const sidebar = document.createElement("div");
  sidebar.className = "ui-pie-sidebar";
  workspace.appendChild(sidebar);

  // Datasets
  const datasets = {
    "2": [
      { label: "Mission Réussie", pct: 72, color: "var(--sol-green)" },
      { label: "Mission Échouée", pct: 28, color: "var(--sol-red)" }
    ],
    "3": [
      { label: "Vaisseau Trappist-1e", pct: 55, color: "var(--sol-blue)" },
      { label: "Vaisseau 55 Cancri e", pct: 25, color: "var(--sol-orange)" },
      { label: "Vaisseau Kepler-186f", pct: 20, color: "var(--sol-yellow)" }
    ],
    "5": [
      { label: "Ingénieurs", pct: 38, color: "var(--sol-blue)" },
      { label: "Scientifiques", pct: 24, color: "var(--sol-green)" },
      { label: "Pilotes de vol", pct: 18, color: "var(--sol-orange)" },
      { label: "Commandants", pct: 12, color: "var(--sol-violet)" },
      { label: "Touristes spatiaux", pct: 8, color: "var(--sol-magenta)" }
    ]
  };

  const renderPieChart = () => {
    const chartType = pieCard.querySelector("#pie-type-select").value;
    const catsCount = pieCard.querySelector("#pie-cats-select").value;
    const target = pieCard.querySelector("#pie-render-target");
    const tip = pieCard.querySelector("#pie-tip");

    target.innerHTML = "";
    tip.style.display = "none";

    const data = datasets[catsCount];
    
    // Logique d'analyse pédagogique selon la configuration
    const logs = [];
    logs.push(ui.logLine({ message: `Config: ${catsCount} catégories en mode ${chartType.toUpperCase()}`, type: "info" }));

    if (chartType === "bar") {
      logs.push(ui.logLine({ message: "Représentation : Barres Linéaires", type: "success" }));
      logs.push(ui.logLine({ message: "Avantage : Lecture ultra-rapide. L'œil compare des longueurs alignées.", type: "success" }));
      logs.push(ui.logLine({ message: "Diagnostic : C'est le choix le plus précis et robuste scientifiquement.", type: "success" }));

      // Render Bar Chart
      const barWrapper = document.createElement("div");
      barWrapper.className = "ui-pie-bar-wrapper";

      data.forEach((d, i) => {
        const item = document.createElement("div");
        item.className = "ui-pie-bar-item";
        item.innerHTML = `
          <div class="ui-pie-bar-label" title="${d.label}">${d.label}</div>
          <div class="ui-pie-bar-track">
            <div class="ui-pie-bar-fill" style="width: 0%; background: ${d.color};"></div>
          </div>
          <div class="ui-pie-bar-val">${d.pct}%</div>
        `;

        // Triggger animation
        setTimeout(() => {
          const fill = item.querySelector(".ui-pie-bar-fill");
          if (fill) fill.style.width = `${d.pct}%`;
        }, 30);

        // Interaction au survol
        item.addEventListener("mouseenter", () => {
          tip.innerHTML = `<b>${d.label}</b> : ${d.pct}% du total`;
          tip.style.display = "block";
          tip.style.left = "20px";
          tip.style.top = "20px";
        });
        item.addEventListener("mouseleave", () => {
          tip.style.display = "none";
        });

        barWrapper.appendChild(item);
      });

      target.appendChild(barWrapper);

    } else {
      // Render SVG Pie/Donut Chart
      const isDonut = chartType === "donut";
      if (isDonut) {
        logs.push(ui.logLine({ message: "Représentation : Diagramme en Anneau (Donut)", type: "info" }));
        logs.push(ui.logLine({ message: "Avantage : Centre libre. L'œil compare des longueurs d'arcs (plus facile que des angles).", type: "success" }));
      } else {
        logs.push(ui.logLine({ message: "Représentation : Camembert classique (Pie)", type: "warning" }));
        logs.push(ui.logLine({ message: "Inconvénient : L'œil gère mal la lecture d'angles et d'aires.", type: "warning" }));
      }

      if (catsCount === "5") {
        logs.push(ui.logLine({ message: "⚠️ Risque cognitif : 5 secteurs. Dur de différencier 12% et 8% d'un coup d'œil !", type: "danger" }));
      } else if (catsCount === "2") {
        logs.push(ui.logLine({ message: "💡 Parfait : 2 secteurs. La proportion majoritaire saute aux yeux.", type: "success" }));
      }

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 300 300");
      svg.setAttribute("width", "250");
      svg.setAttribute("height", "250");
      svg.style.overflow = "visible";

      const cx = 150;
      const cy = 150;
      const r = 110;

      let currentAngle = -Math.PI / 2; // -90 degres (haut)

      data.forEach((d) => {
        const sliceAngle = (d.pct / 100) * 2 * Math.PI;
        const endAngle = currentAngle + sliceAngle;

        const x1 = cx + r * Math.cos(currentAngle);
        const y1 = cy + r * Math.sin(currentAngle);
        const x2 = cx + r * Math.cos(endAngle);
        const y2 = cy + r * Math.sin(endAngle);

        const largeArcFlag = d.pct > 50 ? 1 : 0;

        const pathD = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathD);
        path.setAttribute("fill", d.color);
        path.setAttribute("stroke", "#001e26");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("opacity", "0.85");
        path.setAttribute("class", "ui-pie-slice");
        path.style.transformOrigin = "150px 150px";

        // Interactions
        path.addEventListener("mouseenter", (e) => {
          path.setAttribute("opacity", "1.0");
          path.setAttribute("stroke", "#fff");
          path.setAttribute("stroke-width", "3");

          tip.innerHTML = `<b>${d.label}</b><br><span style="font-family:var(--font-code); font-size:1.2em; font-weight:bold; color:${d.color}">${d.pct}%</span>`;
          tip.style.display = "block";
          
          // Position relative de la bulle
          const rect = target.getBoundingClientRect();
          const midAngle = currentAngle + sliceAngle / 2;
          const tx = cx + (r * 0.6) * Math.cos(midAngle);
          const ty = cy + (r * 0.6) * Math.sin(midAngle);
          tip.style.left = `${tx + 40}px`;
          tip.style.top = `${ty + 40}px`;

          if (isDonut) {
            const innerVal = target.querySelector("#donut-center-val");
            if (innerVal) {
              innerVal.innerText = `${d.pct}%`;
              innerVal.style.fill = d.color;
              const innerLbl = target.querySelector("#donut-center-lbl");
              if (innerLbl) innerLbl.innerText = d.label;
            }
          }
        });

        path.addEventListener("mouseleave", () => {
          path.setAttribute("opacity", "0.85");
          path.setAttribute("stroke", "#001e26");
          path.setAttribute("stroke-width", "2");
          tip.style.display = "none";

          if (isDonut) {
            const innerVal = target.querySelector("#donut-center-val");
            if (innerVal) {
              innerVal.innerText = "100%";
              innerVal.style.fill = "var(--sol-base1)";
              const innerLbl = target.querySelector("#donut-center-lbl");
              if (innerLbl) innerLbl.innerText = "Total";
            }
          }
        });

        svg.appendChild(path);
        currentAngle = endAngle;
      });

      // Si Donut : masquer le centre
      if (isDonut) {
        const centerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        centerCircle.setAttribute("cx", cx);
        centerCircle.setAttribute("cy", cy);
        centerCircle.setAttribute("r", String(r * 0.62));
        centerCircle.setAttribute("fill", "#001e26");
        svg.appendChild(centerCircle);

        // Texte central
        const textVal = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textVal.setAttribute("x", cx);
        textVal.setAttribute("y", String(cy + 5));
        textVal.setAttribute("text-anchor", "middle");
        textVal.setAttribute("id", "donut-center-val");
        textVal.setAttribute("font-family", "var(--font-code)");
        textVal.setAttribute("font-size", "22");
        textVal.setAttribute("font-weight", "bold");
        textVal.setAttribute("fill", "var(--sol-base1)");
        textVal.innerText = "100%";
        svg.appendChild(textVal);

        const textLbl = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textLbl.setAttribute("x", cx);
        textLbl.setAttribute("y", String(cy + 24));
        textLbl.setAttribute("text-anchor", "middle");
        textLbl.setAttribute("id", "donut-center-lbl");
        textLbl.setAttribute("font-family", "var(--font-sans)");
        textLbl.setAttribute("font-size", "9");
        textLbl.setAttribute("fill", "var(--sol-base01)");
        textLbl.innerText = "Total";
        svg.appendChild(textLbl);
      }

      target.appendChild(svg);
    }

    // Mettre à jour la console de bord
    sidebar.innerHTML = "";
    sidebar.appendChild(mol.terminalConsole({ header: "Diagnostic Cognitif", logs: logs }));
  };

  // Liaison événements
  pieCard.querySelector("#pie-type-select").addEventListener("change", renderPieChart);
  pieCard.querySelector("#pie-cats-select").addEventListener("change", renderPieChart);

  // Premier rendu
  setTimeout(renderPieChart, 50);

  return container;
};

/**
 * 🕸️ Simulateur Interactif de Diagramme Radar (Spider Chart)
 */
export const radarSimulator = () => {
  const container = document.createElement("div");
  container.className = "ui-radar-simulator";

  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .ui-radar-container {
      background: var(--sol-base03);
      color: var(--sol-base0);
      border: 1px solid var(--sol-base02);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 25px;
      font-family: var(--font-sans);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    }
    .ui-radar-title {
      font-family: var(--font-code);
      font-weight: 800;
      color: var(--sol-cyan);
      font-size: 1.1em;
      margin-bottom: 18px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      padding-bottom: 8px;
    }
    
    .ui-radar-controls {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 15px;
      background: var(--sol-base02);
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    @media (max-width: 768px) {
      .ui-radar-controls {
        grid-template-columns: 1fr;
      }
    }
    .ui-radar-control-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .ui-radar-label {
      font-size: 0.85em;
      font-weight: bold;
      color: var(--sol-base1);
    }
    .ui-radar-select {
      background: var(--sol-base03);
      color: var(--sol-base2);
      border: 1px solid var(--sol-base01);
      padding: 8px 12px;
      border-radius: 6px;
      font-family: var(--font-sans);
      outline: none;
      cursor: pointer;
    }
    
    .ui-radar-workspace {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 20px;
      align-items: start;
    }
    @media (max-width: 768px) {
      .ui-radar-workspace {
        grid-template-columns: 1fr;
      }
    }
    
    .ui-radar-plot-card {
      background: #001e26;
      border: 1.5px solid rgba(var(--sol-base1-rgb), 0.1);
      border-radius: 8px;
      padding: 20px;
      position: relative;
      min-height: 340px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .ui-radar-tooltip {
      position: absolute;
      background: var(--sol-base02);
      border: 1px solid var(--sol-cyan);
      color: var(--sol-base2);
      padding: 10px 14px;
      border-radius: 6px;
      font-size: 0.8em;
      pointer-events: none;
      display: none;
      box-shadow: 0 4px 15px rgba(0,0,0,0.5);
      z-index: 10;
      max-width: 220px;
      line-height: 1.4;
    }
    
    .ui-radar-polygon {
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .ui-radar-grid-line {
      stroke: var(--sol-base01);
      stroke-width: 0.8;
      stroke-dasharray: 4, 4;
      opacity: 0.6;
    }
    .ui-radar-grid-poly {
      fill: none;
      stroke: rgba(131, 148, 150, 0.12);
      stroke-width: 1;
    }
  `;
  container.appendChild(styleEl);

  const radarCard = document.createElement("div");
  radarCard.className = "ui-radar-container";
  container.appendChild(radarCard);

  // Titre
  const titleDiv = document.createElement("div");
  titleDiv.className = "ui-radar-title";
  titleDiv.innerText = "🕸️ Démo Interactive : Le Diagramme Radar & Les Biais de Profils";
  radarCard.appendChild(titleDiv);

  // Contrôles
  const controls = document.createElement("div");
  controls.className = "ui-radar-controls";
  controls.innerHTML = `
    <div class="ui-radar-control-group">
      <label class="ui-radar-label">🧑‍🚀 Profil de l'Équipage à afficher :</label>
      <select class="ui-radar-select" id="radar-profile-select">
        <option value="alpha">Alpha (Pilote d'Élite)</option>
        <option value="beta">Bêta (Scientifique de mission)</option>
        <option value="gamma">Gamma (Ingénieur de bord)</option>
        <option value="all">Superposition (Comparaison des 3)</option>
      </select>
    </div>
    <div class="ui-radar-control-group">
      <label class="ui-radar-label">🎨 Style visuel des polygones :</label>
      <select class="ui-radar-select" id="radar-style-select">
        <option value="filled">Surfaces pleines (Translucides)</option>
        <option value="stroke">Contours seuls (Lignes distinctes)</option>
      </select>
    </div>
    <div class="ui-radar-control-group">
      <label class="ui-radar-label">🔄 Ordre d'affichage des axes :</label>
      <select class="ui-radar-select" id="radar-order-select">
        <option value="standard">Ordre Standard (Groupé par domaine)</option>
        <option value="modified">Ordre Alternatif (Démontre le biais de forme)</option>
      </select>
    </div>
  `;
  radarCard.appendChild(controls);

  // Workspace
  const workspace = document.createElement("div");
  workspace.className = "ui-radar-workspace";
  radarCard.appendChild(workspace);

  // Plot Area
  const plotCard = document.createElement("div");
  plotCard.className = "ui-radar-plot-card";
  plotCard.innerHTML = `
    <div class="ui-radar-tooltip" id="radar-tip"></div>
    <div id="radar-render-target" style="width:100%; height:100%; display:flex; justify-content:center; align-items:center;"></div>
  `;
  workspace.appendChild(plotCard);

  // Sidebar
  const sidebar = document.createElement("div");
  sidebar.className = "ui-radar-sidebar";
  workspace.appendChild(sidebar);

  // Métriques et Axes
  const skills = [
    { id: "pilot", label: "Pilotage", stdIdx: 0, altIdx: 0 },
    { id: "endur", label: "Endurance", stdIdx: 1, altIdx: 3 },
    { id: "maint", label: "Maintenance", stdIdx: 2, altIdx: 1 },
    { id: "robot", label: "Robotique", stdIdx: 3, altIdx: 5 },
    { id: "astro", label: "Astrophysique", stdIdx: 4, altIdx: 2 },
    { id: "comm", label: "Communication", stdIdx: 5, altIdx: 4 }
  ];

  const crew = {
    alpha: {
      name: "Astronaute Alpha (Pilote)",
      color: "var(--sol-blue)",
      colorRgba: "rgba(38, 139, 210, 0.25)",
      skills: { pilot: 9.5, endur: 8.0, maint: 5.0, robot: 4.5, astro: 3.0, comm: 6.0 }
    },
    beta: {
      name: "Astronaute Bêta (Scientifique)",
      color: "var(--sol-yellow)",
      colorRgba: "rgba(181, 137, 0, 0.25)",
      skills: { pilot: 4.0, endur: 6.5, maint: 4.0, robot: 7.5, astro: 9.5, comm: 8.0 }
    },
    gamma: {
      name: "Astronaute Gamma (Ingénieur)",
      color: "var(--sol-green)",
      colorRgba: "rgba(133, 153, 0, 0.25)",
      skills: { pilot: 6.5, endur: 7.0, maint: 9.0, robot: 8.5, astro: 5.0, comm: 5.0 }
    }
  };

  const renderRadar = () => {
    const profile = radarCard.querySelector("#radar-profile-select").value;
    const drawStyle = radarCard.querySelector("#radar-style-select").value;
    const orderStyle = radarCard.querySelector("#radar-order-select").value;
    const target = radarCard.querySelector("#radar-render-target");
    const tip = radarCard.querySelector("#radar-tip");

    target.innerHTML = "";
    tip.style.display = "none";

    const isAll = profile === "all";
    const useFilled = drawStyle === "filled";
    const isStdOrder = orderStyle === "standard";

    // 1. Déterminer l'ordre des axes
    const activeAxes = [...skills].sort((a, b) => {
      return isStdOrder ? (a.stdIdx - b.stdIdx) : (a.altIdx - b.altIdx);
    });

    const K = activeAxes.length;
    const cx = 160;
    const cy = 160;
    const R = 110; // Rayon max (pour la note 10/10)

    const logs = [];
    logs.push(ui.logLine({ message: `Visualisation Radar active. Axes : ${K} dimensions.`, type: "info" }));

    if (isAll) {
      logs.push(ui.logLine({ message: "Mode : Superposition des 3 profils d'astronautes", type: "warning" }));
      logs.push(ui.logLine({ message: "⚠️ Risque d'occlusion : Les surfaces se croisent et masquent les grilles sous-jacentes.", type: "danger" }));
    } else {
      logs.push(ui.logLine({ message: `Affiche : ${crew[profile].name}`, type: "success" }));
    }

    if (isStdOrder) {
      logs.push(ui.logLine({ message: "Ordre des axes : Standardisé (cohérent)", type: "info" }));
    } else {
      logs.push(ui.logLine({ message: "🔄 Ordre Alternatif : Les axes ont été mélangés !", type: "warning" }));
      logs.push(ui.logLine({ message: "💡 Constat : La surface perçue à l'écran change de forme. Pourtant, les notes individuelles sont inchangées !", type: "success" }));
      logs.push(ui.logLine({ message: "🚨 Avertissement : Le cerveau est influencé par la symétrie du radar, un piège analytique majeur !", type: "danger" }));
    }

    // Créer le SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 320 320");
    svg.setAttribute("width", "280");
    svg.setAttribute("height", "280");
    svg.style.overflow = "visible";

    // 2. Dessiner la grille de cercles polygonaux (les niveaux 2, 4, 6, 8, 10)
    const levels = [2, 4, 6, 8, 10];
    levels.forEach(lvl => {
      const scale = lvl / 10;
      let pathPoints = [];
      for (let i = 0; i < K; i++) {
        const angle = -Math.PI / 2 + (2 * Math.PI * i) / K;
        const px = cx + R * scale * Math.cos(angle);
        const py = cy + R * scale * Math.sin(angle);
        pathPoints.push(`${px},${py}`);
      }
      const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      polygon.setAttribute("points", pathPoints.join(" "));
      polygon.setAttribute("class", "ui-radar-grid-poly");
      svg.appendChild(polygon);

      // Label de niveau sur l'axe du haut
      const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      labelText.setAttribute("x", String(cx + 4));
      labelText.setAttribute("y", String(cy - R * scale + 3));
      labelText.setAttribute("font-family", "var(--font-code)");
      labelText.setAttribute("font-size", "7");
      labelText.setAttribute("fill", "var(--sol-base01)");
      labelText.innerText = String(lvl);
      svg.appendChild(labelText);
    });

    // 3. Dessiner les axes radiaux et leurs étiquettes
    activeAxes.forEach((axis, i) => {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / K;
      
      // Ligne d'axe
      const ax = cx + R * Math.cos(angle);
      const ay = cy + R * Math.sin(angle);
      
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(cx));
      line.setAttribute("y1", String(cy));
      line.setAttribute("x2", String(ax));
      line.setAttribute("y2", String(ay));
      line.setAttribute("class", "ui-radar-grid-line");
      svg.appendChild(line);

      // Label de l'axe
      const textDist = R + 18;
      const lx = cx + textDist * Math.cos(angle);
      const ly = cy + textDist * Math.sin(angle);
      
      const labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      labelText.setAttribute("x", String(lx));
      labelText.setAttribute("y", String(ly + 3));
      labelText.setAttribute("font-family", "var(--font-sans)");
      labelText.setAttribute("font-size", "9");
      labelText.setAttribute("font-weight", "bold");
      labelText.setAttribute("fill", "var(--sol-base1)");
      
      // Alignement du texte selon la position
      if (Math.cos(angle) > 0.1) labelText.setAttribute("text-anchor", "start");
      else if (Math.cos(angle) < -0.1) labelText.setAttribute("text-anchor", "end");
      else labelText.setAttribute("text-anchor", "middle");

      labelText.innerText = axis.label;
      svg.appendChild(labelText);
    });

    // 4. Fonction utilitaire pour dessiner un profil d'astronaute
    const drawCrewProfile = (cKey, cData) => {
      let pathPoints = [];
      const dotsData = [];

      activeAxes.forEach((axis, i) => {
        const angle = -Math.PI / 2 + (2 * Math.PI * i) / K;
        const score = cData.skills[axis.id] || 0;
        const px = cx + R * (score / 10) * Math.cos(angle);
        const py = cy + R * (score / 10) * Math.sin(angle);
        pathPoints.push(`${px},${py}`);
        dotsData.push({ px, py, score, label: axis.label });
      });

      // Polygone
      const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      poly.setAttribute("points", pathPoints.join(" "));
      poly.setAttribute("stroke", cData.color);
      poly.setAttribute("stroke-width", "2.5");
      poly.setAttribute("fill", useFilled ? cData.colorRgba : "none");
      poly.setAttribute("class", "ui-radar-polygon");
      svg.appendChild(poly);

      // Points d'ancrage interactifs
      dotsData.forEach(dot => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", String(dot.px));
        circle.setAttribute("cy", String(dot.py));
        circle.setAttribute("r", "4");
        circle.setAttribute("fill", cData.color);
        circle.setAttribute("stroke", "white");
        circle.setAttribute("stroke-width", "1");
        circle.style.cursor = "pointer";

        circle.addEventListener("mouseenter", () => {
          circle.setAttribute("r", "6");
          circle.setAttribute("stroke-width", "2");

          tip.innerHTML = `
            <b>${cData.name}</b><br>
            Compétence <b>${dot.label}</b> : <span style="font-family:var(--font-code); font-weight:bold; color:${cData.color}">${dot.score}/10</span>
          `;
          tip.style.display = "block";
          tip.style.left = `${dot.px + 20}px`;
          tip.style.top = `${dot.py - 10}px`;
        });

        circle.addEventListener("mouseleave", () => {
          circle.setAttribute("r", "4");
          circle.setAttribute("stroke-width", "1");
          tip.style.display = "none";
        });

        svg.appendChild(circle);
      });
    };

    // 5. Rendu des profils demandés
    if (isAll) {
      Object.keys(crew).forEach(cKey => {
        drawCrewProfile(cKey, crew[cKey]);
      });
    } else {
      drawCrewProfile(profile, crew[profile]);
    }

    target.appendChild(svg);

    // Mettre à jour la console de diagnostic
    sidebar.innerHTML = "";
    sidebar.appendChild(mol.terminalConsole({ header: "Inspecteur de Profils", logs: logs }));
  };

  // Liaison événements
  radarCard.querySelector("#radar-profile-select").addEventListener("change", renderRadar);
  radarCard.querySelector("#radar-style-select").addEventListener("change", renderRadar);
  radarCard.querySelector("#radar-order-select").addEventListener("change", renderRadar);

  // Premier rendu
  setTimeout(renderRadar, 50);

  return container;
};