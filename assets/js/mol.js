// ==========================================
// mol.js - Les Molécules (DRY/KISS)
// ==========================================
import { theme, utils } from "./core.js";

/**
 * 🎛️ Terminal Console
 */
export const terminalConsole = ({ header = "Processus", logs = [] }) => {
  const logContent = logs.map((log, index) => {
    const delay = (index * 0.2).toFixed(2);
    let message = "";
    let type = "info";
    if (typeof log === 'string') {
      message = log;
    } else if (log) {
      message = log.message || "";
      type = log.type || "info";
    }
    const textClass = type === "danger" ? "text-danger" : (type === "warning" ? "text-warning" : (type === "muted" ? "text-muted" : "text-success"));
    return `<div class="${textClass} reveal-lines" style="animation-delay: ${delay}s; font-family: var(--font-code, monospace); margin-bottom: 4px;">&gt; ${message}</div>`;
  }).join('');

  return `
    <div class="card card-window" style="border: 1px solid var(--sol-base1); background: var(--sol-base3);">
      <div class="card-header card-window-header">${header}</div>
      <div class="card-body" style="background: var(--sol-base2); padding: 15px; min-height: 100px;">
        ${logContent || '<div class="text-muted" style="font-family: var(--font-code, monospace);">&gt; Aucune donnée</div>'}
      </div>
    </div>
  `;
};

/**
 * 📈 Carte de Métrique
 */
export const metricCard = ({ title, value, subtitle = "", trend = "neutral" }) => {
  const trendClassMap = {
    positive: "is-success",
    negative: "is-danger",
    warning: "is-warning",
    neutral: "is-debug"
  };
  const colorClass = trendClassMap[trend] || trendClassMap.neutral;

  return `
    <div class="ui-card ${colorClass}" style="flex: 1; min-width: 150px;">
      <div class="ui-card-header">${title}</div>
      <div class="ui-card-body">
        <div class="ui-value atom-text-value">${utils.formatNumber(value)}</div>
        ${subtitle ? `<div style="font-size: 0.85em; color: var(--sol-base01); margin-top: 4px;">${subtitle}</div>` : ''}
      </div>
    </div>
  `;
};

/**
 * 📊 Ligne d'Observation
 */
export const dataRow = ({ index, dataObject }) => {
  const columnsHtml = Object.entries(dataObject).map(([key, value]) => {
    const typeObj = typeof value;
    const badgeClass = typeObj === 'number' ? 'is-info' : (typeObj === 'string' ? 'is-success' : '');
    
    return `
      <div class="ui-data-cell">
        <span class="label">${key}</span>
        <div style="display: flex; gap: 8px; align-items: center;">
          <span class="value">${utils.truncateText(String(value), 30)}</span>
          <span class="badge ${badgeClass}">${typeObj}</span>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="ui-data-row">
      <div style="font-size: 0.75em; color: var(--sol-base01); margin-bottom: 10px; text-transform: uppercase; font-weight: bold;">
        Index: <span class="badge">${index}</span>
      </div>
      ${columnsHtml}
    </div>
  `;
};

/**
 * 🧩 Texte Tokenisé
 */
export const tokenizedText = ({ tokens = [], highlightIndex = -1 }) => {
  const tokensHtml = tokens.map((token, i) => {
    const isHighlighted = i === highlightIndex;
    const colorClass = isHighlighted ? "is-info" : "";
    return `<span class="badge ${colorClass}">${token}</span>`;
  }).join('<span style="margin: 0 2px;"></span>');

  return `
    <div style="display: flex; flex-wrap: wrap; gap: 6px; padding: 12px; background: rgba(var(--sol-base03-rgb), 0.03); border-radius: 8px;">
      ${tokensHtml}
    </div>
  `;
};

/**
 * 🎨 Espace Vectoriel / Canvas
 */
export const vectorSpace = ({ content = "", height = "250px", label = "Espace Vectoriel" }) => `
  <div class="ui-canvas" style="height: ${height};">
    ${label ? `<div style="position: absolute; top: 10px; left: 15px; z-index: 10;"><div class="ui-card-header atom-text-label">${label}</div></div>` : ''}
    <div style="width: 100%; height: 100%; position: relative;">
      ${content}
    </div>
  </div>
`;

/**
 * ⚖️ Grille de Comparaison
 */
export const comparisonLayout = ({ leftTitle, leftContent, rightTitle, rightContent }) => `
  <div class="ui-comparison">
    <div class="ui-comparison-panel">
      <div class="ui-card-header" style="padding-left: 0; margin-bottom: 10px; background: transparent; color: inherit;">${leftTitle}</div>
      ${leftContent}
    </div>
    <div class="ui-comparison-arrow">➡️</div>
    <div class="ui-comparison-panel">
      <div class="ui-card-header" style="padding-left: 0; margin-bottom: 10px; background: transparent; color: inherit;">${rightTitle}</div>
      ${rightContent}
    </div>
  </div>
`;

/**
 * 🎛️ Toggle Switcher (Replicated from IA)
 * Compatible with Observable's viewof syntax
 */
export const toggle = ({ label: labelText, options, value, states, layout = 'horizontal' }) => {
  const container = document.createElement('div');
  container.className = `mol-toggle ${layout === 'horizontal' ? 'is-horizontal' : ''}`;

  if (labelText) {
    const labelEl = document.createElement('span');
    labelEl.className = 'atom-label';
    labelEl.innerText = labelText;
    container.appendChild(labelEl);
  }

  const group = document.createElement('div');
  group.className = 'toggle-group';

  const isObjectOptions = !Array.isArray(options);
  const keys = isObjectOptions ? Object.keys(options) : options;

  keys.forEach(key => {
    const displayValue = isObjectOptions ? options[key] : key;
    const btn = document.createElement('button');
    btn.className = `toggle-option ${key === value ? 'active' : ''}`;

    // Semantic states (info, success, warning, danger)
    if (states && states[key]) {
      btn.setAttribute('data-state', states[key]);
    }

    btn.innerText = displayValue;
    btn.onclick = () => {
      if (container.value === key) return;
      group.querySelectorAll('.toggle-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      container.value = key;
      container.dispatchEvent(new Event("input", { bubbles: true }));
    };
    group.appendChild(btn);
  });

  container.appendChild(group);
  container.value = value;
  return container;
};