-- _extensions/aptitek/filetree/filetree.lua

return {
  ["filetree"] = function(args, kwargs)
    local folder = args[1]
    if not folder then return pandoc.Strong("❌ Erreur: Dossier manquant") end

    -- ID Unique pour gérer l'affichage conditionnel
    local clean_id = folder:gsub("/", "_"):gsub("\\", "_"):gsub("%.", "")
    local frame_name = "viewer_" .. clean_id
    local container_id = "ide_" .. clean_id

    local py_script = [[
import os, sys, shutil, zipfile, urllib.parse

# CONFIGURATION
root_folder = "]] .. folder .. [["
frame_name = "]] .. frame_name .. [["
container_id = "]] .. container_id .. [["

if not os.path.exists(root_folder):
    print(f"<div style='color:red; border:1px solid red; padding:10px'>❌ Dossier introuvable: {root_folder}</div>")
    sys.exit()

# --- A. ZIP DYNAMIQUE (Nom du dossier) ---
# On normalise le chemin pour éviter les slashs de fin qui faussent le basename
folder_name = os.path.basename(os.path.normpath(root_folder))
zip_filename = f"{folder_name}.zip"

zip_path = os.path.join(root_folder, zip_filename)
zip_web_path = f"/{root_folder}/{zip_filename}"

# Création du ZIP (Silencieuse)
try:
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(root_folder):
            for file in files:
                # On ne met PAS le zip lui-même DANS le zip, ni les fichiers cachés
                if file == zip_filename or file.startswith('.') or file == "__pycache__" or file == "_site": 
                    continue
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, root_folder)
                zipf.write(file_path, arcname)
except: pass

# --- B. HTML GENERATION ---
html = '<ul class="file-tree-list">'

def scan(path):
    res = ""
    try:
        # Tri : Dossiers d'abord, puis fichiers (insensible à la casse)
        items = sorted(os.listdir(path), key=lambda x: (not os.path.isdir(os.path.join(path, x)), x.lower()))
    except: return ""

    for item in items:
        # --- FILTRAGE STRICT (C'est ici que ça se passe) ---
        # 1. item.startswith('.') -> Cache .git, .DS_Store, .env...
        # 2. item == zip_filename -> Cache le zip qu'on vient de créer
        # 3. __pycache__ -> Cache le dossier technique Python
        if (item.startswith('.') or 
            item == "__pycache__" or 
            item == "_site" or 
            item == zip_filename): 
            continue
        
        full_path = os.path.join(path, item)
        web_path = "/" + full_path.replace(os.sep, "/")
        
        # JS pour afficher le panneau au clic (Layout Toggle)
        activate_js = f"document.getElementById('{container_id}').classList.add('is-active')"

        if os.path.isdir(full_path):
            icon_html = '<i class="bi bi-folder-fill" style="margin-right:5px; color:#b58900;"></i>'
            # Appel récursif
            res += f'<li class="folder"><details open><summary>{icon_html}{item}</summary><ul>' + scan(full_path) + '</ul></details></li>'
        else:
            ext = os.path.splitext(item)[1].lower()
            icon_cls = "bi-file-earmark"
            
            # Logique Icônes / URLs
            if ext == ".ipynb":
                icon_cls = "bi-journal-code"
                final_url = f"/lab/index.html?path={item}&theme=JupyterLab Dark"
            elif ext in ['.png', '.jpg', '.jpeg', '.gif', '.svg']:
                icon_cls = "bi-file-earmark-image"
                final_url = web_path
            elif ext == ".pdf":
                icon_cls = "bi-file-earmark-pdf"
                final_url = web_path
            elif ext in ['.py', '.java', '.js', '.ts', '.html', '.css', '.scss', '.json', '.xml', '.qmd', '.md']:
                icon_cls = "bi-file-earmark-code"
                safe_path = urllib.parse.quote(web_path)
                final_url = f"/assets/viewer.html?file={safe_path}"
            else:
                safe_path = urllib.parse.quote(web_path)
                final_url = f"/assets/viewer.html?file={safe_path}"

            icon_html = f'<i class="bi {icon_cls}"></i>'
            
            res += f'<li class="file"><a href="{final_url}" target="{frame_name}" onclick="{activate_js}">{icon_html} {item}</a></li>'
            
    return res

zip_icon = '<i class="bi bi-file-earmark-zip-fill"></i>'

print(f"""
<div class="ide-container" id="{container_id}">
  <div class="ide-sidebar">
    <div class="ide-header-row">
        <span class="ide-title">{folder_name}</span>
        <a href="{zip_web_path}" class="ide-download-btn" title="Télécharger {zip_filename}">{zip_icon} ZIP</a>
    </div>
    {html + scan(root_folder) + "</ul>"}
  </div>
  <div class="ide-main">
    <iframe name="{frame_name}" src="about:blank" onload="this.style.opacity=1"></iframe>
  </div>
</div>
""")
]]

    local handle = io.popen("python3 -c \"" .. py_script:gsub('"', '\\"') .. "\"")
    local result = handle:read("*a")
    handle:close()

    if result == "" or result == nil then
        handle = io.popen("python -c \"" .. py_script:gsub('"', '\\"') .. "\"")
        result = handle:read("*a")
        handle:close()
    end
    
    if result == "" or result == nil then return pandoc.RawBlock('html', "❌ Erreur Python") end
    return pandoc.RawBlock('html', result)
  end
}