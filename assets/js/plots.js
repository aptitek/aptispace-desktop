// ==========================================
// plots.js - Composants Graphiques Plotly Standardisés
// ==========================================
import { getPlotlyTheme } from "./core.js";

/**
 * 📈 Scatter Plot (Nuage de points)
 */
export function createScatter(divId, data, title = "Graphique", options = {}) {
  const trace = {
    x: data.x,
    y: data.y,
    mode: options.mode || 'markers',
    type: 'scatter',
    marker: {
      size: options.markerSize || 8,
      opacity: options.opacity || 0.8,
      ...options.marker
    },
    ...options.trace
  };

  const layout = {
    title: {
      text: title,
      font: { size: 16 }
    },
    template: getPlotlyTheme(),
    margin: { t: 50, b: 50, l: 50, r: 50 },
    ...options.layout
  };

  const config = {
    responsive: true,
    displayModeBar: false,
    ...options.config
  };

  Plotly.newPlot(divId, [trace], layout, config);
}

/**
 * 📉 Line Chart (Courbe)
 */
export function createLine(divId, data, title = "Graphique", options = {}) {
  const trace = {
    x: data.x,
    y: data.y,
    mode: options.mode || 'lines+markers',
    type: 'scatter',
    line: {
      shape: options.shape || 'spline',
      width: options.lineWidth || 3,
      ...options.line
    },
    marker: {
      size: options.markerSize || 6,
      ...options.marker
    },
    ...options.trace
  };

  const layout = {
    title: {
      text: title,
      font: { size: 16 }
    },
    template: getPlotlyTheme(),
    margin: { t: 50, b: 50, l: 50, r: 50 },
    ...options.layout
  };

  const config = {
    responsive: true,
    displayModeBar: false,
    ...options.config
  };

  Plotly.newPlot(divId, [trace], layout, config);
}

/**
 * 📊 Bar Chart (Diagramme en bâtons)
 */
export function createBar(divId, data, title = "Graphique", options = {}) {
  const trace = {
    x: data.x,
    y: data.y,
    type: 'bar',
    marker: {
      opacity: options.opacity || 0.85,
      ...options.marker
    },
    ...options.trace
  };

  const layout = {
    title: {
      text: title,
      font: { size: 16 }
    },
    template: getPlotlyTheme(),
    margin: { t: 50, b: 50, l: 50, r: 50 },
    ...options.layout
  };

  const config = {
    responsive: true,
    displayModeBar: false,
    ...options.config
  };

  Plotly.newPlot(divId, [trace], layout, config);
}

/**
 * 🌪️ Funnel Area (Pyramide/Entonnoir)
 */
export function createFunnel(divId, data, options = {}) {
  const trace = {
    type: 'funnelarea',
    text: data.text,
    values: data.values,
    marker: { colors: options.colors },
    textinfo: "text",
    hoverinfo: "text",
    ...options.trace
  };

  const layout = {
    margin: { t: 10, b: 10, l: 10, r: 10 },
    paper_bgcolor: 'transparent',
    showlegend: false,
    ...options.layout
  };

  Plotly.newPlot(divId, [trace], layout, { displayModeBar: false, responsive: true, ...options.config });
}