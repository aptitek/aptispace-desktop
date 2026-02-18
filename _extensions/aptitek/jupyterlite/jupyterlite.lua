-- _extensions/aptitek/jupyterlite/jupyterlite.lua

return {
  ["jupyterlite"] = function(args, kwargs)
    local path = args[1]
    if not path then return pandoc.Strong("❌ Erreur: Chemin manquant") end

    -- Logic to convert "lab/TP1/notebook.ipynb" -> "TP1/notebook.ipynb"
    -- Assumes structure: project_root/lab/...

    local clean_path = path
    if path:sub(1, 4) == "lab/" then
      clean_path = path:sub(5)
    elseif path:sub(1, 4) == "lab\\" then
      clean_path = path:sub(5)
    end

    -- URL Construction
    -- Reverted theme to generic 'JupyterLab Light'
    local url = "/lite/lab/index.html?path=" .. clean_path .. "&theme=JupyterLab Light&mode=single-document"

    -- unique ID for this iframe
    local iframe_id = "jupyterlite-" .. tostring(os.time()) .. "-" .. tostring(math.random(10000))

    -- Read CSS content
    local css_content = ""
    local f = io.open("_extensions/aptitek/jupyterlite/solarized-light.css", "r")
    if f then
      css_content = f:read("*all")
      f:close()
      -- Optimize CSS for JS injection: remove newlines/tabs to avoid string issues
      css_content = css_content:gsub("[\r\n]+", " "):gsub('"', "'")
    end

    -- JS for Injection
    local script = string.format([[
<script>
  (function() {
    var iframe = document.getElementById('%s');
    if (iframe) {
      iframe.onload = function() {
        try {
          var doc = iframe.contentDocument || iframe.contentWindow.document;
          var style = doc.createElement('style');
          style.textContent = "%s";
          doc.head.appendChild(style);

          // Attempt to collapse sidebar after app load
          var attempts = 0;
          var maxAttempts = 20; // Try for 10 seconds (500ms * 20)
          var interval = setInterval(function() {
            try {
              // Look for the active sidebar tab (highlighted)
              // In JupyterLab 3/4, selected tabs often have '.lm-mod-current' or 'jp-mod-current'
              var activeTab = doc.querySelector('.lm-TabBar-tab.lm-mod-current');
              
              // Also check if the sidebar is actually visible/expanded
              // The dock panel usually has an id or class, but checking for active tab is a good proxy.
              // If we find an active tab in the left area, clicking it toggles the sidebar off.
              if (activeTab) {
                activeTab.click();
                clearInterval(interval);
                // console.log('JupyterLite Sidebar collapsed via injection');
              }
              
              attempts++;
              if (attempts >= maxAttempts) {
                clearInterval(interval);
              }
            } catch(err) {
              console.warn('JupyterLite Sidebar Check Failed:', err);
              clearInterval(interval);
            }
          }, 500);

        } catch(e) {
          console.warn('JupyterLite Injection Failed:', e);
        }
      };
    }
  })();
</script>
    ]], iframe_id, css_content)

    -- HTML Output
    return pandoc.RawBlock('html', string.format([[
<div class="jupyterlite-container">
  <div class="jupyterlite-header">
    <i class="bi bi-journal-code"></i> %s
    <a href="%s" target="_blank" class="jupyterlite-fullscreen" title="Ouvrir en grand"><i class="bi bi-box-arrow-up-right"></i></a>
  </div>
  <iframe id="%s" src="%s" loading="lazy"></iframe>
</div>
%s
    ]], clean_path, url, iframe_id, url, script))
  end
}
