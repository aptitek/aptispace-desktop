// ==========================================
// index.js - Le Point d'Entrée Global
// ==========================================
import { theme } from "./core.js";
import * as atom from "./atom.js";
import * as mol from "./mol.js";
import * as org from "./org.js";

export { theme };

export const ui = {
  // 1. Accès hiérarchique préservé (pour la clarté architecturale si besoin)
  atom,
  mol,
  org,
  
  // 2. Création des alias directs à la racine
  ...atom,
  ...mol,
  ...org,
  
  // 3. Source de vérité dynamique pour les couleurs CSS
  get colors() {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return {};
    }
    const getCssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return {
      green: getCssVar('--sol-green'),
      blue: getCssVar('--sol-blue'),
      orange: getCssVar('--sol-orange'),
      red: getCssVar('--sol-red'),
      yellow: getCssVar('--sol-yellow'),
      base03: getCssVar('--sol-base03'),
      base02: getCssVar('--sol-base02'),
      base01: getCssVar('--sol-base01'),
      base00: getCssVar('--sol-base00'),
      base0: getCssVar('--sol-base0'),
      base1: getCssVar('--sol-base1'),
      base2: getCssVar('--sol-base2'),
      base3: getCssVar('--sol-base3'),
      violet: getCssVar('--sol-violet'),
      cyan: getCssVar('--sol-cyan'),
      magenta: getCssVar('--sol-magenta')
    };
  },

  // 4. Configurations graphiques globales (Source de vérité visuelle)
  get chart() {
    return {
      height: "350px",
      lineWidth: 3,
      markerSize: 12,
      markerLineWidth: 2
    };
  },

  // 5. Utilitaire vital pour qu'Observable (OJS) affiche du HTML brut
  render: (htmlString) => {
    const container = document.createElement('div');
    container.innerHTML = htmlString;
    return container;
  },

  // 6. Utilitaire d'opacité couleur pour Plotly et OJS (Convertit Hex ou RGB en RGBA)
  rgba: (color, alpha) => {
    if (!color) return color;
    if (color.includes('rgb')) {
      const matches = color.match(/\d+/g);
      if (matches && matches.length >= 3) {
        return `rgba(${matches[0]}, ${matches[1]}, ${matches[2]}, ${alpha})`;
      }
    }
    const hex = color.replace('#', '').trim();
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
  }
};

// Global fallback for OJS
if (typeof window !== "undefined") {
  window.ui = ui;
  window.theme = theme;
}

// ==========================================
// 11. DYNAMIC CODE BLOCKS DECORATOR (Tabs & macOS Controls)
// ==========================================

const decorateCodeBlocks = () => {
  if (typeof document === "undefined") return;
  
  // 1. Process Quarto code blocks with custom filenames
  const filenameWrappers = document.querySelectorAll(".code-with-filename");
  filenameWrappers.forEach(wrapper => {
    // If wrapper is inside a tabset, skip filename/header addition and let tabset handle it!
    if (wrapper.closest(".tab-pane")) {
      const fileDiv = wrapper.querySelector(".code-with-filename-file");
      if (fileDiv) fileDiv.style.display = "none";
      return;
    }
    
    const fileDiv = wrapper.querySelector(".code-with-filename-file");
    const sourceCode = wrapper.querySelector("div.sourceCode");
    if (fileDiv && sourceCode) {
      const filename = fileDiv.textContent.trim();
      fileDiv.style.display = "none"; // Hide standard Quarto filename label
      
      const pre = sourceCode.querySelector("pre");
      if (pre && !pre.dataset.hasHeader) {
        // Determine language from pre/code class list
        let lang = "code";
        pre.classList.forEach(cls => {
          if (cls !== "sourceCode" && cls !== "code-with-filename" && cls !== "cell-code" && cls !== "code-with-copy") {
            lang = cls;
          }
        });
        const lowerLang = lang.toLowerCase();
        
        // Choose tab icon and window theme based on language/filename
        const isDark = (lowerLang === "sh" || lowerLang === "bash" || filename.endsWith(".sh") || filename.endsWith(".bash"));
        let icon = "bi-file-earmark-code";
        if (isDark) {
          icon = "bi-terminal-fill";
          sourceCode.classList.add("ui-macos-dark");
        } else {
          sourceCode.classList.add("ui-macos-light");
        }
        
        const header = document.createElement("div");
        header.className = "ui-code-header ui-macos-header";
        header.innerHTML = `
          <div class="ui-code-tabs">
            <div class="ui-code-tab">
              <i class="bi ${icon} ui-code-tab-icon"></i>
              <span class="ui-code-tab-title">${filename}</span>
            </div>
          </div>
        `;
        pre.parentNode.insertBefore(header, pre);
        pre.dataset.hasHeader = "true";
      }
    }
  });

  // 2. Process all other standard Quarto code blocks
  const codeDivs = document.querySelectorAll("div.sourceCode");
  codeDivs.forEach(div => {
    // If inside a tabset pane, skip decoration completely!
    if (div.closest(".tab-pane")) return;
    
    const pre = div.querySelector("pre");
    if (!pre || pre.dataset.hasHeader === "true") return;
    
    // Determine language from pre/code class list
    let lang = "code";
    pre.classList.forEach(cls => {
      if (cls !== "sourceCode" && cls !== "code-with-filename" && cls !== "cell-code" && cls !== "code-with-copy") {
        lang = cls;
      }
    });
    
    // Capitalize beautifully and map specific short names
    let displayLang = lang;
    const lowerLang = lang.toLowerCase();
    if (lowerLang === "py" || lowerLang === "python") displayLang = "Python";
    else if (lowerLang === "js" || lowerLang === "javascript") displayLang = "JavaScript";
    else if (lowerLang === "sh" || lowerLang === "bash") displayLang = "Terminal";
    else if (lowerLang === "yml" || lowerLang === "yaml") displayLang = "YAML";
    else if (lowerLang === "html") displayLang = "HTML";
    else if (lowerLang === "css") displayLang = "CSS";
    else if (lowerLang === "scss") displayLang = "SCSS";
    else if (lowerLang === "json") displayLang = "JSON";
    else if (lowerLang === "r") displayLang = "R";
    else if (lowerLang === "sql") displayLang = "SQL";
    else displayLang = lang.charAt(0).toUpperCase() + lang.slice(1);
    
    // Choose tab icon and window theme based on language
    let icon = "bi-file-earmark-code";
    const isDark = (lowerLang === "sh" || lowerLang === "bash");
    if (isDark) {
      icon = "bi-terminal-fill";
      div.classList.add("ui-macos-dark");
    } else {
      div.classList.add("ui-macos-light");
    }
    
    const header = document.createElement("div");
    header.className = "ui-code-header ui-macos-header";
    header.innerHTML = `
      <div class="ui-code-tabs">
        <div class="ui-code-tab">
          <i class="bi ${icon} ui-code-tab-icon"></i>
          <span class="ui-code-tab-title">${displayLang}</span>
        </div>
      </div>
    `;
    pre.parentNode.insertBefore(header, pre);
    pre.dataset.hasHeader = "true";
  });

  // 3. Mark Pyodide interactive exercises with our unified header class
  const exercises = document.querySelectorAll(".card.exercise-editor");
  exercises.forEach(ex => {
    const header = ex.querySelector(".card-header");
    if (header) {
      header.classList.add("ui-macos-header");
      header.classList.add("ui-pyodide-header");
      ex.classList.add("ui-macos-light"); // Make exercise-editor explicitly light theme!
    }
  });
};

const translateExerciseButtons = (header) => {
  if (!header) return;
  const parentCard = header.closest(".card.exercise-editor");
  if (!parentCard) return;
  
  const buttons = parentCard.querySelectorAll("button, a.btn");
  buttons.forEach(btn => {
    const textNodes = [];
    const walk = document.createTreeWalker(btn, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walk.nextNode()) {
      textNodes.push(node);
    }
    
    textNodes.forEach(node => {
      const text = node.textContent.trim().toUpperCase();
      if (text === "START OVER") {
        node.textContent = " Recommencer";
      } else if (text === "RUN CODE") {
        node.textContent = " Exécuter";
      }
    });
  });
};

const decorateExerciseHeader = (header) => {
  if (!header) return;
  
  // If already decorated, skip to avoid duplicate tabs or infinite recursion
  if (header.querySelector(".ui-code-tabs")) {
    translateExerciseButtons(header);
    return;
  }
  
  // Find any inner div containing exactly the title "Exercise" to remove it
  const titleDivs = header.querySelectorAll("div");
  titleDivs.forEach(div => {
    const text = div.textContent.trim().toLowerCase();
    if (text === "exercise" && div.childNodes.length === 1 && div.childNodes[0].nodeType === Node.TEXT_NODE) {
      div.style.display = "none";
    }
  });

  // Extract and clear direct text nodes just in case
  const childNodes = Array.from(header.childNodes);
  for (const node of childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const trimmed = node.textContent.trim().toLowerCase();
      if (trimmed.includes("exercise")) {
        node.textContent = "";
      }
    }
  }
  
  // Create tabs container
  const tabsContainer = document.createElement("div");
  tabsContainer.className = "ui-code-tabs";
  tabsContainer.innerHTML = `
    <div class="ui-code-tab">
      <i class="bi bi-cpu-fill ui-code-tab-icon"></i>
      <span class="ui-code-tab-title">Exercice</span>
    </div>
  `;
  
  // Prepend the tab container at the very beginning of the header
  header.prepend(tabsContainer);
  translateExerciseButtons(header);
};

const setupExerciseObserver = () => {
  if (typeof document === "undefined") return;
  
  const runDecoration = () => {
    const headers = document.querySelectorAll(".card.exercise-editor .card-header");
    headers.forEach(header => {
      decorateExerciseHeader(header);
      translateExerciseButtons(header);
    });
  };

  // Run immediately
  runDecoration();
  
  // 1. Observe DOM mutations (for performance and responsiveness)
  const observer = new MutationObserver(runDecoration);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  // 2. Poll periodically (fail-proof fallback against React/Preact Virtual DOM overrides on status/run changes)
  setInterval(runDecoration, 150);
};

// Robust initial execution
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      decorateCodeBlocks();
      setupExerciseObserver();
    });
  } else {
    decorateCodeBlocks();
    setupExerciseObserver();
  }
}