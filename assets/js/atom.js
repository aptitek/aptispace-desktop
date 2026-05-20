// ==========================================
// atom.js - Les briques indivisibles (DRY/KISS)
// ==========================================
import { theme } from "./core.js";

/**
 * 📝 Texte générique paramétrable
 */
export const text = ({ content, type = "body", color = "inherit" }) => {
  const classMap = {
    title: "font-size: 1.4em; font-weight: bold; margin-bottom: 0.5em;",
    label: "ui-card-header", 
    value: "ui-value",
    body: "font-size: 1em;"
  };
  
  const className = classMap[type] || "";
  const styleAttr = color !== "inherit" ? `style="color: ${color};"` : "";
  return `<div class="${className} atom-text-${type}" ${styleAttr}>${content}</div>`;
};

/**
 * 🏷️ Badge / Tag
 */
export const badge = ({ text, colorClass = "" }) => `
  <span class="badge ${colorClass}">${text}</span>
`;

/**
 * 📊 Jauge / ProgressBar
 */
export const progressBar = ({ value, max = 100, colorClass = "" }) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  return `
    <div class="ui-progress">
      <div class="ui-progress-bar ${colorClass}" style="width: ${percent}%;"></div>
    </div>
  `;
};

/**
 * 🟩 Data Block
 */
export const dataBlock = ({ type = "train" }) => {
  const colorClass = type === "train" ? "is-info" : (type === "test" ? "is-success" : "");
  return `<div class="badge ${colorClass} is-block"></div>`;
};

/**
 * 💻 Conteneur Fenêtre Terminal
 */
export const terminalWindow = ({ header = "Console", content = "" }) => `
  <div class="ui-terminal">
    <div class="ui-terminal-header">
      <span class="ui-terminal-title">${header}</span>
    </div>
    <div class="ui-terminal-body">
      ${content}
    </div>
  </div>
`;

/**
 * 💬 Ligne de Log Terminal
 */
export const logLine = ({ message, prefix = "(>", type = "info" }) => {
  const colorClass = `is-${type}`;
  return `
    <div class="ui-terminal-line ${colorClass}">
      <span class="prefix">${prefix}</span> 
      <span class="message">${message}</span>
    </div>
  `;
};

/**
 * ⏹️ Bouton
 */
export const button = ({ label }) => `
  <button class="btn btn-warning">${label}</button>
`;

/**
 * 🎛️ Multitab Toggle (Compatible avec le viewof d'Observable/OJS)
 */
export const multitab = ({ options = [], value = "", colorClass = "is-info" }) => {
  const container = document.createElement("div");
  container.className = "ui-multitab-container";
  container.style.cssText = `
    display: inline-flex;
    background: var(--sol-base2);
    border: 1px solid var(--sol-base1);
    border-radius: 20px;
    padding: 4px;
    gap: 4px;
    margin-bottom: 20px;
    box-shadow: inset 0 2px 4px rgba(0, 43, 54, 0.05);
    flex-wrap: wrap;
  `;

  // Déterminer la valeur initiale
  let activeValue = value || options[0] || "";
  container.value = activeValue;

  const btnColor = colorClass === "is-info" ? "var(--sol-blue)" : "var(--sol-green)";

  // Générer les onglets
  const buttons = options.map(opt => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = opt;
    btn.style.cssText = `
      border: none;
      padding: 6px 16px;
      border-radius: 16px;
      font-family: inherit;
      font-size: 0.85em;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      background: transparent;
      color: var(--sol-base01);
    `;

    const setStyle = (isActive) => {
      if (isActive) {
        btn.style.background = btnColor;
        btn.style.color = "var(--sol-base3)";
        btn.style.boxShadow = "0 2px 8px rgba(0, 43, 54, 0.15)";
      } else {
        btn.style.background = "transparent";
        btn.style.color = "var(--sol-base01);";
        btn.style.boxShadow = "none";
      }
    };

    // Appliquer le style initial
    setStyle(opt === activeValue);

    // Écouteur d'événement au clic
    btn.addEventListener("click", () => {
      if (container.value === opt) return;
      
      container.value = opt;
      // Mettre à jour les styles de tous les boutons
      buttons.forEach(b => b.setStyle(b.opt === opt));
      
      // Déclencher l'événement 'input' pour la réactivité OJS
      container.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // Attacher des références pour les mises à jour dynamiques
    btn.opt = opt;
    btn.setStyle = setStyle;

    container.appendChild(btn);
    return btn;
  });

  return container;
};

/**
 * 🏷️ Label / Titre de contrôle
 */
export const label = (text) => {
  const el = document.createElement('span');
  el.className = 'atom-label';
  el.innerText = text;
  return el;
};