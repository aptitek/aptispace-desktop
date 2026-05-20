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
    positive: "text-success",
    negative: "text-danger",
    warning: "text-warning",
    neutral: "text-info"
  };
  const colorClass = trendClassMap[trend] || trendClassMap.neutral;

  return `
    <div class="card card-metric">
      <div class="card-metric-title">${title}</div>
      <div class="card-metric-value ${colorClass}">${utils.formatNumber(value)}</div>
      ${subtitle ? `<div class="text-muted" style="font-size: 0.85em;">${subtitle}</div>` : ''}
    </div>
  `;
};

/**
 * 📊 Ligne d'Observation
 */
export const dataRow = ({ index, dataObject }) => {
  const columnsHtml = Object.entries(dataObject).map(([key, value]) => {
    const typeObj = typeof value;
    
    return `
      <div class="col-sm-6 col-md-4 col-lg-3 mb-2">
        <div class="small text-muted text-uppercase" style="font-size: 0.7em;">${key}</div>
        <div class="d-flex align-items-center gap-2">
          <span class="text-truncate fw-semibold text-body" title="${value}">${utils.truncateText(String(value), 30)}</span>
          <span class="badge bg-light text-dark font-monospace" style="font-size: 0.65em; border: 1px solid var(--sol-base1, rgba(88, 110, 117, 0.1));">${typeObj}</span>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="card mb-3 shadow-none border" style="border: 1px solid var(--sol-base1, rgba(88, 110, 117, 0.12)); background: var(--sol-base3, #fdf6e3);">
      <div class="card-header bg-light py-1 px-3 d-flex justify-content-between align-items-center" style="background-color: var(--sol-base2, #eee8d5) !important; border-bottom: 1px solid var(--sol-base1, rgba(88, 110, 117, 0.08));">
        <span class="small fw-bold text-uppercase text-muted" style="font-size: 0.75em; color: var(--sol-base01, #93a1a1) !important;">Index: ${index}</span>
      </div>
      <div class="card-body py-2 px-3">
        <div class="row">
          ${columnsHtml}
        </div>
      </div>
    </div>
  `;
};

/**
 * 🎨 Espace Vectoriel / Canvas (Standardized to Card & Canvas classes)
 */
export const vectorSpace = ({ content = "", height = "250px", label = "Espace Vectoriel" }) => `
  <div class="card card-window mb-4">
    ${label ? `<div class="card-header card-window-header">${label}</div>` : ''}
    <div class="card-body p-0">
      <div class="canvas border-0 m-0 rounded-0" style="height: ${height}; min-height: ${height};">
        ${content}
      </div>
    </div>
  </div>
`;

/**
 * ⚖️ Grille de Comparaison (Standardized to Bootstrap Grid Rows)
 */
export const comparisonLayout = ({ leftTitle, leftContent, rightTitle, rightContent }) => `
  <div class="row align-items-center mb-4">
    <div class="col-md-5 mb-3 mb-md-0">
      <div class="card card-window m-0">
        <div class="card-header card-window-header">${leftTitle}</div>
        <div class="card-body">${leftContent}</div>
      </div>
    </div>
    <div class="col-md-2 text-center mb-3 mb-md-0" style="font-size: 1.5rem;">
      ➡️
    </div>
    <div class="col-md-5">
      <div class="card card-window m-0">
        <div class="card-header card-window-header">${rightTitle}</div>
        <div class="card-body">${rightContent}</div>
      </div>
    </div>
  </div>
`;

/**
 * 🎛️ Toggle Switcher (Standardized to Bootstrap Button Groups)
 * Compatible with Observable's viewof syntax
 */
export const toggle = ({ label: labelText, options, value, states, layout = 'horizontal' }) => {
  const container = document.createElement('div');
  container.className = `d-flex ${layout === 'horizontal' ? 'align-items-center gap-3' : 'flex-column gap-2'} mb-3`;

  if (labelText) {
    const labelEl = document.createElement('span');
    labelEl.className = 'fw-bold small text-muted text-uppercase';
    labelEl.style.fontSize = '0.75rem';
    labelEl.innerText = labelText;
    container.appendChild(labelEl);
  }

  const group = document.createElement('div');
  group.className = 'btn-group';
  group.setAttribute('role', 'group');

  const isObjectOptions = !Array.isArray(options);
  const keys = isObjectOptions ? Object.keys(options) : options;

  keys.forEach(key => {
    const displayValue = isObjectOptions ? options[key] : key;
    const btn = document.createElement('button');
    btn.type = 'button';
    
    // Choose standard Bootstrap button styles based on state
    let btnOutlineClass = 'btn-outline-primary';
    if (states && states[key]) {
      const state = states[key];
      if (state === 'success') btnOutlineClass = 'btn-outline-success';
      else if (state === 'danger') btnOutlineClass = 'btn-outline-danger';
      else if (state === 'warning') btnOutlineClass = 'btn-outline-warning';
      else if (state === 'info') btnOutlineClass = 'btn-outline-info';
    }
    
    btn.className = `btn btn-sm ${btnOutlineClass} ${key === value ? 'active' : ''}`;
    btn.innerText = displayValue;
    
    btn.onclick = () => {
      if (container.value === key) return;
      group.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
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