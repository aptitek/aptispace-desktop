// ==========================================
// core.js - Design Tokens & Utilitaires
// ==========================================

/**
 * 🎨 THEME GLOBAL (Palette Solarized Dark + Standard)
 * Toute modification de couleur ici se répercutera instantanément 
 * sur 100% de tes composants (terminaux, matrices, alertes, etc.)
 */
export const theme = {
  colors: {
    // Fonds
    background: "transparent", 
    surface: "rgba(var(--sol-base03-rgb), 0.2)",       // Solarized Base03 (Dark) with opacity
    surfaceHover: "rgba(var(--sol-base03-rgb), 0.3)",
    
    // Texte
    text: "var(--sol-base0)",                     // Solarized Base0 (Gris principal)
    textMuted: "var(--sol-base01)",                // Solarized Base01 (Gris discret)
    
    // Couleurs Sémantiques (Palette Solarized stricte via CSS variables)
    primary: "var(--sol-yellow)",                  // Jaune Solarized
    success: "var(--sol-green)",                  // Vert Solarized
    warning: "var(--sol-orange)",                  // Orange Solarized
    danger: "var(--sol-red)",                   // Rouge Solarized
    info: "var(--sol-blue)",                     // Bleu Solarized
    debug: "var(--sol-violet)",                    // Violet Solarized

    // Spécifique aux terminaux (Alignés sur Solarized)
    terminalBg: "var(--sol-base03)",
    terminalText: "var(--sol-green)",
    terminalMuted: "var(--sol-base01)"
  },
  
  // Tailles et espacements
  radius: "8px",
  radiusSmall: "4px",
  
  // Typographie (Alignée sur le _quarto.yml)
  fontSans: '"Recursive", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontMono: '"Recursive", SFMono-Regular, Menlo, Monaco, Consolas, monospace'
};

/**
 * 📊 Plotly Solarized Theme Template
 * Consumes CSS custom design tokens as the single source of truth.
 * When the light/dark theme switches, Plotly automatically conforms!
 */
export const solarizedTemplate = {
  layout: {
    font: {
      family: "var(--font-code, Consolas, monospace)",
      color: "var(--sol-base00, #657b83)"
    },
    paper_bgcolor: "var(--sol-base3, #fdf6e3)",
    plot_bgcolor: "var(--sol-base2, #eee8d5)",
    colorway: [
      "var(--sol-blue, #268bd2)",
      "var(--sol-orange, #cb4b16)",
      "var(--sol-green, #859900)",
      "var(--sol-yellow, #b58900)"
    ]
  }
};

/**
 * 🎨 Dynamic theme color resolver
 * Retrieves the computed color of a CSS variable at runtime.
 */
export const getThemeColor = (varName, fallback) => {
  if (typeof window !== "undefined") {
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    if (value) return value;
  }
  return fallback;
};

/**
 * 📊 Plotly Solarized Theme Template (Resolved at runtime)
 * Call this function to get a snapshot of the active theme colors.
 */
export const getPlotlyTheme = () => ({
  layout: {
    font: {
      family: getThemeColor("--font-code", "Consolas, monospace"),
      color: getThemeColor("--sol-base00", "#657b83")
    },
    paper_bgcolor: getThemeColor("--sol-base3", "#fdf6e3"),
    plot_bgcolor: getThemeColor("--sol-base2", "#eee8d5"),
    colorway: [
      getThemeColor("--sol-blue", "#268bd2"),
      getThemeColor("--sol-orange", "#cb4b16"),
      getThemeColor("--sol-green", "#859900"),
      getThemeColor("--sol-yellow", "#b58900")
    ]
  }
});

/**
 * 🛠️ FONCTIONS UTILITAIRES PURES
 * Fonctions agnostiques accessibles par toutes les molécules et organismes
 */
export const utils = {
  
  // Génère un ID unique (utile si tu dois lier un label HTML à un input généré par JS)
  generateId: () => 'aptitek_' + Math.random().toString(36).substr(2, 9),
  
  // Formate les nombres proprement avec la méthode standard toLocaleString
  formatNumber: (num, decimals = 3) => typeof num === 'number' ? num.toLocaleString(undefined, { maximumFractionDigits: decimals }) : num,

  // Tronque une chaîne avec la méthode standard slice
  truncateText: (str, maxLength = 50) => typeof str === 'string' && str.length > maxLength ? str.slice(0, maxLength) + "…" : str
};